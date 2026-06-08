// @ts-check
/**
 * Wild Wild Zero-Waste discount function.
 * Applies ₹150 fixed order discount when:
 *   - Cart has 2+ units of the same product (design), AND
 *   - Cart attribute ww_no_print_active lists that product's numeric ID
 *
 * Deploy: shopify app deploy (from shopify/ directory)
 * Link to discount code NOWASTE150 in Shopify Admin.
 */

const NO_WASTE_AMOUNT = 150.0;

/**
 * @param {import("../generated/api").RunInput} input
 * @returns {import("../generated/api").FunctionRunResult}
 */
export function run(input) {
  const cart = input.cart;
  if (!cart?.lines?.length) {
    return emptyResult();
  }

  const activeRaw = cart.noPrintAttributes?.value || "";
  const activeProductIds = new Set(
    activeRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );

  if (!activeProductIds.size) {
    return emptyResult();
  }

  const qtyByProduct = {};
  for (const line of cart.lines) {
    const merchandise = line.merchandise;
    if (!merchandise?.product?.id) continue;
    const productId = numericId(merchandise.product.id);
    qtyByProduct[productId] = (qtyByProduct[productId] || 0) + line.quantity;
  }

  let eligible = false;
  for (const productId of activeProductIds) {
    if ((qtyByProduct[productId] || 0) >= 2) {
      eligible = true;
      break;
    }
  }

  if (!eligible) {
    return emptyResult();
  }

  return {
    discounts: [
      {
        targets: [{ orderSubtotal: { excludedVariantIds: [] } }],
        value: {
          fixedAmount: {
            amount: String(NO_WASTE_AMOUNT)
          }
        },
        message: "Zero-Waste — skip duplicate print"
      }
    ],
    discountApplicationStrategy: "FIRST"
  };
}

function numericId(gid) {
  const parts = String(gid).split("/");
  return parts[parts.length - 1];
}

function emptyResult() {
  return {
    discounts: [],
    discountApplicationStrategy: "FIRST"
  };
}
