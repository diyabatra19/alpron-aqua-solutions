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

test("desktop catalogue navigation exposes the major product groups", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "Desktop mega-menu coverage");
  await page.goto("/");
  await page.getByRole("button", { name: "Products" }).click();
  const menu = page.getByLabel("Product categories");
  await expect(menu.getByRole("link", { name: "Domestic RO Systems", exact: true })).toBeVisible();
  await expect(menu.getByRole("link", { name: "Commercial & Industrial RO Systems", exact: true })).toBeVisible();
  await expect(menu.getByRole("link", { name: "Water Chemicals", exact: true })).toBeVisible();
  await expect(menu.getByRole("link", { name: "Stainless Steel Water Coolers", exact: true })).toBeVisible();
  await expect(menu.getByRole("link", { name: "Water Softeners", exact: true })).toBeVisible();
});

test("category landing pages preserve empty states without fake products", async ({ page }) => {
  const response = await page.goto("/products/category/water-softeners");
  expect(response?.ok()).toBeTruthy();
  await expect(page.getByRole("heading", { level: 1, name: "Water Softeners" })).toBeVisible();
  await expect(page.getByText("No verified products are published in this category yet.")).toBeVisible();
});

test("mobile drawer provides expandable product navigation", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Mobile navigation coverage");
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  const drawer = page.getByRole("dialog", { name: "Site navigation" });
  await expect(drawer).toBeVisible();
  await expect(drawer.getByText("Domestic RO Systems", { exact: true })).toBeVisible();
  await expect(drawer.getByText("Commercial & Industrial RO Systems", { exact: true })).toBeVisible();
});

test("catalogue shows source-verified products without invented prices", async ({ page }) => {
  await page.goto("/products");
  await expect(page.getByText(/published products/)).toBeVisible();
  await expect(page.getByText(/₹|Rs\.? \d/i)).toHaveCount(0);
  const productLink = page.getByRole("link", { name: /Reverse Osmosis Water Purifiers/ });
  if (await productLink.count()) {
    await expect(productLink).toBeVisible();
    await productLink.click();
    await expect(page.getByRole("heading", { level: 1, name: "Reverse Osmosis Water Purifiers" })).toBeVisible();
    await expect(page.getByText("Get Latest Price")).toBeVisible();
  } else {
    await expect(page.getByRole("heading", { name: "No verified products are published here yet." })).toBeVisible();
  }
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
