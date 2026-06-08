#!/usr/bin/env node
/**
 * Creates or updates Drop 01 products with variants and wildwild metafields.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { adminGraphql, numericIdFromGid } from "./lib/shopify-admin.js";
import { loadCatalog } from "./lib/catalog.js";
import { SHOPIFY_ROOT } from "./lib/env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const FIND_BY_HANDLE = `
  query ProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      variants(first: 20) {
        nodes { id title selectedOptions { name value } }
      }
    }
  }
`;

const CREATE_PRODUCT = `
  mutation CreateProduct($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        id
        handle
        variants(first: 20) {
          nodes { id title selectedOptions { name value } }
        }
      }
      userErrors { field message }
    }
  }
`;

const UPDATE_PRODUCT = `
  mutation UpdateProduct($input: ProductInput!) {
    productUpdate(input: $input) {
      product { id handle }
      userErrors { field message }
    }
  }
`;

const SET_METAFIELDS = `
  mutation SetMetafields($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields { id key value }
      userErrors { field message }
    }
  }
`;

function buildVariantInputs(product) {
  return product.sizes.map((size) => ({
    optionValues: [
      { optionName: "Size", name: size },
      { optionName: "Colourway", name: product.colourway }
    ],
    price: loadCatalog().price,
    inventoryPolicy: "CONTINUE",
    inventoryItem: { tracked: false }
  }));
}

function mapVariantsBySize(variantNodes) {
  const map = {};
  for (const v of variantNodes) {
    const sizeOpt = v.selectedOptions.find((o) => o.name === "Size");
    if (sizeOpt) map[sizeOpt.value] = v.id;
  }
  return map;
}

async function upsertProduct(catalog, product) {
  const existing = await adminGraphql(FIND_BY_HANDLE, { handle: product.handle });
  let productGid;
  let variantNodes;

  if (existing.productByHandle) {
    productGid = existing.productByHandle.id;
    variantNodes = existing.productByHandle.variants.nodes;
    console.log(`↻ updating ${product.title}`);

    const result = await adminGraphql(UPDATE_PRODUCT, {
      input: {
        id: productGid,
        title: product.title,
        status: "ACTIVE",
        productOptions: [
          { name: "Size", values: product.sizes.map((s) => ({ name: s })) },
          { name: "Colourway", values: [{ name: product.colourway }] }
        ]
      }
    });
    const errors = result.productUpdate.userErrors;
    if (errors?.length) throw new Error(JSON.stringify(errors));

    const refreshed = await adminGraphql(FIND_BY_HANDLE, { handle: product.handle });
    variantNodes = refreshed.productByHandle.variants.nodes;
  } else {
    console.log(`+ creating ${product.title}`);
    const result = await adminGraphql(CREATE_PRODUCT, {
      input: {
        title: product.title,
        handle: product.handle,
        status: "ACTIVE",
        productType: "T-Shirt",
        vendor: "Wild Wild",
        tags: [`drop-${catalog.drop.replace(/\s+/g, "-").toLowerCase()}`, `zone-${product.zone}`],
        productOptions: [
          { name: "Size", values: product.sizes.map((s) => ({ name: s })) },
          { name: "Colourway", values: [{ name: product.colourway }] }
        ]
      }
    });
    const errors = result.productCreate.userErrors;
    if (errors?.length) throw new Error(JSON.stringify(errors));
    productGid = result.productCreate.product.id;
    variantNodes = result.productCreate.product.variants.nodes;
  }

  const ns = catalog.metafieldNamespace;
  await adminGraphql(SET_METAFIELDS, {
    metafields: [
      { ownerId: productGid, namespace: ns, key: "zone", type: "single_line_text_field", value: product.zone },
      { ownerId: productGid, namespace: ns, key: "species", type: "single_line_text_field", value: product.species },
      { ownerId: productGid, namespace: ns, key: "location", type: "single_line_text_field", value: product.location },
      { ownerId: productGid, namespace: ns, key: "year", type: "single_line_text_field", value: product.year },
      {
        ownerId: productGid,
        namespace: ns,
        key: "conservation_status",
        type: "single_line_text_field",
        value: product.conservation_status
      },
      {
        ownerId: productGid,
        namespace: ns,
        key: "print_included",
        type: "boolean",
        value: String(product.print_included)
      }
    ]
  });

  return {
    catalogKey: product.catalogKey,
    handle: product.handle,
    productGid,
    productId: numericIdFromGid(productGid),
    zone: product.zone,
    variants: mapVariantsBySize(variantNodes)
  };
}

async function main() {
  const catalog = loadCatalog();
  const variantMap = {};

  for (const product of catalog.products) {
    const entry = await upsertProduct(catalog, product);
    variantMap[entry.catalogKey] = {
      productGid: entry.productGid,
      productId: entry.productId,
      handle: entry.handle,
      zone: entry.zone,
      ...entry.variants
    };
    console.log(`  ✓ ${entry.catalogKey} → ${entry.productGid}`);
  }

  const outPath = path.join(SHOPIFY_ROOT, "config/variant-map.generated.json");
  fs.writeFileSync(outPath, JSON.stringify({ drop: catalog.drop, variantMap }, null, 2));
  console.log(`\nWrote ${outPath}`);
  console.log("Run: npm run export:config — to update shop.html storefront config.");
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
