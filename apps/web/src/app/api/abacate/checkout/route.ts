import { NextRequest, NextResponse } from "next/server";

type Payload = {
  email: string;
  successUrl: string;
  cancelUrl: string;
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Payload;
  if (!body?.email || !body?.successUrl || !body?.cancelUrl) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  // TODO: integrar com Abacate Pay real usando ABACATE_PAY_API_KEY/BASE_URL
  // Stub: retorna link de pagamento Pix e QR simulado
  const checkoutUrl = `${body.successUrl}?method=pix&licenseKey=LIC-PIX-${Date.now()}`;
  const qrData = `PIX|DevYear|${body.email}|25.00`;

  return NextResponse.json({
    url: checkoutUrl,
    qrCodeData: qrData,
    note: "Stub Pix - integrar Abacate Pay real",
  });
}
