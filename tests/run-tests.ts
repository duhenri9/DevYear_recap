import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { detectCurrency } from "../src/config/pricing";
import { clearConfig, loadConfig, saveConfig } from "../src/config/store";

type TestCase = {
  name: string;
  fn: () => void;
};

function run(tests: TestCase[]) {
  let passed = 0;
  for (const test of tests) {
    try {
      test.fn();
      console.log(`✅ ${test.name}`);
      passed++;
    } catch (err) {
      console.error(`❌ ${test.name}`);
      throw err;
    }
  }
  console.log(`\n${passed}/${tests.length} tests passed.`);
}

function withTempConfig(cb: (configPath: string) => void) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "devyear-"));
  const configPath = path.join(dir, ".devyear-config.json");
  try {
    cb(configPath);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

run([
  {
    name: "detectCurrency maps pt-BR to BRL",
    fn: () => {
      assert.equal(detectCurrency("pt-BR"), "BRL");
    },
  },
  {
    name: "detectCurrency maps en-GB to GBP",
    fn: () => {
      assert.equal(detectCurrency("en-GB"), "GBP");
    },
  },
  {
    name: "detectCurrency maps en-IE to EUR",
    fn: () => {
      assert.equal(detectCurrency("en-IE"), "EUR");
    },
  },
  {
    name: "detectCurrency maps es-ES to EUR",
    fn: () => {
      assert.equal(detectCurrency("es-ES"), "EUR");
    },
  },
  {
    name: "detectCurrency without region defaults to BRL",
    fn: () => {
      assert.equal(detectCurrency("en"), "BRL");
      assert.equal(detectCurrency(undefined), "BRL");
    },
  },
  {
    name: "detectCurrency allows override",
    fn: () => {
      assert.equal(detectCurrency("pt-BR", "GBP"), "GBP");
    },
  },
  {
    name: "config save/load round trip",
    fn: () =>
      withTempConfig((configPath) => {
        saveConfig({ locale: "en-GB", currency: "GBP" }, configPath);
        const loaded = loadConfig(configPath);
        assert.deepEqual(loaded, { locale: "en-GB", currency: "GBP" });
      }),
  },
  {
    name: "clearConfig removes file and load returns empty",
    fn: () =>
      withTempConfig((configPath) => {
        saveConfig({ locale: "es-ES", currency: "EUR" }, configPath);
        clearConfig(configPath);
        const loaded = loadConfig(configPath);
        assert.deepEqual(loaded, {});
      }),
  },
]);
