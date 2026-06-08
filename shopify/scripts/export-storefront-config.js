#!/usr/bin/env node
/**
 * Writes shopify/config/storefront.public.js for shop.html (Storefront API cart).
 */
import fs from "fs";
import path from "path";
import { getShopConfig } from "./lib/env.js";
import { loadCatalog } from "./lib/catalog.js";
import { SHOPIFY_ROOT } from "./lib/env.js";

async function main() {
  const { storeDomain, apiVersion, storefrontToken } = getShopConfig();
  const catalog = loadCatalog();

  const mapPath = path.join(SHOPIFY_ROOT, "config/variant-map.generated.json");
  let variantMap = {};
  if (fs.existsSync(mapPath)) {
    const generated = JSON.parse(fs.readFileSync(mapPath, "utf8"));
    variantMap = generated.variantMap || {};
  } else {
    console.warn("variant-map.generated.json not found — run npm run setup:products first.");
  }

  const config = {
    storeDomain,
    storefrontAccessToken: storefrontToken,
    apiVersion,
    drop: catalog.drop,
    noWasteDiscountCode: catalog.noWasteDiscount.code,
    noWasteDiscountAmount: catalog.noWasteDiscount.amountInr,
    currency: catalog.currency,
    variantMap
  };

  const out = `/**
 * AUTO-GENERATED — do not commit if it contains real tokens.
 * Run: cd shopify && npm run export:config
 */
window.WW_SHOPIFY_CONFIG = ${JSON.stringify(config, null, 2)};
`;

  const outPath = path.join(SHOPIFY_ROOT, "config/storefront.public.js");
  fs.writeFileSync(outPath, out);
  console.log(`Wrote ${outPath}`);
  console.log("Include in shop.html before wildwild-cart.js");
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
