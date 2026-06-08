#!/usr/bin/env node
/**
 * Issue a single creator gift card via Admin API.
 *
 * Usage:
 *   npm run issue:gift-card -- --value=10000 --note="Creator seeding — Name — Drop 01"
 *   npm run issue:gift-card -- --value=10000 --customer-id=123456789 --note="..."
 */
import { adminRest } from "./lib/shopify-admin.js";

function parseArgs() {
  const args = {};
  for (const arg of process.argv.slice(2)) {
    const match = arg.match(/^--([^=]+)=(.*)$/);
    if (match) args[match[1]] = match[2];
  }
  return args;
}

async function main() {
  const args = parseArgs();
  const value = args.value || "10000.00";
  const note = args.note || "Creator seeding — Wild Wild — Drop 01";
  const customerId = args["customer-id"] ? Number(args["customer-id"]) : null;

  const body = {
    gift_card: {
      initial_value: value,
      currency: "INR",
      note
    }
  };

  if (customerId) body.gift_card.customer_id = customerId;

  const result = await adminRest("/gift_cards.json", {
    method: "POST",
    body: JSON.stringify(body)
  });

  const card = result.gift_card;
  console.log("Gift card issued:");
  console.log(`  Code:     ${card.code}`);
  console.log(`  Value:    ₹${card.initial_value}`);
  console.log(`  Balance:  ₹${card.balance}`);
  console.log(`  ID:       ${card.id}`);
  console.log(`  Note:     ${card.note}`);
  console.log("\nStore the full code securely — send to creator via DM or email.");
  console.log("Last 4 for customer note:", card.code.slice(-4));
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
