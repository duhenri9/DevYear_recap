import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { URL } from "node:url";
import { buildPaywallView } from "./paywall";
import { CurrencyCode } from "./config/pricing";
import { clearConfig, loadConfig, saveConfig } from "./config/store";
import { activateLicense, checkLicense, clearLicense, saveLicense } from "./license";
import crypto from "node:crypto";

type MimeMap = Record<string, string>;

const mimeTypes: MimeMap = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

const publicDir = path.join(__dirname, "..", "public");
const rootDir = path.join(__dirname, "..");
const INDEX_ROUTES = new Set(["/app", "/paywall", "/report"]);

function getFile(filePath: string): { content: Buffer; type: string } | null {
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) return null;
  const ext = path.extname(filePath);
  const type = mimeTypes[ext] ?? "application/octet-stream";
  const content = fs.readFileSync(filePath);
  return { content, type };
}

function resolveFile(requestPath: string): { content: Buffer; type: string } | null {
  const normalized = requestPath === "/" ? "/index.html" : requestPath;
  const candidates = [path.join(publicDir, normalized), path.join(rootDir, normalized)];

  for (const candidate of candidates) {
    const found = getFile(candidate);
    if (found) return found;
  }
  return null;
}

function parseCurrency(input?: string): CurrencyCode | undefined {
  if (!input) return undefined;
  const upper = input.toUpperCase();
  if (upper === "BRL" || upper === "EUR" || upper === "GBP") return upper;
  return undefined;
}

function sendJson(res: http.ServerResponse, status: number, payload: unknown) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });
}

function startServer(port: number) {
  const server = http.createServer(async (req, res) => {
    if (!req.url) {
      res.writeHead(400);
      res.end("Bad Request");
      return;
    }

    const url = new URL(req.url, `http://localhost:${port}`);
    const pathname = decodeURIComponent(url.pathname);

    if (pathname === "/") {
      res.writeHead(302, { Location: "/app" });
      res.end();
      return;
    }

    if (pathname === "/health") {
      sendJson(res, 200, { status: "ok" });
      return;
    }

    if (pathname === "/api/paywall" && req.method === "GET") {
      const locale = url.searchParams.get("locale") ?? undefined;
      const currency = parseCurrency(url.searchParams.get("currency") ?? undefined);
      const view = buildPaywallView({ localeInput: locale, currencyOverride: currency, date: new Date() });
      sendJson(res, 200, view);
      return;
    }

    if (pathname === "/api/license") {
      if (req.method === "GET") {
        const locale = url.searchParams.get("locale") ?? undefined;
        const currency = parseCurrency(url.searchParams.get("currency") ?? undefined);
        sendJson(res, 200, checkLicense(locale, currency));
        return;
      }
      if (req.method === "POST") {
        const raw = await readBody(req);
        try {
          const parsed = JSON.parse(raw) as { key: string; machineId?: string };
          if (!parsed.key) {
            sendJson(res, 400, { error: "key required" });
            return;
          }
          const machineId = parsed.machineId ?? crypto.randomUUID();
          const status = activateLicense(parsed.key.trim(), machineId);
          sendJson(res, 200, { ...status, machineId });
        } catch (_) {
          sendJson(res, 400, { error: "Invalid JSON" });
        }
        return;
      }
      if (req.method === "DELETE") {
        clearLicense();
        sendJson(res, 200, checkLicense());
        return;
      }
    }

    if (pathname === "/api/stripe/checkout" && req.method === "POST") {
      const raw = await readBody(req);
      let body: any = {};
      try {
        body = JSON.parse(raw);
      } catch (_) {
        // ignore
      }
      sendJson(res, 200, {
        url: "https://checkout.stripe.com/test-session",
        note: "Stub checkout - implementar Stripe real",
        donationAmount: body?.donationAmount ?? 0,
        donationCurrency: body?.donationCurrency ?? body?.currency ?? "BRL",
      });
      return;
    }

    if (pathname === "/api/stripe/webhook" && req.method === "POST") {
      sendJson(res, 200, { ok: true, note: "Stub webhook - implementar Stripe + Drizzle/DB" });
      return;
    }

    if (pathname === "/api/abacate/checkout" && req.method === "POST") {
      const raw = await readBody(req);
      let body: any = {};
      try {
        body = JSON.parse(raw);
      } catch (_) {
        // ignore
      }
      sendJson(res, 200, {
        url: "https://abacatepay.example.com/pix-session",
        qrCodeData: "PIX|DevYear|" + (body?.donationAmount ?? 25),
        note: "Stub Pix - implementar Abacate Pay real",
        donationAmount: body?.donationAmount ?? 0,
        donationCurrency: body?.donationCurrency ?? "BRL",
      });
      return;
    }

    if (pathname === "/api/config") {
      if (req.method === "GET") {
        const stored = loadConfig();
        sendJson(res, 200, stored);
        return;
      }
      if (req.method === "POST") {
        const raw = await readBody(req);
        try {
          const parsed = JSON.parse(raw) as { locale?: string; currency?: string | null };
          const currency = parseCurrency(parsed.currency ?? undefined);
          saveConfig({
            locale: parsed.locale,
            currency,
          });
          sendJson(res, 200, loadConfig());
        } catch (err) {
          sendJson(res, 400, { error: "Invalid JSON" });
        }
        return;
      }
      if (req.method === "DELETE") {
        clearConfig();
        sendJson(res, 200, {});
        return;
      }
    }

    if (INDEX_ROUTES.has(pathname)) {
      const file = resolveFile("/index.html");
      if (file) {
        res.writeHead(200, { "Content-Type": file.type });
        res.end(file.content);
        return;
      }
    }

    const file = resolveFile(pathname);
    if (file) {
      res.writeHead(200, { "Content-Type": file.type });
      res.end(file.content);
      return;
    }

    res.writeHead(302, { Location: "/app" });
    res.end();
  });

  server.listen(port, () => {
    console.log(`Preview server running on http://localhost:${port}`);
  });
}

function getPort(): number {
  const argIndex = process.argv.indexOf("--port");
  if (argIndex >= 0 && argIndex + 1 < process.argv.length) {
    const parsed = Number(process.argv[argIndex + 1]);
    if (!Number.isNaN(parsed)) return parsed;
  }
  if (process.env.PORT) {
    const parsed = Number(process.env.PORT);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return 3004;
}

startServer(getPort());
