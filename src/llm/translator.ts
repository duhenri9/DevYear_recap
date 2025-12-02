import { CommitEntry } from "../git/log";

export type ReportLanguage = "pt" | "en" | "es";

export type Bullet = {
  action: string;
  impact: string;
  ref?: string;
};

const LABELS: Record<ReportLanguage, { title: string; entregas: string; desafios: string; impacto: string; empty: string; noImpact: string }> =
  {
    pt: {
      title: "DevYear Recap",
      entregas: "Principais Entregas",
      desafios: "Desafios Técnicos Superados",
      impacto: "Impacto no Negócio",
      empty: "- (sem registros)",
      noImpact: "(impacto não informado)",
    },
    en: {
      title: "DevYear Recap",
      entregas: "Key Deliveries",
      desafios: "Technical Challenges Overcome",
      impacto: "Business Impact",
      empty: "- (no records)",
      noImpact: "(impact not provided)",
    },
    es: {
      title: "DevYear Recap",
      entregas: "Entregas Principales",
      desafios: "Desafíos Técnicos Superados",
      impacto: "Impacto en el Negocio",
      empty: "- (sin registros)",
      noImpact: "(impacto no informado)",
    },
  };

function pickLang(lang?: string): ReportLanguage {
  if (!lang) return "pt";
  const lower = lang.toLowerCase();
  if (lower.startsWith("en")) return "en";
  if (lower.startsWith("es")) return "es";
  return "pt";
}

function impactText(action: string, lang: ReportLanguage, fallback: string): string {
  const map: Record<ReportLanguage, { perf: string; bug: string; refactor: string; docs: string }> = {
    pt: {
      perf: "Melhora de performance e resposta.",
      bug: "Correção de estabilidade e redução de erros.",
      refactor: "Código mais limpo e sustentável.",
      docs: "Documentação e comunicabilidade do time.",
    },
    en: {
      perf: "Performance and latency improvements.",
      bug: "Stability fix and error reduction.",
      refactor: "Cleaner, more maintainable code.",
      docs: "Documentation and team communication.",
    },
    es: {
      perf: "Mejoras de rendimiento y latencia.",
      bug: "Corrección de estabilidad y reducción de errores.",
      refactor: "Código más limpio y sostenible.",
      docs: "Documentación y comunicación del equipo.",
    },
  };

  if (/perf|latenc|cache|optimi/i.test(action)) return map[lang].perf;
  if (/bug|fix/i.test(action)) return map[lang].bug;
  if (/refactor/i.test(action)) return map[lang].refactor;
  if (/doc/i.test(action)) return map[lang].docs;
  return fallback;
}

function heuristics(commit: CommitEntry, lang: ReportLanguage): Bullet {
  const labels = LABELS[lang];
  const action = commit.message;
  const ref = commit.hash.slice(0, 7);
  const impact = impactText(action, lang, labels.noImpact);
  return { action, impact, ref };
}

export function toBullets(commits: CommitEntry[], lang?: string): Bullet[] {
  const picked = pickLang(lang);
  return commits.map((c) => heuristics(c, picked));
}

export function buildMarkdown(bullets: Bullet[], lang?: string): string {
  const picked = pickLang(lang);
  const labels = LABELS[picked];

  const entregas: string[] = [];
  const desafios: string[] = [];
  const impacto: string[] = [];

  bullets.forEach((b) => {
    const line = `- ${b.action} — ${b.impact}${b.ref ? ` (git ${b.ref})` : ""}`;
    if (/fix|bug/i.test(b.action)) {
      desafios.push(line);
    } else if (/perf|latenc|cache|optimi/i.test(b.action)) {
      impacto.push(line);
    } else {
      entregas.push(line);
    }
  });

  const md = [
    `# ${labels.title}`,
    "",
    `## ${labels.entregas}`,
    entregas.length ? entregas.join("\n") : labels.empty,
    "",
    `## ${labels.desafios}`,
    desafios.length ? desafios.join("\n") : labels.empty,
    "",
    `## ${labels.impacto}`,
    impacto.length ? impacto.join("\n") : labels.empty,
    "",
  ].join("\n");

  return md;
}

/**
 * Stub para futura integração com OpenAI. Hoje usamos heurística local.
 */
export async function generateReport(commits: CommitEntry[], lang?: string): Promise<string> {
  const bullets = toBullets(commits, lang);
  return buildMarkdown(bullets, lang);
}
