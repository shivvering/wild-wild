#!/usr/bin/env node
/**
 * Pre-launch verification — confirms store is not publicly exposed.
 * Run before and after any Shopify admin work.
 */
import { getShopConfig, requireEnv } from "./lib/env.js";
import { adminGraphql } from "./lib/shopify-admin.js";

const SHOP_QUERY = `
  query ShopSettings {
    shop {
      name
      myshopifyDomain
      plan { displayName }
      currencyCode
    }
    publications(first: 10) {
      nodes {
        id
        name
        supportsFuturePublishing
      }
    }
  }
`;

async function checkPasswordPage(domain) {
  const url = `https://${domain}`;
  try {
    const res = await fetch(url, { redirect: "follow" });
    const html = await res.text();
    const hasPassword =
      /password|storefront.*password|Enter store using password/i.test(html);
    return { url, status: res.status, passwordProtected: hasPassword };
  } catch (err) {
    return { url, error: err.message, passwordProtected: null };
  }
}

async function main() {
  const { storeDomain } = getShopConfig();
  requireEnv("SHOPIFY_ADMIN_ACCESS_TOKEN");

  console.log("Wild Wild — Pre-launch store verification\n");
  console.log("CHECKLIST (confirm manually in Shopify Admin):");
  console.log("  [ ] Online Store → Preferences → Password protection ON");
  console.log("  [ ] No theme published to Online Store sales channel");
  console.log("  [ ] Shopify Payments → Test mode ON");
  console.log("  [ ] No marketing / social publish actions taken\n");

  const data = await adminGraphql(SHOP_QUERY);
  console.log(`Shop: ${data.shop.name} (${data.shop.myshopifyDomain})`);
  console.log(`Plan: ${data.shop.plan.displayName}`);
  console.log(`Currency: ${data.shop.currencyCode}\n`);

  const storefront = await checkPasswordPage(storeDomain);
  if (storefront.passwordProtected === true) {
    console.log(`✓ Storefront appears password-protected: ${storefront.url}`);
  } else if (storefront.passwordProtected === false) {
    console.warn(`⚠ Storefront may NOT be password-protected: ${storefront.url}`);
    console.warn("  → Enable password in Online Store → Preferences immediately.");
  } else {
    console.warn(`? Could not verify password page: ${storefront.error || storefront.status}`);
  }

  console.log("\nPublications:");
  for (const pub of data.publications.nodes) {
    console.log(`  - ${pub.name}`);
  }

  console.log("\nDone. Complete the manual checklist above before any launch.");
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
