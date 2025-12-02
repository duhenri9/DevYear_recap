import { execSync } from "node:child_process";
import { MergeEntry, scanMerges } from "../git/log";

export type PullRequestInfo = {
  title: string;
  url?: string;
  repoName: string;
  mergedAt?: string;
};

function ghAvailable(): boolean {
  try {
    execSync("gh --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export function fetchPRs(repoPath: string, since = "2024-01-01", until?: string): PullRequestInfo[] {
  if (ghAvailable()) {
    try {
      const cmd = ["gh", "pr", "list", "--state", "merged", "--json", "title,number,mergedAt,url", since ? `--search merged:>=${since}` : ""]
        .filter(Boolean)
        .join(" ");
      const raw = execSync(cmd, { cwd: repoPath, encoding: "utf-8" });
      const parsed = JSON.parse(raw) as { title: string; number: number; mergedAt?: string; url?: string }[];
      return parsed.map((p) => ({
        title: p.title,
        url: p.url,
        mergedAt: p.mergedAt,
        repoName: "",
      }));
    } catch {
      // fallback below
    }
  }

  // Fallback: use merge commits as PR proxies
  const merges: MergeEntry[] = scanMerges(repoPath, since, until);
  return merges.map((m) => ({
    title: m.title,
    repoName: m.repoName,
    mergedAt: m.date,
  }));
}
