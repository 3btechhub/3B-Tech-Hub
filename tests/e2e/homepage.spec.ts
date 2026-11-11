import { expect, test } from "@playwright/test";

test("homepage is completely blank", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toHaveText("");
  await expect(page.locator("body")).not.toContainText(/\\S/);
  await expect(page.locator(".site-header, main, footer, header, nav, button, a, input, textarea, select")).toHaveCount(0);
});
