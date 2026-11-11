import { expect, test } from "@playwright/test";

test("homepage displays the requested title and keeps the site header and footer", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".site-header")).toBeVisible();
  await expect(page.locator(".site-footer")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Three Brothers Technology Hub" })).toBeVisible();
});

test("public search trigger changes into a close control", async ({ page }) => {
  await page.goto("/gallery", { waitUntil: "networkidle" });
  await expect(page.locator(".site-header")).toHaveAttribute("data-hydrated", "true");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.getByRole("button", { name: "Close search" })).toBeVisible();
  await expect(page.getByRole("searchbox", { name: "Search the website" })).toBeVisible();
  await page.getByRole("button", { name: "Close search" }).click();
  await expect(page.getByRole("searchbox", { name: "Search the website" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Search" })).toBeVisible();
});

test("login stays simple and does not offer Google authentication", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByLabel("Email")).toHaveAttribute("type", "email");
  await expect(page.getByLabel("Password")).toHaveAttribute("type", "password");
  await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Google/i })).toHaveCount(0);
});
