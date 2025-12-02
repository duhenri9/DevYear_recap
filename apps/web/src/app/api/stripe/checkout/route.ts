import { NextRequest, NextResponse } from "next/server";
import { stripe, getPriceForCurrency } from "@/src/lib/stripe";

type Payload = {
  currency: "BRL" | "EUR" | "GBP";
  email: string;
  donation?: number;
  successUrl: string;
  cancelUrl: string;
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Payload;
  if (!body?.email || !body?.currency || !body.successUrl || !body.cancelUrl) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const lineItems = [
    {
      price_data: {
        currency: body.currency.toLowerCase(),
        product_data: { name: "DevYear Recap - Licença" },
        unit_amount: getPriceForCurrency(body.currency),
      },
      quantity: 1,
    },
  ];

  // Adicionar doação como line item separado se > 0
  if (body.donation && body.donation > 0) {
    lineItems.push({
      price_data: {
        currency: body.currency.toLowerCase(),
        product_data: {
          name: "Doação para DevYear Recap (Apoio ao projeto)",
        },
        unit_amount: body.donation * 100, // Converter para centavos
      },
      quantity: 1,
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: body.email,
    line_items: lineItems,
    success_url: `${body.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: body.cancelUrl,
    metadata: {
      email: body.email,
      currency: body.currency,
      donation: body.donation?.toString() ?? "0",
    },
  });

  return NextResponse.json({ url: session.url });
}
