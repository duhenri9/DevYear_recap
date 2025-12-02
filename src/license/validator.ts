import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { createHash } from "node:crypto";

const LICENSE_API_URL = process.env.LICENSE_API_URL ?? "https://devyear.app/api/license/activate";

type LicenseData = {
  key: string;
  offlineToken?: string;
  validatedAt?: string;
  email?: string;
};

type ValidationResult = {
  valid: boolean;
  message: string;
  email?: string;
};

function getLicensePath(): string {
  const homeDir = os.homedir();
  return path.join(homeDir, ".devyear-license.json");
}

function generateMachineId(): string {
  const hostname = os.hostname();
  const platform = os.platform();
  const arch = os.arch();
  const combined = `${hostname}-${platform}-${arch}`;
  return createHash("sha256").update(combined).digest("hex").substring(0, 32);
}

function loadLocalLicense(): LicenseData | null {
  const licensePath = getLicensePath();
  if (!fs.existsSync(licensePath)) {
    return null;
  }
  try {
    const content = fs.readFileSync(licensePath, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function saveLocalLicense(data: LicenseData): void {
  const licensePath = getLicensePath();
  fs.writeFileSync(licensePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function validateLicenseOnline(licenseKey: string): Promise<ValidationResult> {
  const machineId = generateMachineId();

  try {
    const response = await fetch(LICENSE_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ licenseKey, machineId }),
    });

    const data = await response.json();

    if (data.ok && data.offlineToken) {
      // Salvar token offline para validações futuras
      saveLocalLicense({
        key: licenseKey,
        offlineToken: data.offlineToken,
        validatedAt: new Date().toISOString(),
        email: data.email,
      });

      return {
        valid: true,
        message: "Licença válida e ativada com sucesso",
        email: data.email,
      };
    }

    return {
      valid: false,
      message: data.error ?? "Licença inválida",
    };
  } catch (error: any) {
    return {
      valid: false,
      message: `Erro ao validar online: ${error.message}`,
    };
  }
}

export function validateLicenseOffline(): ValidationResult {
  const local = loadLocalLicense();

  if (!local || !local.offlineToken) {
    return {
      valid: false,
      message: "Nenhuma licença encontrada localmente",
    };
  }

  // Validação simples: verificar se token existe e foi validado há menos de 30 dias
  if (local.validatedAt) {
    const validated = new Date(local.validatedAt);
    const now = new Date();
    const daysDiff = (now.getTime() - validated.getTime()) / (1000 * 60 * 60 * 24);

    if (daysDiff > 30) {
      return {
        valid: false,
        message: "Licença precisa ser revalidada online (última validação há mais de 30 dias)",
      };
    }
  }

  return {
    valid: true,
    message: "Licença válida (cache local)",
    email: local.email,
  };
}

export async function validateLicense(licenseKey?: string, forceOnline = false): Promise<ValidationResult> {
  // Se fornecer licenseKey, validar online
  if (licenseKey) {
    return await validateLicenseOnline(licenseKey);
  }

  // Se não fornecer, tentar validar offline
  if (!forceOnline) {
    const offlineResult = validateLicenseOffline();
    if (offlineResult.valid) {
      return offlineResult;
    }
  }

  return {
    valid: false,
    message: "Nenhuma licença válida encontrada. Use --license <SUA_CHAVE> para ativar",
  };
}

export function clearLocalLicense(): void {
  const licensePath = getLicensePath();
  if (fs.existsSync(licensePath)) {
    fs.unlinkSync(licensePath);
  }
}
