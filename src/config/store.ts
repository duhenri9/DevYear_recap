import fs from "node:fs";
import path from "node:path";
import { CurrencyCode } from "./pricing";

export type UserConfig = {
  locale?: string;
  currency?: CurrencyCode;
  licenseKey?: string;
};

const DEFAULT_FILENAME = ".devyear-config.json";

export function getDefaultConfigPath(baseDir: string = process.cwd()): string {
  return path.join(baseDir, DEFAULT_FILENAME);
}

export function loadConfig(configPath: string = getDefaultConfigPath()): UserConfig {
  try {
    const raw = fs.readFileSync(configPath, "utf-8");
    const parsed = JSON.parse(raw) as UserConfig;
    return parsed ?? {};
  } catch (err) {
    return {};
  }
}

export function saveConfig(config: UserConfig, configPath: string = getDefaultConfigPath()): void {
  const normalized: UserConfig = {};
  if (config.locale) normalized.locale = config.locale;
  if (config.currency) normalized.currency = config.currency;
  if (config.licenseKey) normalized.licenseKey = config.licenseKey;

  fs.writeFileSync(configPath, JSON.stringify(normalized, null, 2), "utf-8");
}

export function clearConfig(configPath: string = getDefaultConfigPath()): void {
  try {
    fs.unlinkSync(configPath);
  } catch (err) {
    // ignore if file does not exist
  }
}
