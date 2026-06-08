#!/usr/bin/env node
/**
 * Bulk-issue ₹10,000 gift cards for tier-1 creators from creators.seed.json.
 * Creates customer records when missing. Writes audit log (codes redacted).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { adminGraphql, adminRest } from "./lib/shopify-admin.js";
import { loadCatalog } from "./lib/catalog.js";
import { SHOPIFY_ROOT } from "./lib/env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const FIND_CUSTOMER = `
  query FindCustomer($query: String!) {
    customers(first: 1, query: $query) {
      nodes { id email tags note }
    }
  }
`;

const CREATE_CUSTOMER = `
  mutation CreateCustomer($input: CustomerInput!) {
    customerCreate(input: $input) {
      customer { id email tags note }
      userErrors { field message }
    }
  }
`;

const UPDATE_CUSTOMER = `
  mutation UpdateCustomer($input: CustomerInput!) {
    customerUpdate(input: $input) {
      customer { id email tags note }
      userErrors { field message }
    }
  }
`;

function loadCreators() {
  const file = path.join(SHOPIFY_ROOT, "config/creators.seed.json");
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

async function ensureCustomer(creator, tierTag, drop) {
  const found = await adminGraphql(FIND_CUSTOMER, {
    query: `email:${creator.email}`
  });

  const noteLine = `Drop 01 seeding kit — ${new Date().toISOString().slice(0, 10)} — Instagram: ${creator.instagram}`;
  const tags = [tierTag, "creator", "drop-01"];

  if (found.customers.nodes.length) {
    const customer = found.customers.nodes[0];
    const mergedTags = [...new Set([...(customer.tags || []), ...tags])];
    await adminGraphql(UPDATE_CUSTOMER, {
      input: {
        id: customer.id,
        tags: mergedTags,
        note: customer.note ? `${customer.note}\n${noteLine}` : noteLine
      }
    });
    return customer.id;
  }

  const result = await adminGraphql(CREATE_CUSTOMER, {
    input: {
      email: creator.email,
      firstName: creator.name.split(" ")[0],
      lastName: creator.name.split(" ").slice(1).join(" ") || "Creator",
      tags,
      note: noteLine
    }
  });
  const errors = result.customerCreate.userErrors;
  if (errors?.length) throw new Error(JSON.stringify(errors));
  return result.customerCreate.customer.id;
}

async function issueGiftCard(creator, customerGid, amountInr, drop) {
  const numericCustomerId = customerGid.split("/").pop();
  const note = `Creator seeding — ${creator.name} — ${creator.instagram} — ${drop}`;

  const result = await adminRest("/gift_cards.json", {
    method: "POST",
    body: JSON.stringify({
      gift_card: {
        initial_value: String(amountInr),
        currency: "INR",
        note,
        customer_id: Number(numericCustomerId)
      }
    })
  });

  return result.gift_card;
}

async function main() {
  const catalog = loadCatalog();
  const creatorsFile = loadCreators();
  const tier1 = catalog.creatorTiers.tier1;
  const audit = [];

  for (const creator of creatorsFile.creators) {
    if (creator.tier !== "tier1") {
      console.log(`⊘ skipping ${creator.name} (${creator.tier})`);
      continue;
    }

    console.log(`→ ${creator.name} (${creator.instagram})`);
    const customerId = await ensureCustomer(creator, tier1.tag, catalog.drop);
    const card = await issueGiftCard(
      creator,
      customerId,
      tier1.creditInr,
      catalog.drop
    );

    const last4 = card.code.slice(-4);
    await adminGraphql(UPDATE_CUSTOMER, {
      input: {
        id: customerId,
        note: `Gift card issued — last 4: ${last4} — ${new Date().toISOString().slice(0, 10)}`
      }
    });

    audit.push({
      name: creator.name,
      email: creator.email,
      instagram: creator.instagram,
      customerId: customerId.split("/").pop(),
      giftCardId: card.id,
      codeLast4: last4,
      initialValue: card.initial_value,
      issuedAt: new Date().toISOString()
    });

    console.log(`  ✓ Gift card issued (last 4: ${last4})`);
  }

  const outPath = path.join(SHOPIFY_ROOT, "config/creator-gift-cards.generated.json");
  fs.writeFileSync(outPath, JSON.stringify(audit, null, 2));
  console.log(`\nAudit log (no full codes): ${outPath}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
