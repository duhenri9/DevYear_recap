import { CommitEntry } from "../git/log";

export type RepoSummary = {
  repoName: string;
  totalCommits: number;
  topics: string[];
};

export type AggregatedWorkSummary = {
  year: number;
  author: { name: string; email?: string | null };
  repos: RepoSummary[];
  rawCommitsSample: CommitEntry[];
  userInputs?: {
    roleLevel?: string;
    focus?: string;
    companyStyle?: string;
  };
};

const TOPIC_PATTERNS: Record<string, RegExp[]> = {
  performance: [/perf/i, /latenc/i, /cache/i, /optimi[zs]/i, /speed/i, /faster/i, /slow/i, /throughput/i, /bottleneck/i],
  bugs: [/\bfix\b/i, /\bbug\b/i, /issue/i, /error/i, /crash/i, /\bfail/i, /broken/i, /resolve/i, /patch/i],
  features: [/\bfeat\b/i, /\badd\b/i, /\bnew\b/i, /implement/i, /create/i, /introduce/i, /enable/i],
  refactor: [/refactor/i, /clean/i, /improve/i, /rewrite/i, /restructure/i, /simplify/i, /extract/i],
  dx: [/dx\b/i, /devex/i, /tooling/i, /\bbuild\b/i, /\bci\b/i, /\bcd\b/i, /pipeline/i, /workflow/i, /script/i],
  docs: [/\bdocs?\b/i, /readme/i, /comment/i, /jsdoc/i, /documentation/i, /guide/i, /tutorial/i],
  tests: [/\btest/i, /spec\b/i, /coverage/i, /\bjest\b/i, /vitest/i, /cypress/i, /playwright/i, /e2e/i, /unit/i],
  security: [/security/i, /vuln/i, /\bcve\b/i, /sanitize/i, /\bxss\b/i, /\bsql\b.*inject/i, /auth/i, /oauth/i, /jwt/i, /encrypt/i],
  a11y: [/a11y/i, /accessibility/i, /\baria\b/i, /wcag/i, /screen.?reader/i, /keyboard.?nav/i],
  reliability: [/retry/i, /failover/i, /resilien/i, /timeout/i, /monitor/i, /health.?check/i, /circuit.?break/i],
  data: [/migrat/i, /schema/i, /\bseed/i, /database/i, /\bsql\b/i, /query/i, /index/i],
  api: [/\bapi\b/i, /endpoint/i, /\brest\b/i, /graphql/i, /webhook/i, /route/i],
  ui: [/\bui\b/i, /design/i, /style/i, /\bcss\b/i, /layout/i, /component/i, /theme/i, /responsive/i],
  infra: [/infra/i, /deploy/i, /docker/i, /k8s/i, /kubernetes/i, /aws/i, /cloud/i, /server/i, /hosting/i],
};

function detectTopics(message: string): string[] {
  const hits: string[] = [];
  for (const [topic, patterns] of Object.entries(TOPIC_PATTERNS)) {
    if (patterns.some((re) => re.test(message))) hits.push(topic);
  }
  return hits.length ? hits : ["general"];
}

export function summarizeByRepo(commits: CommitEntry[]): RepoSummary[] {
  const map = new Map<string, { total: number; topics: Set<string> }>();
  commits.forEach((c) => {
    const entry = map.get(c.repoName) ?? { total: 0, topics: new Set<string>() };
    entry.total += 1;
    detectTopics(c.message).forEach((t) => entry.topics.add(t));
    map.set(c.repoName, entry);
  });
  return Array.from(map.entries()).map(([repoName, data]) => ({
    repoName,
    totalCommits: data.total,
    topics: Array.from(data.topics),
  }));
}

export function buildAggregatedSummary(
  commits: CommitEntry[],
  opts: { year: number; author: { name: string; email?: string | null }; userInputs?: AggregatedWorkSummary["userInputs"] }
): AggregatedWorkSummary {
  const repos = summarizeByRepo(commits);
  const sample = commits.slice(0, 50); // cap to keep prompt small
  return {
    year: opts.year,
    author: opts.author,
    repos,
    rawCommitsSample: sample,
    userInputs: opts.userInputs,
  };
}
