import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("public routes load without broken navigation", async ({ page }) => {
  test.setTimeout(60_000);
  const browserErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text());
  });
  page.on("pageerror", (error) => browserErrors.push(error.message));
  for (const route of ["/", "/products", "/about", "/contact", "/privacy-policy", "/terms"]) {
    const response = await page.goto(route);
    expect(response?.ok(), route).toBeTruthy();
    await expect(page.locator("body")).not.toContainText("Create Next App");
    await expect(page.locator("img:not([alt])")).toHaveCount(0);
  }
  expect(browserErrors).toEqual([]);
});

test("home has a single clear heading and no critical accessibility violations", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(results.violations).toEqual([]);
});

test("catalogue shows source-verified products without invented prices", async ({ page }) => {
  await page.goto("/products");
  await expect(page.getByText("6 published products")).toBeVisible();
  await expect(page.getByRole("link", { name: /Reverse Osmosis Water Purifiers/ })).toBeVisible();
  await expect(page.getByText(/₹|Rs\.? \d/i)).toHaveCount(0);
  await page.getByRole("link", { name: /Reverse Osmosis Water Purifiers/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Reverse Osmosis Water Purifiers" })).toBeVisible();
  await expect(page.getByText("Get Latest Price")).toBeVisible();
});

test("unknown pages use the custom 404", async ({ page }) => {
  const response = await page.goto("/does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "This page is not available." })).toBeVisible();
});

test("admin is not available anonymously", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByRole("heading", { name: "Administrator access" })).toBeVisible();
});
