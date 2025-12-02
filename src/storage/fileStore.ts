import fs from "node:fs";
import path from "node:path";

export type StoredLicense = {
  key: string;
  email?: string;
  status: "active" | "revoked" | "pending";
  maxMachines: number;
  machines: { machineId: string; activatedAt: string }[];
  createdAt: string;
  updatedAt: string;
};

export type LicenseStore = {
  licenses: StoredLicense[];
};

const DEFAULT_FILE = path.join(process.cwd(), ".license-store.json");

export function loadStore(filePath: string = DEFAULT_FILE): LicenseStore {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as LicenseStore;
  } catch (_) {
    return { licenses: [] };
  }
}

export function saveStore(store: LicenseStore, filePath: string = DEFAULT_FILE): void {
  fs.writeFileSync(filePath, JSON.stringify(store, null, 2), "utf-8");
}

export function upsertLicense(license: StoredLicense, filePath: string = DEFAULT_FILE): void {
  const store = loadStore(filePath);
  const idx = store.licenses.findIndex((l) => l.key === license.key);
  if (idx >= 0) {
    store.licenses[idx] = license;
  } else {
    store.licenses.push(license);
  }
  saveStore(store, filePath);
}

export function findLicense(key: string, filePath: string = DEFAULT_FILE): StoredLicense | undefined {
  return loadStore(filePath).licenses.find((l) => l.key === key);
}
