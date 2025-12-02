import OpenAI from "openai";
import { AggregatedWorkSummary } from "../aggregation/summary";
import { CommitEntry } from "../git/log";

export type ReportRequest = {
  year: number;
  language: "pt-BR" | "en-US" | "es-ES";
  author: { name: string; email?: string | null };
  roleLevel: "junior" | "mid" | "senior" | "staff" | "lead";
  focus: "self-review" | "promotion";
  companyStyle: "formal" | "casual";
  aggregatedSummary: AggregatedWorkSummary;
  commitsSample: CommitEntry[];
  explicitUserNotes?: {
    wantsToHighlight?: string[];
  };
};

export type ReportResponse = {
  sections: {
    summaryOfYear: string;
    keyProjects: { title: string; description: string; impact: string; evidence: string[] }[];
    technicalChallenges: { challenge: string; solution: string; impact: string; evidence: string[] }[];
    collaborationAndLeadership: string[];
    learningAndGrowth: string[];
    goalsNextCycle: string[];
    appendixEvidence: string[];
  };
  markdown: string;
};

const SYSTEM_PROMPT = `Você é um assistente especializado em transformar o histórico anual de trabalho de desenvolvedores de software em relatórios de autoavaliação e justificativa de promoção.
REGRAS:
1) Não invente fatos, projetos, empresas ou resultados que não possam ser inferidos com alta segurança a partir dos dados de entrada.
2) Se faltar dado, omita ou seja genérico (“contribuí em iniciativas de melhoria contínua do time”) sem citar nomes ou números inventados.
3) Não use emojis.
4) Linguagem corporativa clara, direta e profissional.
5) Adapte o tom a companyStyle: formal (mais sóbrio) ou casual (direto).
6) Adapte profundidade a roleLevel: junior (aprendizado), mid (equilíbrio), senior/staff/lead (impacto, ownership, mentoria, decisões).
7) focus: self-review (equilíbrio contribuições/melhoria) ou promotion (enfatizar impacto e responsabilidades ampliadas).
8) Saída deve ser exatamente um JSON com dois campos: sections e markdown, no formato especificado.
9) O markdown deve ser completo, com seções e subtítulos, pronto para colar.
10) Não mencione que responde em JSON; apenas produza o JSON final.`;

type TwoModelStrategy = {
  enabled: boolean;
  preprocessModel: string;
  finalModel: string;
};

function getTwoModelStrategy(): TwoModelStrategy {
  const enabled = process.env.OPENAI_TWO_MODEL_STRATEGY === "true";
  return {
    enabled,
    preprocessModel: process.env.OPENAI_PREPROCESS_MODEL ?? "gpt-4o-mini",
    finalModel: process.env.OPENAI_FINAL_MODEL ?? "gpt-4o-mini",
  };
}

async function preprocessCommitsWithCheapModel(
  client: OpenAI,
  commits: CommitEntry[],
  model: string
): Promise<{ groupedByTheme: Record<string, CommitEntry[]>; insights: string[] }> {
  const preprocessPrompt = `Você é um assistente que agrupa commits de Git por temas técnicos.

TAREFA: Analise os commits abaixo e:
1. Agrupe-os por tema técnico (performance, bugs, features, refactor, dx, tests, docs, security, a11y)
2. Liste 3-5 insights principais sobre o trabalho (padrões, focos, impactos)

COMMITS:
${JSON.stringify(commits.slice(0, 50))}

Responda em JSON:
{
  "themes": {
    "performance": ["hash1", "hash2"],
    "features": ["hash3"],
    ...
  },
  "insights": ["insight 1", "insight 2", ...]
}`;

  const completion = await client.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    messages: [{ role: "user", content: preprocessPrompt }],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) return { groupedByTheme: {}, insights: [] };

  const parsed = JSON.parse(raw);
  const groupedByTheme: Record<string, CommitEntry[]> = {};

  for (const [theme, hashes] of Object.entries(parsed.themes ?? {})) {
    groupedByTheme[theme] = commits.filter((c) => (hashes as string[]).includes(c.hash));
  }

  return {
    groupedByTheme,
    insights: parsed.insights ?? [],
  };
}

export async function generateReportWithOpenAI(req: ReportRequest, model = process.env.OPENAI_MODEL ?? "gpt-4o-mini"): Promise<ReportResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY não configurada");
  }
  const client = new OpenAI({ apiKey });

  const strategy = getTwoModelStrategy();
  let preprocessedData: { groupedByTheme: Record<string, CommitEntry[]>; insights: string[] } | null = null;

  // Etapa 1: Pré-processamento com modelo barato (se habilitado)
  if (strategy.enabled && req.commitsSample.length > 20) {
    console.log(`[IA] Pré-processando commits com ${strategy.preprocessModel}...`);
    preprocessedData = await preprocessCommitsWithCheapModel(client, req.commitsSample, strategy.preprocessModel);
    console.log(`[IA] Encontrados ${Object.keys(preprocessedData.groupedByTheme).length} temas e ${preprocessedData.insights.length} insights`);
  }

  // Etapa 2: Geração final (com modelo melhor se strategy habilitado)
  const finalModel = strategy.enabled ? strategy.finalModel : model;
  console.log(`[IA] Gerando relatório final com ${finalModel}...`);

  const userPrompt = {
    year: req.year,
    language: req.language,
    author: req.author,
    roleLevel: req.roleLevel,
    focus: req.focus,
    companyStyle: req.companyStyle,
    aggregatedSummary: {
      repos: req.aggregatedSummary.repos,
    },
    commitsSample: req.commitsSample,
    explicitUserNotes: req.explicitUserNotes ?? {},
    // Incluir dados pré-processados se disponíveis
    ...(preprocessedData && {
      preprocessedThemes: Object.keys(preprocessedData.groupedByTheme),
      preprocessedInsights: preprocessedData.insights,
    }),
  };

  const completion = await client.chat.completions.create({
    model: finalModel,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Você receberá um único objeto JSON com os campos acima. Gere o relatório conforme especificação.
${JSON.stringify(userPrompt)}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Resposta vazia do modelo");

  const parsed = JSON.parse(raw) as ReportResponse;
  return parsed;
}
