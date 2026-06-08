#!/usr/bin/env node
/**
 * Creates wildwild.* product metafield definitions in Shopify Admin.
 * Safe to re-run — skips definitions that already exist.
 */
import { adminGraphql } from "./lib/shopify-admin.js";
import { loadCatalog } from "./lib/catalog.js";

const DEFINITIONS = [
  { key: "zone", name: "Zone", type: "single_line_text_field" },
  { key: "species", name: "Species", type: "single_line_text_field" },
  { key: "location", name: "Location", type: "single_line_text_field" },
  { key: "year", name: "Year", type: "single_line_text_field" },
  {
    key: "conservation_status",
    name: "Conservation Status",
    type: "single_line_text_field"
  },
  { key: "print_included", name: "Print Included", type: "boolean" }
];

const LIST_QUERY = `
  query ListMetafieldDefinitions($namespace: String!) {
    metafieldDefinitions(first: 50, ownerType: PRODUCT, namespace: $namespace) {
      nodes { id key }
    }
  }
`;

const CREATE_MUTATION = `
  mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
    metafieldDefinitionCreate(definition: $definition) {
      createdDefinition { id key }
      userErrors { field message }
    }
  }
`;

async function main() {
  const catalog = loadCatalog();
  const namespace = catalog.metafieldNamespace;

  const existing = await adminGraphql(LIST_QUERY, { namespace });
  const existingKeys = new Set(
    existing.metafieldDefinitions.nodes.map((n) => n.key)
  );

  for (const def of DEFINITIONS) {
    if (existingKeys.has(def.key)) {
      console.log(`✓ metafield wildwild.${def.key} already exists`);
      continue;
    }

    const result = await adminGraphql(CREATE_MUTATION, {
      definition: {
        name: def.name,
        namespace,
        key: def.key,
        type: def.type,
        ownerType: "PRODUCT",
        pin: true
      }
    });

    const errors = result.metafieldDefinitionCreate.userErrors;
    if (errors?.length) {
      console.error(`✗ wildwild.${def.key}:`, errors);
      continue;
    }
    console.log(`+ created metafield wildwild.${def.key}`);
  }

  console.log("\nMetafield definitions ready.");
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
