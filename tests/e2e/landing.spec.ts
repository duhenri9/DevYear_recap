import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("hero, pricing, donation and FAQ are visible", async ({ page }) => {
    await page.goto("/");
    await page.selectOption("#locale-select", "pt-BR");

    await expect(page.getByText("Não desperdice seu domingo lembrando o que você codou em março.")).toBeVisible();
    await expect(
      page.getByText("Conecte seus repositórios locais. Gere sua autoavaliação de desempenho em 30 segundos.")
    ).toBeVisible();
    await expect(page.getByText("Pagamento único: R$25 (Pix ou cartão), €5 ou £5 (cartão).")).toBeVisible();

    await expect(page.getByRole("button", { name: /Inserir licença/i })).toBeVisible();
    await expect(page.getByText("Pagamento único: R$25 (Pix ou cartão), €5 ou £5 (cartão).")).toBeVisible();

    await expect(page.getByText("Apoie o projeto (opcional)")).toBeVisible();
    await expect(page.locator("#donation-currency")).toBeVisible();
    await expect(page.locator("#donation-amount")).toBeVisible();

    await expect(page.getByText("Zero Config Privacy")).toBeVisible();
    await expect(page.getByText("Relatório com Provas")).toBeVisible();
    await expect(page.getByText("Texto Corporativo")).toBeVisible();

    await expect(page.getByText("Como funciona")).toBeVisible();
    await expect(page.getByText("Aponte sua pasta")).toBeVisible();
    await expect(page.getByText("Licença e desbloqueio")).toBeVisible();

    await expect(page.getByRole("heading", { name: "Privacidade local" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Perguntas frequentes" })).toBeVisible();
    await expect(page.getByText("Meus dados ficam seguros?")).toBeVisible();
  });

  test("locale selector works", async ({ page }) => {
    await page.goto("/");
    await page.selectOption("#locale-select", "en");
    const localeLabel = await page.locator("#current-selection");
    await expect(localeLabel).toContainText("en");
  });
});
