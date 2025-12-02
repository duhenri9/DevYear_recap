#!/usr/bin/env ts-node
import fs from "node:fs";
import path from "node:path";
import { detectAuthor, filterNoise, scanCommits, scanMerges } from "./git/log";
import { generateReport } from "./llm/translator";
import { buildAggregatedSummary } from "./aggregation/summary";
import { generateReportWithOpenAI } from "./llm/openai";
import { exportPdfFromMarkdown } from "./export/pdf";
import { fetchPRs } from "./integrations/prs";
import { fetchJiraIssues } from "./integrations/jira";
import { validateLicense, clearLocalLicense } from "./license/validator";
import { clearCache } from "./git/cache";
import { findGitRepos } from "./git/discovery";

type Args = {
  repo: string;
  since?: string;
  until?: string;
  author?: string;
  out?: string;
  lang?: string;
  year?: number;
  useAi?: boolean;
  model?: string;
  pdf?: string;
  license?: string;
  clearLicense?: boolean;
  clearCache?: boolean;
  skipCache?: boolean;
  preview?: boolean;
  role?: "junior" | "mid" | "senior" | "staff" | "lead";
  focus?: "self-review" | "promotion";
  root?: string;
};

function parseArgs(): Args {
  const args = process.argv.slice(2);
  const out: Args = { repo: process.cwd() };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--repo" && args[i + 1]) out.repo = args[++i];
    else if (arg === "--since" && args[i + 1]) out.since = args[++i];
    else if (arg === "--until" && args[i + 1]) out.until = args[++i];
    else if (arg === "--author" && args[i + 1]) out.author = args[++i];
    else if (arg === "--out" && args[i + 1]) out.out = args[++i];
    else if (arg === "--lang" && args[i + 1]) out.lang = args[++i];
    else if (arg === "--year" && args[i + 1]) out.year = Number(args[++i]);
    else if (arg === "--use-ai") out.useAi = true;
    else if (arg === "--model" && args[i + 1]) out.model = args[++i];
    else if (arg === "--pdf" && args[i + 1]) out.pdf = args[++i];
    else if (arg === "--license" && args[i + 1]) out.license = args[++i];
    else if (arg === "--clear-license") out.clearLicense = true;
    else if (arg === "--clear-cache") out.clearCache = true;
    else if (arg === "--skip-cache") out.skipCache = true;
    else if (arg === "--preview") out.preview = true;
    else if (arg === "--role" && args[i + 1]) out.role = args[++i] as Args["role"];
    else if (arg === "--focus" && args[i + 1]) out.focus = args[++i] as Args["focus"];
    else if (arg === "--root" && args[i + 1]) out.root = args[++i];
  }
  return out;
}

async function main() {
  const args = parseArgs();

  // Limpar cache
  if (args.clearCache) {
    clearCache();
    return;
  }

  // Gerenciar licença
  if (args.clearLicense) {
    clearLocalLicense();
    console.log("Licença local removida com sucesso.");
    return;
  }

  if (args.license) {
    console.log("Validando licença online...");
    const result = await validateLicense(args.license);
    if (result.valid) {
      console.log(`\u2714 ${result.message}`);
      if (result.email) console.log(`  Email: ${result.email}`);
      return;
    } else {
      console.error(`\u2717 ${result.message}`);
      process.exit(1);
    }
  }

  const repoPath = path.resolve(args.repo);
  const since = args.since ?? "2024-01-01";
  const until = args.until;
  const author = args.author ?? detectAuthor(repoPath);
  const year = args.year ?? new Date().getFullYear();
  const roleLevel = args.role ?? "senior";
  const focus = args.focus ?? "promotion";

  if (!author) {
    console.error("Autor não detectado. Use --author \"Seu Nome\".");
    process.exit(1);
  }

  const reposToScan = args.root ? findGitRepos(path.resolve(args.root)) : [repoPath];

  console.log(`Escaneando ${reposToScan.length} repositório(s)`);
  console.log(`Autor: ${author}`);
  console.log(`Período: desde ${since}${until ? ` até ${until}` : ""}`);
  console.log(`Idioma do relatório: ${args.lang ?? "pt"}`);
  console.log(`Foco: ${focus} | Senioridade: ${roleLevel}`);

  let allCommits: ReturnType<typeof scanCommits> = [];
  let allMerges: ReturnType<typeof scanMerges> = [];

  reposToScan.forEach((repo) => {
    console.log(`→ ${path.basename(repo)}`);
    const commits = scanCommits({ repoPath: repo, since, until, author, skipCache: args.skipCache });
    const merges = scanMerges(repo, since, until);
    console.log(`   commits: ${commits.length} | merges: ${merges.length}`);
    allCommits = allCommits.concat(commits);
    allMerges = allMerges.concat(merges);
  });

  const filtered = filterNoise(allCommits);
  console.log(`Total commits: ${allCommits.length} | Após filtro: ${filtered.length} | Merges/PRs: ${allMerges.length}`);

  const prs = reposToScan.flatMap((repo) => fetchPRs(repo, since, until));
  const jira = await fetchJiraIssues(`assignee = currentUser() AND resolved >= ${since}`);

  const summary = buildAggregatedSummary(filtered, {
    year,
    author: { name: author },
  });

  let report: string;
  if (args.useAi) {
    console.log("Chamando OpenAI para gerar relatório...");
    const ai = await generateReportWithOpenAI(
      {
        year,
        language: (args.lang === "en" ? "en-US" : args.lang === "es" ? "es-ES" : "pt-BR") as "pt-BR" | "en-US" | "es-ES",
        author: { name: author },
        roleLevel,
        focus,
        companyStyle: "formal",
        aggregatedSummary: summary,
        commitsSample: filtered.slice(0, 30),
        explicitUserNotes: {
          wantsToHighlight: [
            ...allMerges.slice(0, 5).map((m) => `${m.title} (${m.repoName})`),
            ...prs.slice(0, 5).map((p) => `PR: ${p.title}`),
            ...jira.slice(0, 5).map((j) => `Jira ${j.key}: ${j.summary}`),
          ],
        },
      },
      args.model
    );
    report = ai.markdown;
  } else {
    report = await generateReport(filtered, args.lang);
  }

  // Validar licença antes de exportar
  const licenseResult = await validateLicense();

  if (!args.preview && !licenseResult.valid) {
    console.log("\n--- Preview do Relatório (primeiras linhas) ---\n");
    const previewLines = report.split("\n").slice(0, 10).join("\n");
    console.log(previewLines);
    console.log("\n[... CONTEÚDO BLOQUEADO ...]\n");
    console.error(`\n\u2717 ${licenseResult.message}`);
    console.error("\nCompre em: https://devyear.app");
    console.error("Após comprar, ative com: npm run scan -- --license SUA_CHAVE\n");
    process.exit(1);
  }

  if (licenseResult.valid) {
    console.log(`\n\u2714 Licença válida (${licenseResult.email ?? "verificada"})\n`);
  }

  if (args.out) {
    fs.writeFileSync(args.out, report, "utf-8");
    console.log(`Relatório salvo em ${args.out}`);
  } else {
    console.log("\n--- Relatório ---\n");
    console.log(report);
  }

  if (args.pdf) {
    exportPdfFromMarkdown(report, { outPath: args.pdf, title: "DevYear Recap" });
    console.log(`PDF gerado em ${args.pdf}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
