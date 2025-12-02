import { CurrencyCode, formatPrice } from "../config/pricing";

export type SupportedLocale = "pt-BR" | "en" | "es";

interface MessageTree {
  [key: string]: string | MessageTree;
}

const defaultLocale: SupportedLocale = "pt-BR";

const messages: Record<SupportedLocale, MessageTree> = {
  "pt-BR": {
    cta: {
      paywall: "Acesse o relatório completo por {{price}}.",
      price_tag: "Preço único de {{price}}.",
    },
    receipt: {
      title: "Recibo",
      line: "Valor: {{price}} • Moeda: {{currency}} • Data: {{date}}",
    },
    status: {
      success: "Pagamento confirmado. Seu relatório completo está liberado.",
      failed: "Não foi possível confirmar o pagamento. Tente novamente.",
    },
    controls: {
      choose_locale: "Selecione idioma",
      choose_currency: "Selecione moeda",
      current_selection: "Idioma: {{locale}} • Moeda: {{currency}}",
    },
  },
  en: {
    cta: {
      paywall: "Unlock the full report for {{price}}.",
      price_tag: "One-time payment of {{price}}.",
    },
    receipt: {
      title: "Receipt",
      line: "Amount: {{price}} • Currency: {{currency}} • Date: {{date}}",
    },
    status: {
      success: "Payment confirmed. Your full report is unlocked.",
      failed: "Payment could not be confirmed. Please try again.",
    },
    controls: {
      choose_locale: "Select language",
      choose_currency: "Select currency",
      current_selection: "Language: {{locale}} • Currency: {{currency}}",
    },
  },
  es: {
    cta: {
      paywall: "Desbloquea el informe completo por {{price}}.",
      price_tag: "Pago único de {{price}}.",
    },
    receipt: {
      title: "Recibo",
      line: "Importe: {{price}} • Moneda: {{currency}} • Fecha: {{date}}",
    },
    status: {
      success: "Pago confirmado. Tu informe completo está disponible.",
      failed: "No se pudo confirmar el pago. Inténtalo de nuevo.",
    },
    controls: {
      choose_locale: "Selecciona idioma",
      choose_currency: "Selecciona moneda",
      current_selection: "Idioma: {{locale}} • Moneda: {{currency}}",
    },
  },
};

function getLocale(localeInput?: string): SupportedLocale {
  if (!localeInput) return defaultLocale;
  const normalized = localeInput.toLowerCase();
  if (normalized.startsWith("pt")) return "pt-BR";
  if (normalized.startsWith("es")) return "es";
  if (normalized.startsWith("en")) return "en";
  return defaultLocale;
}

function lookupMessage(locale: SupportedLocale, key: string): string | undefined {
  const segments = key.split(".");
  let current: MessageTree | string | undefined = messages[locale];

  for (const segment of segments) {
    if (typeof current === "string") return undefined;
    current = current[segment];
    if (current === undefined) return undefined;
  }

  return typeof current === "string" ? current : undefined;
}

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/{{\s*([\w.-]+)\s*}}/g, (_, name) => vars[name] ?? `{{${name}}}`);
}

export function translate(
  localeInput: string | undefined,
  key: string,
  vars: Record<string, string> = {}
): { text: string; locale: SupportedLocale } {
  const locale = getLocale(localeInput);
  const template = lookupMessage(locale, key) ?? lookupMessage(defaultLocale, key) ?? key;
  return { text: interpolate(template, vars), locale };
}

export function buildPriceLine(
  localeInput: string | undefined,
  priceCurrency: CurrencyCode,
  options: { date?: Date } = {}
): { title: string; line: string; locale: SupportedLocale } {
  const { text: title, locale } = translate(localeInput, "receipt.title");
  const date = options.date ?? new Date();
  const formattedDate = date.toISOString().slice(0, 10);
  const price = formatPrice(priceCurrency);
  const line = translate(locale, "receipt.line", {
    price,
    currency: priceCurrency,
    date: formattedDate,
  }).text;

  return { title, line, locale };
}
