import { CurrencyCode } from "./config/pricing";
import { buildPaywallView } from "./paywall";
import { clearConfig, getDefaultConfigPath, loadConfig, saveConfig, UserConfig } from "./config/store";

function getArgValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  if (index >= 0 && index + 1 < process.argv.length) {
    return process.argv[index + 1];
  }
  return undefined;
}

function parseCurrency(input?: string): CurrencyCode | undefined {
  if (!input) return undefined;
  const upper = input.toUpperCase();
  if (upper === "BRL" || upper === "EUR" || upper === "GBP") {
    return upper;
  }
  return undefined;
}

function main() {
  const configPath = getArgValue("--config-path") ?? getDefaultConfigPath();
  const shouldSave = process.argv.includes("--save") || process.argv.includes("--remember");
  const shouldClear = process.argv.includes("--clear-config");

  if (shouldClear) {
    clearConfig(configPath);
    console.log(`Config apagada em ${configPath}`);
    return;
  }

  const stored = loadConfig(configPath);
  const localeArg = getArgValue("--locale") ?? process.env.DEVYEAR_LOCALE ?? stored.locale;
  const currencyArg = parseCurrency(getArgValue("--currency") ?? process.env.DEVYEAR_CURRENCY ?? stored.currency);

  const view = buildPaywallView({
    localeInput: localeArg,
    currencyOverride: currencyArg,
    date: new Date(),
  });

  if (shouldSave) {
    const toSave: UserConfig = {
      locale: localeArg,
      currency: currencyArg,
    };
    saveConfig(toSave, configPath);
  }

  console.log("DevYear Recap — Paywall Preview");
  console.log("--------------------------------");
  console.log(view.paywallText);
  console.log(view.priceTag);
  console.log();
  console.log(`${view.receiptTitle}: ${view.receiptLine}`);
  console.log(`Locale aplicado: ${view.locale} • Moeda aplicada: ${view.currency}`);
  console.log();
  console.log("Flags: --locale en|es|pt-BR • --currency BRL|EUR|GBP • --save • --clear-config");
  console.log(`Arquivo de config: ${configPath}`);
}

main();
