import { expect, test } from "@playwright/test";

test("renders the landing page with metadata and accessible controls", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1, name: "React Pixel UI" }),
  ).toBeVisible();
  await expect(page.locator(".hero-badge")).toHaveText(/^v\d+\.\d+\.\d+$/);
  await expect(
    page.getByRole("slider", { name: "Pixel Size", exact: true }),
  ).toBeVisible();
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    "https://react-pixel-ui.vercel.app/og.png",
  );

  const slider = page.getByRole("slider", { name: "Pixel Size", exact: true });
  await slider.focus();
  await expect(slider).toBeFocused();
  expect(
    await slider.evaluate((element) => getComputedStyle(element).outlineStyle),
  ).not.toBe("none");

  await page
    .getByRole("button", { name: "Copy code to clipboard" })
    .first()
    .click();
  await expect(
    page.getByRole("button", { name: "Copy code to clipboard" }).first(),
  ).toHaveText("Copied");
  expect(consoleErrors).toEqual([]);
});

test("does not overflow a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");

  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));

  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
  await expect(
    page.getByRole("link", { name: "Try playground" }),
  ).toBeVisible();
});
