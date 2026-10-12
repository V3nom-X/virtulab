import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const WIDTHS = [320, 375, 414, 768];
const LABS = ["titration", "pendulum", "buoyancy"];

for (const width of WIDTHS) {
  test.describe(`${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    test("lab page fits, links to guided labs, passes axe", async ({ page }) => {
      await page.goto("/lab");
      const guided = page.getByRole("navigation", { name: "Guided labs" });
      await expect(guided).toBeVisible({ timeout: 15_000 });
      await expect(guided.getByRole("link")).toHaveCount(3);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(1);
      const axe = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .disableRules(["color-contrast"])
        .analyze();
      expect(axe.violations.filter((v) => v.impact === "critical")).toEqual([]);
    });

    for (const id of LABS) {
      test(`lab ${id}: steps, quiz pass, progress saved`, async ({ page }) => {
        await page.goto(`/lab/${id}`);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 15_000 });
        const { labExperiments } = await import("../../src/data/labExperiments");
        const exp = labExperiments.find((l) => l.id === id)!;
        for (const [qi, q] of exp.quiz.entries()) {
          await page.locator(`[id="q${qi}o${q.correctIndex}"]`).click();
        }
        await page.getByRole("button", { name: /submit/i }).click();
        await expect(page.getByText(/Lab complete!/).first()).toBeVisible();
        const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("virtulab-lab-progress") || "{}"));
        expect(saved[id].completed).toBe(true);
      });
    }
  });
}
