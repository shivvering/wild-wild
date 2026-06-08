/**
 * Copy to storefront.public.js after running: npm run export:config
 * Storefront token is safe to expose (cart + checkout scopes only).
 * NEVER put SHOPIFY_ADMIN_ACCESS_TOKEN in this file.
 */
window.WW_SHOPIFY_CONFIG = {
  storeDomain: "your-store.myshopify.com",
  storefrontAccessToken: "YOUR_STOREFRONT_ACCESS_TOKEN",
  apiVersion: "2025-01",
  drop: "Drop 01",
  noWasteDiscountCode: "NOWASTE150",
  noWasteDiscountAmount: 150,
  currency: "INR",
  /**
   * Filled by export:config from Shopify — maps shop.html data-product keys to variant GIDs.
   * Example: { "heira": { "productGid": "gid://...", "M": "gid://shopify/ProductVariant/..." } }
   */
  variantMap: {}
};
