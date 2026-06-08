#!/usr/bin/env node
/**
 * List gift cards and balances for internal creator-wallet tracking.
 */
import { adminRest } from "./lib/shopify-admin.js";

async function main() {
  const result = await adminRest("/gift_cards.json?limit=50&status=enabled");
  const cards = result.gift_cards || [];

  if (!cards.length) {
    console.log("No gift cards found.");
    return;
  }

  console.log("Gift cards (internal — codes partially redacted):\n");
  for (const card of cards) {
    const masked =
      card.code.length > 4
        ? "****" + card.code.slice(-4)
        : "****";
    console.log(`  ${masked}  balance ₹${card.balance} / ₹${card.initial_value}`);
    console.log(`    id: ${card.id}  customer: ${card.customer_id || "unlinked"}`);
    console.log(`    note: ${card.note || "—"}`);
    console.log("");
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
