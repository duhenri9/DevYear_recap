import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db/client";
import { licenses } from "@/src/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId obrigatório" }, { status: 400 });
  }

  const rows = await db.select().from(licenses).where(eq(licenses.stripeCheckoutSessionId, sessionId));
  const lic = rows[0];

  if (!lic) {
    return NextResponse.json({ error: "Licença não encontrada para esta sessão" }, { status: 404 });
  }

  return NextResponse.json({
    licenseKey: lic.key,
    email: lic.email,
    status: lic.status,
  });
}
