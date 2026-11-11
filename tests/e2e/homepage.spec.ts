import { expect, test } from "@playwright/test";

test("homepage keeps a clean shell and separate logo and title controls", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/3B TECH HUB/);
  await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
  await expect(page.locator(".brand-logo")).toHaveAttribute("href", "/");
  await expect(page.locator(".brand-title")).toBeVisible();
  await expect(page.locator(".brand-title")).not.toHaveAttribute("href", /.*/);
  await expect(page.getByRole("heading", { name: /Technology solutions/i })).toHaveCount(0);
  await expect(page.getByText("Three Brothers · Technology Hub")).toHaveCount(0);
});

test("header search replaces the title and shows matching floating suggestions", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.locator(".brand-title")).toHaveCount(0);
  const input = page.getByRole("searchbox", { name: "Search the website" });
  await expect(input).toBeFocused();
  await input.fill("Gallery");
  await expect(page.getByRole("listbox", { name: "Search suggestions" }).getByRole("option", { name: "Gallery" })).toBeVisible();
});

test("menu and search close when clicking outside their floating panels", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Menu" }).click();
  await expect(page.getByRole("group", { name: "Website menu" })).toBeVisible();
  await page.locator(".home-clean-surface").click();
  await expect(page.getByRole("group", { name: "Website menu" })).toHaveCount(0);

  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.getByRole("searchbox", { name: "Search the website" })).toBeVisible();
  await page.locator(".home-clean-surface").click();
  await expect(page.getByRole("searchbox", { name: "Search the website" })).toHaveCount(0);
});
