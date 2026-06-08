#!/usr/bin/env node
/**
 * Creates the NOWASTE150 discount in Shopify Admin (development).
 * Links to the no-waste-discount Shopify Function when deployed.
 *
 * Note: Shopify Functions discounts require the extension to be deployed
 * via `shopify app deploy` first. This script creates the discount node;
 * attach the function in Admin if the API cannot auto-link.
 */
import { adminGraphql } from "./lib/shopify-admin.js";
import { loadCatalog } from "./lib/catalog.js";

const FIND_DISCOUNT = `
  query FindDiscounts($query: String!) {
    codeDiscountNodes(first: 5, query: $query) {
      nodes {
        id
        codeDiscount {
          ... on DiscountCodeBasic {
            title
            codes(first: 1) { nodes { code } }
          }
        }
      }
    }
  }
`;

const CREATE_BASIC = `
  mutation CreateBasicDiscount($input: DiscountCodeBasicInput!) {
    discountCodeBasicCreate(basicCodeDiscount: $input) {
      codeDiscountNode { id }
      userErrors { field message }
    }
  }
`;

async function main() {
  const catalog = loadCatalog();
  const { code, amountInr, title } = catalog.noWasteDiscount;

  const found = await adminGraphql(FIND_DISCOUNT, {
    query: `title:${title}`
  });

  if (found.codeDiscountNodes.nodes.length) {
    console.log(`✓ Discount already exists: ${code}`);
    console.log(
      "  Attach the no-waste-discount Shopify Function in Admin → Discounts if not linked."
    );
    return;
  }

  const startsAt = new Date().toISOString();
  const result = await adminGraphql(CREATE_BASIC, {
    input: {
      title,
      code,
      startsAt,
      customerGets: {
        value: {
          discountAmount: {
            amount: String(amountInr),
            appliesOnEachItem: false
          }
        },
        items: { all: true }
      },
      customerSelection: { all: true },
      combinesWith: {
        orderDiscounts: false,
        productDiscounts: false,
        shippingDiscounts: false
      },
      usageLimit: null,
      appliesOncePerCustomer: false
    }
  });

  const errors = result.discountCodeBasicCreate.userErrors;
  if (errors?.length) {
    console.warn("Basic discount create returned errors (may need Function discount):");
    console.warn(JSON.stringify(errors, null, 2));
    console.log(`
Manual fallback in Shopify Admin:
  Discounts → Create discount → Amount off order
  Code: ${code}
  Value: ₹${amountInr} off entire order
  Minimum purchase: 2 items
  Combines with: none
  Then link the "no-waste-discount" Shopify Function for server-side validation.
`);
    return;
  }

  console.log(`+ Created discount code: ${code} (₹${amountInr})`);
  console.log(
    "  Deploy extensions/no-waste-discount and link this discount to the function."
  );
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
