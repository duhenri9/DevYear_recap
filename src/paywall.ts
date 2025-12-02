import { resolvePrice, formatPrice, CurrencyCode } from "./config/pricing";
import { translate, buildPriceLine, SupportedLocale } from "./i18n/locales";

export type PaywallView = {
  locale: SupportedLocale;
  currency: CurrencyCode;
  paywallText: string;
  priceTag: string;
  receiptTitle: string;
  receiptLine: string;
};

type PaywallOptions = {
  localeInput?: string;
  currencyOverride?: CurrencyCode;
  date?: Date;
};

export function buildPaywallView(options: PaywallOptions): PaywallView {
  const { currency } = resolvePrice(options.localeInput, options.currencyOverride);
  const paywall = translate(options.localeInput, "cta.paywall", { price: formatPrice(currency) });
  const priceTag = translate(options.localeInput, "cta.price_tag", { price: formatPrice(currency) });
  const receipt = buildPriceLine(options.localeInput, currency, { date: options.date ?? new Date() });

  return {
    locale: receipt.locale,
    currency,
    paywallText: paywall.text,
    priceTag: priceTag.text,
    receiptTitle: receipt.title,
    receiptLine: receipt.line,
  };
}
