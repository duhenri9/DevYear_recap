import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("deve exibir título principal e CTA", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: /não desperdice seu domingo/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /comprar agora/i })).toBeVisible();
  });

  test("deve exibir seções de features", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText(/dá para provar o que você entregou/i)).toBeVisible();
    await expect(page.getByText(/zero upload de código/i)).toBeVisible();
    await expect(page.getByText(/pronto em minutos/i)).toBeVisible();
  });

  test("deve exibir FAQ", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText(/perguntas frequentes/i)).toBeVisible();
    await expect(page.getByText(/meus dados ficam seguros/i)).toBeVisible();
  });

  test("deve ter preços fixos corretos", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText(/R\$25/)).toBeVisible();
    await expect(page.getByText(/€5/)).toBeVisible();
    await expect(page.getByText(/£5/)).toBeVisible();
  });
});
