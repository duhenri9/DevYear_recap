import fs from "node:fs";
import path from "node:path";

export function findGitRepos(root: string): string[] {
  const repos: string[] = [];
  const entries = fs.readdirSync(root, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === ".git") continue;
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) {
      if (fs.existsSync(path.join(full, ".git"))) {
        repos.push(full);
      } else {
        // shallow recursion to depth 2
        const subEntries = fs.readdirSync(full, { withFileTypes: true });
        for (const sub of subEntries) {
          const subFull = path.join(full, sub.name);
          if (sub.isDirectory() && fs.existsSync(path.join(subFull, ".git"))) {
            repos.push(subFull);
          }
        }
      }
    }
  }
  return repos.length ? repos : [root];
}
