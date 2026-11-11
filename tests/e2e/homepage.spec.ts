import { expect, test } from "@playwright/test";

test("homepage is completely blank", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toHaveText("");
  await expect(page.locator("body")).not.toContainText(/\\S/);
  await expect(page.locator(".site-header, main, footer, header, nav, button, a, input, textarea, select")).toHaveCount(0);
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

test("owner login provides email and password fields", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await expect(page.getByLabel("Email")).toHaveAttribute("type", "email");
  await expect(page.getByLabel("Password")).toHaveAttribute("type", "password");
  await expect(page.getByRole("link", { name: "Forgot password?" })).toHaveAttribute("href", "/login/recovery");
});
