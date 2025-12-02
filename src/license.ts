import { loadConfig, saveConfig } from "./config/store";
import { CurrencyCode, formatPrice, resolvePrice } from "./config/pricing";
import { findLicense, StoredLicense, upsertLicense } from "./storage/fileStore";

type LicenseStatus = {
  licensed: boolean;
  key?: string;
  currency: CurrencyCode;
  price: string;
  message?: string;
};

const DEFAULT_MAX_MACHINES = 3;

function createLocalLicense(key: string): StoredLicense {
  const now = new Date().toISOString();
  return {
    key,
    status: "active",
    email: undefined,
    maxMachines: DEFAULT_MAX_MACHINES,
    machines: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function activateLicense(key: string, machineId: string): LicenseStatus {
  const cfg = loadConfig();
  const license = findLicense(key) ?? createLocalLicense(key);

  if (license.status !== "active") {
    return { licensed: false, key, currency: resolvePrice().currency, price: formatPrice(resolvePrice().currency), message: "Licença não está ativa" };
  }

  const already = license.machines.find((m) => m.machineId === machineId);
  if (!already && license.machines.length >= license.maxMachines) {
    return { licensed: false, key, currency: resolvePrice().currency, price: formatPrice(resolvePrice().currency), message: "Limite de máquinas atingido" };
  }

  if (!already) {
    license.machines.push({ machineId, activatedAt: new Date().toISOString() });
    license.updatedAt = new Date().toISOString();
    upsertLicense(license);
  }

  saveConfig({ ...cfg, licenseKey: key });
  return { licensed: true, key, currency: resolvePrice().currency, price: formatPrice(resolvePrice().currency), message: "Licença ativada" };
}

export function checkLicense(localeInput?: string, currencyOverride?: CurrencyCode): LicenseStatus {
  const { currency } = resolvePrice(localeInput, currencyOverride);
  const cfg = loadConfig();
  const key = cfg.licenseKey;
  if (!key) {
    return { licensed: false, currency, price: formatPrice(currency) };
  }
  const license = findLicense(key);
  if (!license) {
    return { licensed: false, key, currency, price: formatPrice(currency), message: "Licença não encontrada (modo local)" };
  }
  if (license.status !== "active") {
    return { licensed: false, key, currency, price: formatPrice(currency), message: "Licença inativa" };
  }
  return { licensed: true, key, currency, price: formatPrice(currency) };
}

export function saveLicense(key: string) {
  const cfg = loadConfig();
  saveConfig({ ...cfg, licenseKey: key });
}

export function clearLicense() {
  const cfg = loadConfig();
  delete cfg.licenseKey;
  saveConfig(cfg);
}
