import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL ?? "DevYear Recap <noreply@devyear.app>";

type SendLicenseEmailParams = {
  to: string;
  licenseKey: string;
  donation?: {
    amount: number;
    currency: string;
  };
};

export async function sendLicenseEmail({ to, licenseKey, donation }: SendLicenseEmailParams) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Email] RESEND_API_KEY não configurada. Email não será enviado.");
    return { ok: false, error: "Email service not configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Sua license key do DevYear Recap",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1e293b; background: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #0ea5e9 0%, #10b981 100%); padding: 32px 24px; text-align: center; }
    .header h1 { margin: 0; color: #fff; font-size: 28px; font-weight: 800; }
    .content { padding: 32px 24px; }
    .content p { margin: 0 0 16px 0; }
    .license-box { background: #020617; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center; }
    .license-key { font-family: "Monaco", "Courier New", monospace; font-size: 20px; color: #10b981; font-weight: 700; letter-spacing: 1px; word-break: break-all; }
    .footer { background: #f1f5f9; padding: 20px 24px; text-align: center; font-size: 14px; color: #64748b; }
    .cta-button { display: inline-block; background: #10b981; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>DevYear Recap</h1>
    </div>
    <div class="content">
      <p>Obrigado por comprar o <strong>DevYear Recap</strong>!</p>
      <p>Sua compra foi processada com sucesso. Aqui está sua license key:</p>

      <div class="license-box">
        <div class="license-key">${licenseKey}</div>
      </div>

      ${
        donation && donation.amount > 0
          ? `
      <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%); border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
        <h2 style="margin: 0 0 12px 0; color: #10b981; font-size: 24px;">Muito Obrigado!</h2>
        <p style="margin: 0; color: #1e293b; font-size: 16px;">
          Sua doação de <strong>${donation.currency === "BRL" ? "R$" : donation.currency === "EUR" ? "€" : "£"}${donation.amount}</strong>
          ajuda a manter o DevYear Recap ativo e em constante evolução.
        </p>
        <p style="margin: 12px 0 0 0; color: #64748b; font-size: 14px;">
          Como dev solo, cada contribuição faz toda a diferença. Você está ajudando a pagar a infraestrutura,
          desenvolver novas features e manter o projeto acessível para todos. 🙏
        </p>
      </div>
      `
          : ""
      }

      <p><strong>Como usar:</strong></p>
      <ol>
        <li>Baixe o aplicativo DevYear Recap (se ainda não tem)</li>
        <li>Abra o aplicativo e cole sua license key quando solicitado</li>
        <li>Pronto! Gere seu relatório de fim de ano em segundos</li>
      </ol>

      <p style="margin-top: 24px; color: #64748b; font-size: 14px;">
        Guarde esta chave em local seguro. Ela é válida para uso pessoal e permite validações ilimitadas.
      </p>
    </div>
    <div class="footer">
      <p>DevYear Recap - Transforme seus commits em relatórios profissionais</p>
      <p>Precisa de ajuda? Responda este email.</p>
    </div>
  </div>
</body>
</html>
      `,
    });

    if (error) {
      console.error("[Email] Erro ao enviar:", error);
      return { ok: false, error: error.message };
    }

    console.log(`[Email] Enviado com sucesso para ${to}. ID: ${data?.id}`);
    return { ok: true, messageId: data?.id };
  } catch (err: any) {
    console.error("[Email] Exceção ao enviar:", err);
    return { ok: false, error: err.message };
  }
}
