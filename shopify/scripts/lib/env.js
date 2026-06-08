import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");

function loadDotEnv() {
  const envPath = path.join(ROOT, ".env");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadDotEnv();

export function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy shopify/.env.example to shopify/.env and fill in your Shopify credentials.`
    );
  }
  return value;
}

export function getShopConfig() {
  return {
    storeDomain: requireEnv("SHOPIFY_STORE_DOMAIN"),
    apiVersion: process.env.SHOPIFY_API_VERSION || "2025-01",
    adminToken: requireEnv("SHOPIFY_ADMIN_ACCESS_TOKEN"),
    storefrontToken: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || ""
  };
}

export const SHOPIFY_ROOT = ROOT;
