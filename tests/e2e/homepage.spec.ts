import { expect, test } from "@playwright/test";

test("homepage presents the 3B TECH HUB service platform", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/3B TECH HUB/);
  await expect(
    page.getByRole("heading", { name: /Technology solutions/i }),
  ).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Technology services/i })).toBeVisible();
});
