"use client";
import { ArrowRight, Lock, Zap, Clock, Shield, GitBranch, Sparkles, Award, TrendingUp, Database, FileText } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [currency, setCurrency] = useState<"BRL" | "EUR" | "GBP">("BRL");
  const [method, setMethod] = useState<"card" | "pix">("card");
  const [donation, setDonation] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pix, setPix] = useState<{ url?: string; qr?: string } | null>(null);

  const getCurrencySymbol = () => {
    switch (currency) {
      case "BRL": return "R$";
      case "EUR": return "€";
      case "GBP": return "£";
    }
  };

  const getCurrencyName = () => {
    switch (currency) {
      case "BRL": return "Reais";
      case "EUR": return "Euros";
      case "GBP": return "Libras";
    }
  };

  const getBasePrice = () => {
    switch (currency) {
      case "BRL": return 25;
      case "EUR":
      case "GBP": return 5;
    }
  };

  const getTotalPrice = () => getBasePrice() + donation;

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setPix(null);
    const payload = {
      email,
      currency,
      donation,
      successUrl: `${window.location.origin}/success`,
      cancelUrl: `${window.location.origin}/`,
    };
    try {
      const endpoint = method === "card" ? "/api/stripe/checkout" : "/api/abacate/checkout";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const detail = await res.text();
        throw new Error(detail || "Erro ao iniciar checkout");
      }
      const data = await res.json();
      if (method === "card" && data.url) {
        window.location.href = data.url;
      } else if (method === "pix") {
        setPix({ url: data.url, qr: data.qrCodeData });
      } else {
        alert("Não foi possível iniciar o pagamento. Tente novamente.");
      }
    } catch (err: any) {
      alert("Falha ao iniciar checkout. Verifique sua conexão e tente novamente.");
      console.error("Checkout error", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ background: "var(--color-bg-base)", minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      {/* Background Blobs */}
      <div className="background-blob blue" style={{ top: "-10%", left: "-5%", opacity: 0.3 }} />
      <div className="background-blob emerald" style={{ top: "20%", right: "-10%", opacity: 0.25 }} />
      <div className="background-blob cyan" style={{ bottom: "10%", left: "30%", opacity: 0.2 }} />

      {/* Hero Section */}
      <section className="container" style={{ paddingTop: "5rem", paddingBottom: "3rem", position: "relative", zIndex: 10 }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span className="badge" style={{ marginBottom: "1.5rem" }}>
            <Sparkles style={{ width: "1rem", height: "1rem" }} />
            DevYear Recap
          </span>
          <h1 className="hero-title" style={{ marginBottom: "1.5rem" }}>
            Não desperdice seu domingo lembrando{" "}
            <span className="text-gradient">o que você codou em março.</span>
          </h1>
          <p className="hero-subtitle" style={{ margin: "0 auto" }}>
            Conecte seus repositórios locais. Gere sua autoavaliação de desempenho em 30 segundos.
            Aumente suas chances de promoção sem o estresse da escrita. Preço único, privacidade local.
          </p>
        </div>

        {/* Feature Pills */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center", marginBottom: "2.5rem" }}>
          <span className="pill"><Lock style={{ width: "0.875rem", height: "0.875rem" }} /> Local-first</span>
          <span className="pill"><Zap style={{ width: "0.875rem", height: "0.875rem" }} /> Zero fricção</span>
          <span className="pill"><Award style={{ width: "0.875rem", height: "0.875rem" }} /> Preço único</span>
          <span className="pill"><FileText style={{ width: "0.875rem", height: "0.875rem" }} /> PT-BR / EN / ES</span>
        </div>

        {/* Checkout Form */}
        <form onSubmit={handleCheckout} className="card" style={{ maxWidth: "42rem", margin: "0 auto" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label className="label">E-mail</label>
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu-email@exemplo.com"
              type="email"
            />
          </div>

          <div className="radio-group">
            <label className="radio-label">
              <input type="radio" name="method" value="card" checked={method === "card"} onChange={() => setMethod("card")} />
              Cartão (Stripe)
            </label>
            <label className="radio-label">
              <input type="radio" name="method" value="pix" checked={method === "pix"} onChange={() => setMethod("pix")} />
              Pix (Abacate Pay)
            </label>
          </div>

          <div className="radio-group" style={{ marginTop: "0.75rem" }}>
            <label className="radio-label">
              <input type="radio" name="currency" value="BRL" checked={currency === "BRL"} onChange={() => setCurrency("BRL")} />
              R$25
            </label>
            <label className="radio-label">
              <input type="radio" name="currency" value="EUR" checked={currency === "EUR"} onChange={() => setCurrency("EUR")} />
              €5
            </label>
            <label className="radio-label">
              <input type="radio" name="currency" value="GBP" checked={currency === "GBP"} onChange={() => setCurrency("GBP")} />
              £5
            </label>
          </div>

          {/* Donation Section */}
          <div className="donation-box">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <Sparkles style={{ width: "1rem", height: "1rem", color: "var(--color-emerald-primary)" }} />
              <span style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-emerald-primary)" }}>
                Apoie o projeto
              </span>
              <span className="pill" style={{ fontSize: "0.6875rem", padding: "0.25rem 0.625rem" }}>
                Opcional
              </span>
            </div>
            <p style={{ color: "var(--color-text-slate-300)", fontSize: "0.8125rem", lineHeight: 1.5, marginBottom: "0.75rem" }}>
              DevYear Recap é mantido por um dev solo autodidata. Sua doação ajuda a manter o projeto ativo,
              adicionar novas features e pagar a infraestrutura. Muito obrigado!
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label className="label" style={{ fontSize: "0.8125rem" }}>
                Valor da doação (opcional)
              </label>
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: "0.875rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--color-emerald-primary)",
                    fontWeight: 600,
                    fontSize: "1rem",
                  }}
                >
                  {getCurrencySymbol()}
                </span>
                <input
                  className="input-number"
                  type="number"
                  min="0"
                  step="1"
                  value={donation || ""}
                  onChange={(e) => setDonation(Number(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
              <p style={{ color: "var(--color-text-slate-500)", fontSize: "0.6875rem", marginTop: "0.25rem" }}>
                Digite qualquer valor em {getCurrencyName()}. Deixe em 0 para não doar.
              </p>
            </div>
          </div>

          <div style={{ marginTop: "1.25rem", display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <button type="submit" disabled={loading} className="button-primary">
              {loading ? "Processando..." : `Pagar ${getCurrencySymbol()}${getTotalPrice()}`}
              <ArrowRight style={{ width: "1.25rem", height: "1.25rem" }} />
            </button>
            <span style={{ color: "var(--color-text-slate-300)", fontSize: "0.875rem" }}>
              Produto: {getCurrencySymbol()}{getBasePrice()}
              {donation > 0 && ` + Doação: ${getCurrencySymbol()}${donation}`}
            </span>
          </div>

          {pix && (
            <div style={{ marginTop: "1rem" }} className="card">
              <p style={{ fontSize: "0.875rem", color: "#a7f3d0" }}>
                Pagamento Pix iniciado. Escaneie o QR ou acesse o link:
              </p>
              {pix.qr && (
                <pre style={{ fontSize: "0.75rem", color: "var(--color-text-slate-200)", marginTop: "0.5rem", whiteSpace: "pre-wrap" }}>
                  {pix.qr}
                </pre>
              )}
              {pix.url && (
                <a
                  style={{ color: "var(--color-blue-primary)", textDecoration: "underline", marginTop: "0.5rem", display: "inline-block" }}
                  href={pix.url}
                >
                  Abrir comprovante / finalizar
                </a>
              )}
            </div>
          )}
        </form>
      </section>

      {/* Features Section */}
      <section className="container section">
        <h2 className="section-title" style={{ textAlign: "center", marginBottom: "2rem" }}>
          Por que <span className="text-gradient">DevYear Recap</span>
        </h2>
        <div className="grid-features">
          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
              <div style={{
                padding: "1rem",
                borderRadius: "var(--radius-xl)",
                background: "var(--glow-emerald)",
                border: "1px solid rgba(16, 185, 129, 0.3)"
              }}>
                <TrendingUp style={{ width: "2rem", height: "2rem", color: "var(--color-emerald-primary)" }} />
              </div>
            </div>
            <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--color-text-white)", fontSize: "1.125rem" }}>
              Dá para provar o que você entregou
            </h3>
            <p style={{ color: "var(--color-text-slate-300)", lineHeight: 1.6, margin: 0, fontSize: "0.9375rem" }}>
              Extrai commits, PRs e tickets do seu repositório local e monta a narrativa corporativa com evidências.
            </p>
          </div>

          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
              <div style={{
                padding: "1rem",
                borderRadius: "var(--radius-xl)",
                background: "var(--glow-blue)",
                border: "1px solid rgba(59, 130, 246, 0.3)"
              }}>
                <Shield style={{ width: "2rem", height: "2rem", color: "var(--color-blue-primary)" }} />
              </div>
            </div>
            <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--color-text-white)", fontSize: "1.125rem" }}>
              Zero upload de código
            </h3>
            <p style={{ color: "var(--color-text-slate-300)", lineHeight: 1.6, margin: 0, fontSize: "0.9375rem" }}>
              Nada de enviar fonte: só mensagens de commit, títulos de PR e tickets, processados localmente antes de chamar a IA.
            </p>
          </div>

          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
              <div style={{
                padding: "1rem",
                borderRadius: "var(--radius-xl)",
                background: "var(--glow-cyan)",
                border: "1px solid rgba(6, 182, 212, 0.3)"
              }}>
                <Clock style={{ width: "2rem", height: "2rem", color: "var(--color-cyan-accent)" }} />
              </div>
            </div>
            <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--color-text-white)", fontSize: "1.125rem" }}>
              Pronto em minutos
            </h3>
            <p style={{ color: "var(--color-text-slate-300)", lineHeight: 1.6, margin: 0, fontSize: "0.9375rem" }}>
              Escolha a pasta, selecione o ano e receba um relatório pronto em PT-BR/EN/ES, com seções de entregas, desafios e impacto.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container section">
        <h2 className="section-title" style={{ textAlign: "center", marginBottom: "2rem" }}>
          Como <span className="text-gradient">funciona</span>
        </h2>
        <div className="grid-features" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <div style={{
                padding: "0.5rem",
                borderRadius: "var(--radius-lg)",
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.3)"
              }}>
                <GitBranch style={{ width: "1.25rem", height: "1.25rem", color: "var(--color-emerald-primary)" }} />
              </div>
              <h4 style={{ margin: 0, color: "#a7f3d0", fontSize: "0.9375rem", fontWeight: 700 }}>
                1) Aponte sua pasta
              </h4>
            </div>
            <p style={{ color: "var(--color-text-slate-300)", lineHeight: 1.6, margin: 0, fontSize: "0.875rem" }}>
              Detectamos repositórios .git e seu autor no .gitconfig.
            </p>
          </div>

          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <div style={{
                padding: "0.5rem",
                borderRadius: "var(--radius-lg)",
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.3)"
              }}>
                <Database style={{ width: "1.25rem", height: "1.25rem", color: "var(--color-emerald-primary)" }} />
              </div>
              <h4 style={{ margin: 0, color: "#a7f3d0", fontSize: "0.9375rem", fontWeight: 700 }}>
                2) Escaneamos o ano
              </h4>
            </div>
            <p style={{ color: "var(--color-text-slate-300)", lineHeight: 1.6, margin: 0, fontSize: "0.875rem" }}>
              Filtramos merges/WIP/typos e agrupamos temas (performance, estabilidade, DX, etc.).
            </p>
          </div>

          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <div style={{
                padding: "0.5rem",
                borderRadius: "var(--radius-lg)",
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.3)"
              }}>
                <Sparkles style={{ width: "1.25rem", height: "1.25rem", color: "var(--color-emerald-primary)" }} />
              </div>
              <h4 style={{ margin: 0, color: "#a7f3d0", fontSize: "0.9375rem", fontWeight: 700 }}>
                3) IA gera o texto final
              </h4>
            </div>
            <p style={{ color: "var(--color-text-slate-300)", lineHeight: 1.6, margin: 0, fontSize: "0.875rem" }}>
              Prompt corporativo focado em promoção ou autoavaliação, com evidências e seções prontas para colar.
            </p>
          </div>

          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <div style={{
                padding: "0.5rem",
                borderRadius: "var(--radius-lg)",
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.3)"
              }}>
                <Lock style={{ width: "1.25rem", height: "1.25rem", color: "var(--color-emerald-primary)" }} />
              </div>
              <h4 style={{ margin: 0, color: "#a7f3d0", fontSize: "0.9375rem", fontWeight: 700 }}>
                4) Licença e desbloqueio
              </h4>
            </div>
            <p style={{ color: "var(--color-text-slate-300)", lineHeight: 1.6, margin: 0, fontSize: "0.875rem" }}>
              Preview borrado até validar a licença. Após pagamento (Stripe ou Pix), chave é validada e exporta Markdown/PDF.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="container section">
        <h2 className="section-title" style={{ textAlign: "center", marginBottom: "2rem" }}>
          Preço e <span className="text-gradient">licenciamento</span>
        </h2>
        <div className="card" style={{ maxWidth: "48rem", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <Award style={{ width: "1.5rem", height: "1.5rem", color: "var(--color-emerald-primary)" }} />
            <h3 style={{ margin: 0, color: "var(--color-text-white)", fontSize: "1.125rem" }}>
              Pagamento único, sem assinatura
            </h3>
          </div>
          <p style={{ color: "var(--color-text-slate-300)", lineHeight: 1.6, margin: "0 0 0.75rem 0" }}>
            Pagamento único: R$25 (Pix ou cartão), €5 ou £5 (cartão). Receba uma license key para validações ilimitadas.
            Nenhuma assinatura recorrente.
          </p>
          <p style={{ color: "var(--color-text-slate-300)", lineHeight: 1.6, margin: 0 }}>
            Após o pagamento, a chave aparece na página de sucesso e é enviada por e-mail. No app, cole a chave para
            remover o blur e exportar o relatório.
          </p>
        </div>
      </section>

      {/* Privacy */}
      <section className="container section">
        <h2 className="section-title" style={{ textAlign: "center", marginBottom: "2rem" }}>
          <span className="text-gradient">Privacidade</span> local
        </h2>
        <div className="card" style={{ maxWidth: "48rem", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <Shield style={{ width: "1.5rem", height: "1.5rem", color: "var(--color-blue-primary)" }} />
            <h3 style={{ margin: 0, color: "var(--color-text-white)", fontSize: "1.125rem" }}>
              Seu código nunca sai da sua máquina
            </h3>
          </div>
          <p style={{ color: "var(--color-text-slate-300)", lineHeight: 1.6, margin: "0 0 0.75rem 0" }}>
            A coleta é local. Apenas mensagens de commit/PR/tickets são resumidas. Código-fonte não sai da sua máquina.
            Env vars e tokens (Jira, Git) ficam sob seu controle.
          </p>
          <p style={{ color: "var(--color-text-slate-300)", lineHeight: 1.6, margin: 0 }}>
            O prompt de IA envia apenas dados agregados e amostras de mensagens, sem arquivos de código.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="container section" style={{ paddingBottom: "5rem" }}>
        <h2 className="section-title" style={{ textAlign: "center", marginBottom: "2rem" }}>
          Perguntas <span className="text-gradient">frequentes</span>
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "48rem", margin: "0 auto" }}>
          <details className="card">
            <summary>Meus dados ficam seguros?</summary>
            <p>
              Sim. Código-fonte nunca sai da sua máquina. Apenas mensagens de commit, títulos de PR e tickets são
              enviados para a IA, processados localmente antes. Nenhum arquivo de código é transmitido.
            </p>
          </details>

          <details className="card">
            <summary>A licença funciona em quantas máquinas?</summary>
            <p>
              Validações ilimitadas. Sem limite rígido de máquinas. A licença é pessoal e pode ser usada em qualquer
              máquina sua.
            </p>
          </details>

          <details className="card">
            <summary>Posso usar sem conexão?</summary>
            <p>
              Após a primeira validação online, o app armazena um token JWT localmente que é válido por 30 dias.
              Você pode gerar relatórios offline nesse período.
            </p>
          </details>

          <details className="card">
            <summary>Qual modelo de IA é usado?</summary>
            <p>
              Por padrão, gpt-4o-mini (rápido e barato). Você pode configurar para usar gpt-4.1 ou gpt-4o para melhor
              qualidade, ou até ativar a estratégia de dois modelos (barato para pré-processar + melhor para texto final).
            </p>
          </details>

          <details className="card">
            <summary>Há garantia de reembolso?</summary>
            <p>
              Sim, 7 dias de garantia incondicional. Se não gostar, peça reembolso sem perguntas.
            </p>
          </details>

          <details className="card">
            <summary>Funciona com GitHub, GitLab, Bitbucket?</summary>
            <p>
              Sim. DevYear Recap lê repositórios Git locais, independente de onde estão hospedados. Funciona com
              qualquer servidor Git.
            </p>
          </details>

          <details className="card">
            <summary>Preciso ter OpenAI API Key?</summary>
            <p>
              Sim, se quiser usar IA (recomendado). Você configura sua própria chave OpenAI no app. Custo típico:
              menos de US$1 por relatório com gpt-4o-mini.
            </p>
          </details>
        </div>
      </section>
    </main>
  );
}
