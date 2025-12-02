import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db/client";
import { licenses } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

type Payload = {
  licenseKey: string;
  machineId?: string;
  appVersion?: string;
};

const JWT_SECRET = process.env.LICENSE_JWT_SECRET ?? "devyear-secret-change-in-production";
const MAX_VALIDATIONS_PER_DAY = 100;

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Payload;
  if (!body?.licenseKey) {
    return NextResponse.json({ error: "licenseKey obrigatória" }, { status: 400 });
  }

  const rows = await db.select().from(licenses).where(eq(licenses.key, body.licenseKey));
  const lic = rows[0];
  if (!lic || lic.status !== "active") {
    return NextResponse.json({ ok: false, error: "Licença inválida ou inativa" }, { status: 400 });
  }

  // Rate limiting simples: max 100 validações por dia
  const now = new Date();
  const lastValidated = lic.lastValidatedAt ? new Date(lic.lastValidatedAt) : null;
  const isSameDay = lastValidated && lastValidated.toDateString() === now.toDateString();

  if (isSameDay && (lic.validationCount ?? 0) >= MAX_VALIDATIONS_PER_DAY) {
    return NextResponse.json(
      { ok: false, error: "Limite de validações diário atingido. Tente novamente amanhã." },
      { status: 429 }
    );
  }

  // Incrementa contador ou reseta se novo dia
  const newCount = isSameDay ? (lic.validationCount ?? 0) + 1 : 1;

  // Gera JWT token para validação offline
  const offlineToken = jwt.sign(
    {
      key: lic.key,
      email: lic.email,
      tier: "standard",
      exp: Math.floor(Date.now() / 1000) + 31536000, // 1 ano
    },
    JWT_SECRET
  );

  await db
    .update(licenses)
    .set({
      validationCount: newCount,
      lastValidatedAt: now,
      offlineToken,
      updatedAt: now,
    })
    .where(eq(licenses.id, lic.id));

  return NextResponse.json({
    ok: true,
    licenseTier: "standard",
    email: lic.email,
    offlineToken,
  });
}
