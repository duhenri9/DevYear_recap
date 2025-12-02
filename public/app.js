const ui = {
  localeSelect: document.getElementById("locale-select"),
  paywallText: document.getElementById("paywall-text"),
  priceTag: document.getElementById("price-tag"),
  receiptLine: document.getElementById("receipt-line"),
  currentSelection: document.getElementById("current-selection"),
  status: document.getElementById("status"),
  heroTitle: document.getElementById("hero-title"),
  heroSubtitle: document.getElementById("hero-subtitle"),
  paywallHeading: document.getElementById("paywall-heading"),
  priceTitle: document.getElementById("price-title"),
  priceNote: document.getElementById("price-note"),
  priceNote2: document.getElementById("price-note-2"),
  donationTitle: document.getElementById("donation-title"),
  donationDesc: document.getElementById("donation-desc"),
  donationCurrencyLabel: document.getElementById("donation-currency-label"),
  donationAmountLabel: document.getElementById("donation-amount-label"),
  donationHelper: document.getElementById("donation-helper"),
  privacyTitle: document.getElementById("privacy-title"),
  privacyBody1: document.getElementById("privacy-body-1"),
  privacyBody2: document.getElementById("privacy-body-2"),
  faqTitle: document.getElementById("faq-title"),
  donationCurrency: document.getElementById("donation-currency"),
  donationAmount: document.getElementById("donation-amount"),
};

const ROUTE_TITLES = {
  "/app": "App",
  "/paywall": "Paywall",
  "/report": "Preview",
};

const TRANSLATIONS = {
  "pt-BR": {
    labels: { language: "Idioma / Language" },
    heroTitle: "Não desperdice seu domingo lembrando o que você codou em março.",
    heroSubtitle:
      "Conecte seus repositórios locais. Gere sua autoavaliação de desempenho em 30 segundos. Aumente suas chances de promoção sem o estresse da escrita. Preço único, privacidade local.",
    paywallHeading: "Pagamento e desbloqueio",
    priceTitle: "Preço e licenciamento",
    priceNote: "Pagamento único: R$25 (Pix ou cartão), €5 ou £5 (cartão). License key para até 3 máquinas. Sem recorrência.",
    priceNote2:
      "Após o pagamento, a chave aparece na página de sucesso e é enviada por e-mail. No app, cole a chave para remover o blur e exportar o relatório.",
    donationTitle: "Apoie o projeto (opcional)",
    donationDesc:
      "DevYear Recap é mantido por um dev solo autodidata. Sua doação ajuda a manter o projeto ativo, adicionar novas features e pagar a infraestrutura. Obrigado por apoiar!",
    donationCurrencyLabel: "Moeda da doação",
    donationAmountLabel: "Valor da doação (opcional)",
    donationHelper: "Se não quiser doar, mantenha em branco. A doação é adicionada no checkout (Stripe ou Pix).",
    features: [
      { title: "Zero Config Privacy", body: "Usa credenciais locais (Git/Jira) sem pedir token novo." },
      { title: "Relatório com Provas", body: "Inclui links de PRs e tickets resolvidos como evidências." },
      { title: "Texto Corporativo", body: "Gera seções de entregas, desafios técnicos e impacto de negócio." },
    ],
    steps: [
      { title: "Aponte sua pasta", body: "Detectamos repositórios .git e seu autor no .gitconfig." },
      { title: "Escaneamos o ano", body: "Filtramos merges/WIP/typos e agrupamos temas (performance, estabilidade, DX, etc.)." },
      { title: "IA gera o texto final", body: "Prompt corporativo focado em promoção ou autoavaliação, com evidências e seções prontas para colar." },
      { title: "Licença e desbloqueio", body: "Preview borrado até validar a licença. Após pagamento, exporta Markdown/PDF." },
    ],
    privacyTitle: "Privacidade local",
    privacyBody1:
      "A coleta é local. Apenas mensagens de commit/PR/tickets são resumidas. Código-fonte não sai da sua máquina. Env vars e tokens (Jira, Git) ficam sob seu controle.",
    privacyBody2: "O prompt de IA envia apenas dados agregados e amostras de mensagens, sem arquivos de código.",
    faqTitle: "Perguntas frequentes",
    faqs: [
      { q: "Meus dados ficam seguros?", a: "Sim. Nada de código é enviado; apenas metadados de commit/PR/tickets. Prompt envia dados agregados, sem arquivos." },
      { q: "A licença funciona em quantas máquinas?", a: "Até 3 máquinas por chave." },
      { q: "Posso usar sem conexão?", a: "A coleta é offline; a geração via IA requer conexão. Com IA mock/local, é possível gerar offline." },
      { q: "Qual modelo de IA é usado?", a: "gpt-4o/gpt-4.1 (configurável). Você também pode usar heurístico local." },
      { q: "Há garantia de reembolso?", a: "Até 7 dias após a compra, mediante solicitação por e-mail." },
      { q: "Funciona com GitHub, GitLab, Bitbucket?", a: "Sim, qualquer repo git local. PRs/tickets podem ser trazidos via CLI gh ou Jira API." },
      { q: "Preciso ter OpenAI API Key?", a: "Não para usar o app com chave embutida. Para usar a sua, defina OPENAI_API_KEY." },
    ],
  },
  en: {
    labels: { language: "Language" },
    heroTitle: "Don't waste your Sunday trying to recall what you coded in March.",
    heroSubtitle:
      "Connect your local repositories. Generate your performance self-review in 30 seconds. Boost your promotion odds without writing stress. One-time price, local privacy.",
    paywallHeading: "Payment and unlock",
    priceTitle: "Pricing and licensing",
    priceNote: "One-time: R$25 (Pix or card), €5 or £5 (card). License key for up to 3 machines. No subscription.",
    priceNote2: "After payment, the key appears on the success page and is emailed. Paste it in the app to remove blur and export the report.",
    donationTitle: "Support the project (optional)",
    donationDesc:
      "DevYear Recap is built by a self-taught solo dev. Your donation keeps the project alive, funds new features and infrastructure. Thank you!",
    donationCurrencyLabel: "Donation currency",
    donationAmountLabel: "Donation amount (optional)",
    donationHelper: "Leave blank if you don't want to donate. The donation is added in checkout (Stripe or Pix).",
    features: [
      { title: "Zero Config Privacy", body: "Uses local credentials (Git/Jira) with no new token prompts." },
      { title: "Report with Evidence", body: "Includes PR and ticket links as proof." },
      { title: "Corporate Tone", body: "Generates deliveries, technical challenges, and business impact sections." },
    ],
    steps: [
      { title: "Point to your folder", body: "We detect .git repos and your author from .gitconfig." },
      { title: "Scan the year", body: "We filter merges/WIP/typos and group themes (performance, stability, DX, etc.)." },
      { title: "AI writes the final text", body: "Corporate prompt for promotion or self-review, with evidence and ready sections." },
      { title: "License and unlock", body: "Preview is blurred until license is validated. After payment, export Markdown/PDF." },
    ],
    privacyTitle: "Local privacy",
    privacyBody1:
      "Collection is local. Only commit/PR/ticket messages are summarized. Source code never leaves your machine. Env vars and tokens remain under your control.",
    privacyBody2: "The AI prompt sends only aggregated data and message samples, no source files.",
    faqTitle: "Frequently asked questions",
    faqs: [
      { q: "Is my data safe?", a: "Yes. No code is sent; only commit/PR/ticket metadata. Prompt uses aggregated data, no files." },
      { q: "How many machines per license?", a: "Up to 3 machines per key." },
      { q: "Can I use it offline?", a: "Collection is offline; AI generation needs connectivity. With mock/local AI you can generate offline." },
      { q: "Which AI model is used?", a: "gpt-4o/gpt-4.1 (configurable). You can also use local heuristics." },
      { q: "Refund policy?", a: "Up to 7 days after purchase upon email request." },
      { q: "Works with GitHub/GitLab/Bitbucket?", a: "Yes, any local git repo. PRs/tickets can come from gh CLI or Jira API." },
      { q: "Need my own OpenAI API Key?", a: "Not required with bundled key; to use yours, set OPENAI_API_KEY." },
    ],
  },
  es: {
    labels: { language: "Idioma" },
    heroTitle: "No desperdicies tu domingo recordando lo que codificaste en marzo.",
    heroSubtitle:
      "Conecta tus repositorios locales. Genera tu autoevaluación de desempeño en 30 segundos. Aumenta tus probabilidades de promoción sin estrés. Precio único, privacidad local.",
    paywallHeading: "Pago y desbloqueo",
    priceTitle: "Precio y licencia",
    priceNote: "Pago único: R$25 (Pix o tarjeta), €5 o £5 (tarjeta). Licencia para hasta 3 máquinas. Sin suscripción.",
    priceNote2: "Tras el pago, la clave aparece en la página de éxito y se envía por correo. Pégala en la app para quitar el blur y exportar.",
    donationTitle: "Apoya el proyecto (opcional)",
    donationDesc:
      "DevYear Recap es mantenido por un desarrollador autodidacta. Tu donación mantiene el proyecto vivo, agrega funciones y paga la infraestructura. ¡Gracias!",
    donationCurrencyLabel: "Moneda de donación",
    donationAmountLabel: "Valor de donación (opcional)",
    donationHelper: "Si no quieres donar, déjalo en blanco. La donación se agrega en el checkout (Stripe o Pix).",
    features: [
      { title: "Privacidad sin configuración", body: "Usa credenciales locales (Git/Jira) sin pedir nuevos tokens." },
      { title: "Informe con evidencias", body: "Incluye enlaces de PRs y tickets como prueba." },
      { title: "Texto corporativo", body: "Genera entregas, desafíos técnicos e impacto de negocio." },
    ],
    steps: [
      { title: "Selecciona tu carpeta", body: "Detectamos repos .git y tu autor en .gitconfig." },
      { title: "Escaneamos el año", body: "Filtramos merges/WIP/typos y agrupamos temas (performance, estabilidad, DX, etc.)." },
      { title: "IA crea el texto final", body: "Prompt corporativo para promoción o autoevaluación, con evidencias y secciones listas." },
      { title: "Licencia y desbloqueo", body: "Vista previa borrosa hasta validar la licencia. Después, exporta Markdown/PDF." },
    ],
    privacyTitle: "Privacidad local",
    privacyBody1:
      "La recolección es local. Solo se resumen mensajes de commits/PRs/tickets. El código no sale de tu máquina. Tokens y env vars siguen bajo tu control.",
    privacyBody2: "El prompt de IA envía solo datos agregados y muestras de mensajes, sin archivos de código.",
    faqTitle: "Preguntas frecuentes",
    faqs: [
      { q: "¿Mis datos están seguros?", a: "Sí. No se envía código; solo metadatos de commit/PR/ticket. Prompt usa datos agregados, sin archivos." },
      { q: "¿Cuántas máquinas por licencia?", a: "Hasta 3 máquinas por clave." },
      { q: "¿Puedo usarlo sin conexión?", a: "La recolección es offline; la generación IA requiere conexión. Con IA mock/local puedes generar offline." },
      { q: "¿Qué modelo de IA se usa?", a: "gpt-4o/gpt-4.1 (configurable). También puedes usar heurística local." },
      { q: "¿Hay reembolso?", a: "Hasta 7 días después de la compra, solicitando por correo." },
      { q: "¿Funciona con GitHub/GitLab/Bitbucket?", a: "Sí, cualquier repo git local. PRs/tickets pueden venir de gh CLI o API de Jira." },
      { q: "¿Necesito mi propia API Key de OpenAI?", a: "No con la clave incluida. Para usar la tuya, define OPENAI_API_KEY." },
    ],
  },
};

function highlightRoute(pathname) {
  document.querySelectorAll("a[data-route]").forEach((link) => {
    const route = link.getAttribute("href");
    if (route === pathname) {
      link.style.borderColor = "rgba(16, 185, 129, 0.5)";
    } else {
      link.style.borderColor = "rgba(51, 65, 85, 0.5)";
    }
  });
}

function syncPath() {
  const current = window.location.pathname;
  if (current === "/") {
    window.history.replaceState({}, "", "/app");
  } else if (!ROUTE_TITLES[current]) {
    window.history.replaceState({}, "", "/app");
  }
  highlightRoute(window.location.pathname);
}

async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

async function loadConfig() {
  try {
    return await fetchJSON("/api/config");
  } catch (err) {
    console.warn("Could not load config", err);
    return {};
  }
}

async function saveConfig(locale) {
  try {
    await fetchJSON("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale }),
    });
  } catch (err) {
    console.warn("Could not save config", err);
  }
}

function setStatus(text) {
  if (ui.status) ui.status.textContent = text || "";
}

function applySelectors(locale) {
  ui.localeSelect.value = locale || "pt-BR";
}

function renderFeatures(locale) {
  const t = TRANSLATIONS[locale] ?? TRANSLATIONS["pt-BR"];
  const featureNodes = [
    { id: "feature-1", data: t.features[0] },
    { id: "feature-2", data: t.features[1] },
    { id: "feature-3", data: t.features[2] },
  ];
  featureNodes.forEach(({ id, data }) => {
    const node = document.getElementById(id);
    if (!node) return;
    const titleEl = node.querySelector(".feature-title");
    if (titleEl) titleEl.textContent = data.title;
    const bodyEl = node.querySelector(".feature-body");
    if (bodyEl) bodyEl.textContent = data.body;
  });
}

function renderSteps(locale) {
  const t = TRANSLATIONS[locale] ?? TRANSLATIONS["pt-BR"];
  const steps = [
    { id: "step-1", data: t.steps[0] },
    { id: "step-2", data: t.steps[1] },
    { id: "step-3", data: t.steps[2] },
    { id: "step-4", data: t.steps[3] },
  ];
  steps.forEach(({ id, data }) => {
    const node = document.getElementById(id);
    if (!node) return;
    const titleEl = node.querySelector(".step-title");
    if (titleEl) titleEl.textContent = data.title;
    const bodyEl = node.querySelector(".step-body");
    if (bodyEl) bodyEl.textContent = data.body;
  });
}

function renderFaq(locale) {
  const t = TRANSLATIONS[locale] ?? TRANSLATIONS["pt-BR"];
  const faqIds = ["faq-1", "faq-2", "faq-3", "faq-4", "faq-5", "faq-6", "faq-7"];
  faqIds.forEach((id, idx) => {
    const node = document.getElementById(id);
    const item = t.faqs[idx];
    if (!node || !item) return;
    node.innerHTML = `
      <div class="badge" style="margin-bottom: var(--space-3);">${item.q}</div>
      <p style="color: var(--color-text-slate-200); line-height: 1.6;">${item.a}</p>
    `;
  });
}

function applyTranslations(locale) {
  const t = TRANSLATIONS[locale] ?? TRANSLATIONS["pt-BR"];
  if (ui.heroTitle) ui.heroTitle.textContent = t.heroTitle;
  if (ui.heroSubtitle) ui.heroSubtitle.textContent = t.heroSubtitle;
  const labelLang = document.getElementById("label-language");
  if (labelLang) labelLang.textContent = t.labels.language;
  if (ui.paywallHeading) ui.paywallHeading.textContent = t.paywallHeading;
  if (ui.priceTitle) ui.priceTitle.textContent = t.priceTitle;
  if (ui.priceNote) ui.priceNote.textContent = t.priceNote;
  if (ui.priceNote2) ui.priceNote2.textContent = t.priceNote2;
  if (ui.donationTitle) ui.donationTitle.textContent = t.donationTitle;
  if (ui.donationDesc) ui.donationDesc.textContent = t.donationDesc;
  if (ui.donationCurrencyLabel) ui.donationCurrencyLabel.textContent = t.donationCurrencyLabel;
  if (ui.donationAmountLabel) ui.donationAmountLabel.textContent = t.donationAmountLabel;
  if (ui.donationHelper) ui.donationHelper.textContent = t.donationHelper;
  if (ui.privacyTitle) ui.privacyTitle.textContent = t.privacyTitle;
  if (ui.privacyBody1) ui.privacyBody1.textContent = t.privacyBody1;
  if (ui.privacyBody2) ui.privacyBody2.textContent = t.privacyBody2;
  if (ui.faqTitle) ui.faqTitle.textContent = t.faqTitle;
  renderFeatures(locale);
  renderSteps(locale);
  renderFaq(locale);
}

async function refreshPaywall() {
  setStatus("Carregando...");
  const locale = ui.localeSelect.value;
  const params = new URLSearchParams();
  if (locale) params.set("locale", locale);

  try {
    const data = await fetchJSON(`/api/paywall?${params.toString()}`);
    ui.paywallText.textContent = data.paywallText;
    ui.priceTag.textContent = data.priceTag;
    ui.receiptLine.textContent = data.receiptLine;
    ui.currentSelection.textContent = `Idioma: ${data.locale} • Moeda: ${data.currency}`;
    setStatus("Pronto");
    await saveConfig(locale);
    applyTranslations(locale);
  } catch (err) {
    console.error(err);
    setStatus("Erro ao carregar paywall");
  }
}

async function handleSupport() {
  const amountRaw = ui.donationAmount?.value;
  const amount = amountRaw ? Number(amountRaw) : 0;
  const currency = ui.donationCurrency?.value || "BRL";
  const payload = {
    email: "",
    currency,
    donationAmount: amount,
    donationCurrency: currency,
    successUrl: `${window.location.origin}/success`,
    cancelUrl: `${window.location.origin}/`,
  };
  try {
    const endpoint = currency === "BRL" ? "/api/abacate/checkout" : "/api/stripe/checkout";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Checkout criado (stub). Conecte ao backend real para concluir o pagamento.");
    }
  } catch (err) {
    console.error("Erro ao iniciar apoio", err);
    alert("Não foi possível iniciar o pagamento de apoio.");
  }
}

async function init() {
  syncPath();

  const stored = await loadConfig();
  const storedLocale = stored.locale || navigator.language || "pt-BR";
  applySelectors(storedLocale);
  applyTranslations(storedLocale);

  ui.localeSelect.addEventListener("change", refreshPaywall);

  document.querySelectorAll("a[data-route]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const href = link.getAttribute("href");
      window.history.pushState({}, "", href);
      highlightRoute(href);
    });
  });

  window.addEventListener("popstate", () => highlightRoute(window.location.pathname));

  await refreshPaywall();
}

document.addEventListener("DOMContentLoaded", init);
window.handleSupport = handleSupport;
