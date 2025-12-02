"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function SuccessBody() {
  const searchParams = useSearchParams();
  const [licenseKey, setLicenseKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    fetch(`/api/license/by-session?sessionId=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.licenseKey) {
          setLicenseKey(data.licenseKey);
        } else {
          setError("Licença não encontrada. Verifique seu e-mail.");
        }
      })
      .catch(() => {
        setError("Erro ao buscar licença. Verifique seu e-mail.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [sessionId]);

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 text-white">
      <h1 className="text-3xl font-bold">Pagamento confirmado</h1>
      <p className="text-slate-200 mt-3">Obrigado por comprar o DevYear Recap.</p>

      {loading ? (
        <div className="mt-6 p-4 border border-slate-700 rounded-xl bg-slate-900/60">
          <p className="text-sm text-slate-200">Carregando sua license key...</p>
        </div>
      ) : licenseKey ? (
        <div className="mt-6 p-4 border border-emerald-500/40 rounded-xl bg-slate-900/60">
          <p className="text-sm text-emerald-200 mb-2">Sua license key:</p>
          <code className="text-lg font-mono block p-3 bg-slate-950 rounded border border-slate-700">{licenseKey}</code>
          <button
            onClick={() => {
              navigator.clipboard.writeText(licenseKey);
              alert("Chave copiada!");
            }}
            className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-medium"
          >
            Copiar chave
          </button>
          <p className="text-xs text-slate-400 mt-4">
            Também enviamos esta chave para seu e-mail. Cole-a no aplicativo DevYear Recap para desbloquear.
          </p>
        </div>
      ) : error ? (
        <div className="mt-6 p-4 border border-orange-500/40 rounded-xl bg-slate-900/60">
          <p className="text-sm text-orange-200">{error}</p>
          <p className="text-xs text-slate-400 mt-2">
            A licença foi criada e enviada para seu e-mail. Se não receber em alguns minutos, entre em contato com o suporte.
          </p>
        </div>
      ) : (
        <div className="mt-6 p-4 border border-slate-700 rounded-xl bg-slate-900/60">
          <p className="text-sm text-slate-200">Verifique seu e-mail para receber a license key.</p>
          <p className="text-xs text-slate-400 mt-2">Se não receber em alguns minutos, entre em contato com o suporte.</p>
        </div>
      )}
    </div>
  );
}

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-[#020617]">
      <Suspense>
        <SuccessBody />
      </Suspense>
    </main>
  );
}
