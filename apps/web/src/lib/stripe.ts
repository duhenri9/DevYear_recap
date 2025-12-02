import Stripe from "stripe";

const secret = process.env.STRIPE_SECRET_KEY;
if (!secret) throw new Error("STRIPE_SECRET_KEY não configurada");

export const stripe = new Stripe(secret, {
  apiVersion: "2023-10-16",
});

export const PRICES = {
  BRL: 2500, // em centavos
  EUR: 500,
  GBP: 500,
};

export function getPriceForCurrency(code: "BRL" | "EUR" | "GBP") {
  const unitAmount = PRICES[code];
  if (!unitAmount) throw new Error(`Moeda não suportada: ${code}`);
  return unitAmount;
}
