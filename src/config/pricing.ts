export type CurrencyCode = "BRL" | "EUR" | "GBP";

type Price = {
  amount: number;
  formatted: string;
  code: CurrencyCode;
};

const PRICE_TABLE: Record<CurrencyCode, Price> = {
  BRL: { amount: 25, formatted: "R$ 25,00", code: "BRL" },
  EUR: { amount: 5, formatted: "€5", code: "EUR" },
  GBP: { amount: 5, formatted: "£5", code: "GBP" },
};

const EU_COUNTRIES = new Set([
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
]);

export type LocaleInput = string | undefined;

export function detectCurrency(localeInput?: LocaleInput, override?: CurrencyCode): CurrencyCode {
  if (override) return override;
  if (!localeInput) return "BRL";

  const locale = localeInput.toLowerCase();
  const [, regionRaw] = locale.split("-");
  const region = regionRaw ? regionRaw.toUpperCase() : undefined;
  const language = locale.split("-")[0];

  if (region === "GB") return "GBP";
  if (region && EU_COUNTRIES.has(region)) return "EUR";

  if ((language === "en" || language === "es") && region === undefined) {
    // No region provided, fall back to BRL as per policy.
    return "BRL";
  }

  return "BRL";
}

export function formatPrice(code: CurrencyCode): string {
  return PRICE_TABLE[code].formatted;
}

export function resolvePrice(locale?: LocaleInput, currencyOverride?: CurrencyCode) {
  const currency = detectCurrency(locale, currencyOverride);
  const price = PRICE_TABLE[currency];
  return { currency, price };
}
