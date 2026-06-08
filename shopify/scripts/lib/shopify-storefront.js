import { getShopConfig } from "./env.js";

export async function storefrontGraphql(query, variables = {}) {
  const { storeDomain, apiVersion, storefrontToken } = getShopConfig();
  if (!storefrontToken) {
    throw new Error(
      "Missing SHOPIFY_STOREFRONT_ACCESS_TOKEN in .env for Storefront API calls."
    );
  }

  const url = `https://${storeDomain}/api/${apiVersion}/graphql.json`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": storefrontToken
    },
    body: JSON.stringify({ query, variables })
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(
      `Storefront API HTTP ${response.status}: ${JSON.stringify(payload)}`
    );
  }
  if (payload.errors?.length) {
    throw new Error(
      `Storefront GraphQL errors: ${JSON.stringify(payload.errors)}`
    );
  }
  return payload.data;
}
