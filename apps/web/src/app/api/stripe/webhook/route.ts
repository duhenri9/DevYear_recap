import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/src/lib/stripe";
import { db } from "@/src/db/client";
import { licenses } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { sendLicenseEmail } from "@/src/lib/email";

export const config = {
  api: {
    bodyParser: false,
  },
};

function getStripeSignature(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  return sig ?? "";
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const rawBody = await req.arrayBuffer();
  let event;

  try {
    event = stripe.webhooks.constructEvent(Buffer.from(rawBody), getStripeSignature(req), webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const email = session.customer_details?.email ?? session.metadata?.email;
    const currency = session.metadata?.currency ?? "BRL";
    const donationStr = session.metadata?.donation ?? "0";
    const donation = parseInt(donationStr, 10) || 0;
    const key = `LIC-${randomUUID()}`;

    await db.insert(licenses).values({
      key,
      email: email ?? "unknown@example.com",
      stripeCustomerId: session.customer,
      stripeCheckoutSessionId: session.id,
      status: "active",
      validationCount: 0,
      donationAmount: donation,
      donationCurrency: donation > 0 ? currency : null,
    });

    console.log(`[Webhook] Licença criada: ${key} para ${email}`);
    if (donation > 0) {
      console.log(`[Webhook] Doação recebida: ${currency} ${donation}`);
    }

    // Enviar email com a license key
    const emailResult = await sendLicenseEmail({
      to: email ?? "unknown@example.com",
      licenseKey: key,
      donation: donation > 0 ? { amount: donation, currency } : undefined,
    });

    if (emailResult.ok) {
      console.log(`[Webhook] Email enviado com sucesso: ${emailResult.messageId}`);
    } else {
      console.error(`[Webhook] Falha ao enviar email: ${emailResult.error}`);
    }

    return NextResponse.json({ ok: true, message: "License created" });
  }

  return NextResponse.json({ received: true });
}
