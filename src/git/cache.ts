import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import type { CommitEntry } from "./log";

type CacheEntry = {
  key: string;
  data: CommitEntry[];
  createdAt: number;
  params: {
    repoPath: string;
    author?: string;
    since?: string;
    until?: string;
  };
};

const CACHE_DIR = path.join(os.homedir(), ".devyear-cache");
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

function ensureCacheDir(): void {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

function getCacheKey(params: {
  repoPath: string;
  author?: string;
  since?: string;
  until?: string;
}): string {
  const normalized = JSON.stringify({
    repoPath: path.normalize(params.repoPath),
    author: params.author ?? "",
    since: params.since ?? "",
    until: params.until ?? "",
  });
  return crypto.createHash("sha256").update(normalized).digest("hex").substring(0, 16);
}

function getCachePath(key: string): string {
  return path.join(CACHE_DIR, `${key}.json`);
}

export function getCachedCommits(params: {
  repoPath: string;
  author?: string;
  since?: string;
  until?: string;
}): CommitEntry[] | null {
  try {
    ensureCacheDir();
    const key = getCacheKey(params);
    const cachePath = getCachePath(key);

    if (!fs.existsSync(cachePath)) {
      return null;
    }

    const content = fs.readFileSync(cachePath, "utf-8");
    const entry: CacheEntry = JSON.parse(content);

    // Verificar TTL
    const age = Date.now() - entry.createdAt;
    if (age > CACHE_TTL_MS) {
      fs.unlinkSync(cachePath);
      return null;
    }

    // Verificar se os parâmetros ainda batem
    if (
      path.normalize(entry.params.repoPath) !== path.normalize(params.repoPath) ||
      entry.params.author !== params.author ||
      entry.params.since !== params.since ||
      entry.params.until !== params.until
    ) {
      return null;
    }

    console.log(`[Cache] Hit para ${path.basename(params.repoPath)} (idade: ${Math.round(age / 1000 / 60)}min)`);
    return entry.data;
  } catch (error) {
    return null;
  }
}

export function setCachedCommits(
  params: {
    repoPath: string;
    author?: string;
    since?: string;
    until?: string;
  },
  commits: CommitEntry[]
): void {
  try {
    ensureCacheDir();
    const key = getCacheKey(params);
    const cachePath = getCachePath(key);

    const entry: CacheEntry = {
      key,
      data: commits,
      createdAt: Date.now(),
      params,
    };

    fs.writeFileSync(cachePath, JSON.stringify(entry), "utf-8");
    console.log(`[Cache] Salvado para ${path.basename(params.repoPath)} (${commits.length} commits)`);
  } catch (error) {
    console.warn(`[Cache] Falha ao salvar: ${error}`);
  }
}

export function clearCache(): void {
  try {
    if (fs.existsSync(CACHE_DIR)) {
      const files = fs.readdirSync(CACHE_DIR);
      for (const file of files) {
        fs.unlinkSync(path.join(CACHE_DIR, file));
      }
      console.log(`[Cache] Limpo: ${files.length} arquivo(s) removido(s)`);
    }
  } catch (error) {
    console.warn(`[Cache] Falha ao limpar: ${error}`);
  }
}
