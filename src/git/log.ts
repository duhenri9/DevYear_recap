import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { getCachedCommits, setCachedCommits } from "./cache";

export type CommitEntry = {
  date: string; // YYYY-MM-DD
  message: string;
  hash: string;
  repoName: string;
  branch?: string | null;
};

export type ScanOptions = {
  repoPath: string;
  author?: string;
  since?: string;
  until?: string;
  skipCache?: boolean;
};

function run(command: string, cwd: string): string {
  return execSync(command, { cwd, encoding: "utf-8" });
}

export function detectAuthor(repoPath: string): string | undefined {
  try {
    const name = run("git config user.name", repoPath).trim();
    if (name) return name;
  } catch (_) {
    // ignore
  }
  // fallback: global config
  try {
    const name = execSync("git config --global user.name", { encoding: "utf-8" }).trim();
    if (name) return name;
  } catch (_) {
    // ignore
  }
  return undefined;
}

function isGitRepo(repoPath: string): boolean {
  return fs.existsSync(path.join(repoPath, ".git"));
}

export function scanCommits(options: ScanOptions): CommitEntry[] {
  const { repoPath, since = "2024-01-01", until, skipCache = false } = options;
  if (!isGitRepo(repoPath)) {
    throw new Error(`Path is not a git repo: ${repoPath}`);
  }
  const author = options.author ?? detectAuthor(repoPath);
  if (!author) {
    throw new Error("Could not detect author from git config. Pass --author.");
  }

  // Tentar cache primeiro (se não foi explicitamente desabilitado)
  if (!skipCache) {
    const cached = getCachedCommits({ repoPath, author, since, until });
    if (cached) {
      return cached;
    }
  }

  // Cache miss ou desabilitado: executar git log
  const cmd = [
    `git log`,
    `--author="${author}"`,
    `--since="${since}"`,
    until ? `--until="${until}"` : "",
    `--pretty=format:%H|%ad|%s`,
    `--date=short`,
    `--no-merges`,
  ].join(" ");

  const output = run(cmd, repoPath);
  const commits = output
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [hash, date, ...rest] = line.split("|");
      const message = rest.join("|").trim();
      return { hash, date, message, repoName: path.basename(repoPath) };
    });

  // Salvar no cache
  if (!skipCache && commits.length > 0) {
    setCachedCommits({ repoPath, author, since, until }, commits);
  }

  return commits;
}

export function filterNoise(commits: CommitEntry[]): CommitEntry[] {
  const skipPatterns = [/merge/i, /\bwip\b/i, /typo/i];
  return commits.filter((commit) => !skipPatterns.some((re) => re.test(commit.message)));
}

export type MergeEntry = {
  hash: string;
  date: string;
  title: string;
  repoName: string;
};

export function scanMerges(repoPath: string, since = "2024-01-01", until?: string): MergeEntry[] {
  if (!isGitRepo(repoPath)) {
    throw new Error(`Path is not a git repo: ${repoPath}`);
  }
  const cmd = [
    `git log`,
    `--merges`,
    `--since="${since}"`,
    until ? `--until="${until}"` : "",
    `--pretty=format:%H|%ad|%s`,
    `--date=short`,
  ].join(" ");
  const output = run(cmd, repoPath);
  return output
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [hash, date, ...rest] = line.split("|");
      const title = rest.join("|").trim();
      return { hash, date, title, repoName: path.basename(repoPath) };
    });
}
