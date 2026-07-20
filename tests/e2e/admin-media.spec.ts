import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";
import sharp from "sharp";

test("a super administrator can upload and delete a normalized image", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  test.setTimeout(60_000);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  test.skip(!url || !publishableKey || !serviceRoleKey, "Supabase is not configured.");

  const service = createClient(url!, serviceRoleKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const email = `playwright-media-${Date.now()}@example.invalid`;
  const password = `M!${randomBytes(24).toString("base64url")}7z`;
  const altText = `Temporary media verification ${Date.now()}`;
  let userId: string | undefined;

  try {
    const { data: created, error: createError } =
      await service.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
    expect(createError).toBeNull();
    userId = created.user?.id;
    expect(userId).toBeTruthy();

    const { error: profileError } = await service.from("admin_profiles").insert({
      user_id: userId!,
      role: "super_admin",
      display_name: "Playwright Media Verification",
      is_active: true,
    });
    expect(profileError).toBeNull();

    await page.waitForTimeout(1_500);
    await page.goto("/admin/login");
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await page.locator("#admin-email").fill(email);
      await page.locator("#admin-password").fill(password);
      await page.getByRole("button", { name: "Sign in securely" }).click();
      await page.waitForTimeout(1_200);
      if (/\/admin$/.test(page.url())) break;
    }
    await expect(page).toHaveURL(/\/admin$/, { timeout: 15_000 });

    await page.goto("/admin/media");
    const png = await sharp({
      create: {
        width: 48,
        height: 48,
        channels: 3,
        background: { r: 0, g: 153, b: 176 },
      },
    }).png().toBuffer();
    await page.locator('input[name="file"]').setInputFiles({
      name: "media-verification.png",
      mimeType: "image/png",
      buffer: png,
    });
    await page.locator('input[name="altText"]').fill(altText);
    await page.getByRole("button", { name: "Upload" }).click();
    await expect(page.getByRole("status")).toContainText(
      "Image uploaded and normalized to WebP.",
    );

    const asset = page.getByRole("article").filter({ hasText: altText });
    await expect(asset).toBeVisible();
    await asset.getByRole("button", { name: "Delete" }).click();
    await expect(asset).toHaveCount(0);
  } finally {
    const { data: leftovers } = await service
      .from("media_assets")
      .select("id,storage_path")
      .eq("alt_text", altText);
    for (const asset of leftovers || []) {
      await service.from("product_images").delete().eq("media_asset_id", asset.id);
      await service.from("media_assets").delete().eq("id", asset.id);
      await service.storage.from("product-media").remove([asset.storage_path]);
    }
    if (userId) {
      await service.from("audit_events").delete().eq("actor_id", userId);
      await service.auth.admin.deleteUser(userId, false);
    }
  }
});
