import { test, expect } from "@playwright/test";

test("lead submission path", async ({ page }) => {
  await page.goto("/");
  await page.getByPlaceholder("Name").fill("Ben Test");
  await page.getByPlaceholder("Phone").fill("0400000000");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page).toHaveURL(/thanks/);
});
