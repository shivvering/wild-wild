import { getShopConfig } from "./env.js";

export async function adminGraphql(query, variables = {}) {
  const { storeDomain, apiVersion, adminToken } = getShopConfig();
  const url = `https://${storeDomain}/admin/api/${apiVersion}/graphql.json`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": adminToken
    },
    body: JSON.stringify({ query, variables })
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(
      `Admin API HTTP ${response.status}: ${JSON.stringify(payload)}`
    );
  }
  if (payload.errors?.length) {
    throw new Error(`Admin GraphQL errors: ${JSON.stringify(payload.errors)}`);
  }
  return payload.data;
}

export async function adminRest(path, options = {}) {
  const { storeDomain, apiVersion, adminToken } = getShopConfig();
  const url = `https://${storeDomain}/admin/api/${apiVersion}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": adminToken,
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(
      `Admin REST ${options.method || "GET"} ${path} → ${response.status}: ${text}`
    );
  }
  return payload;
}

export function productGidFromId(numericId) {
  return `gid://shopify/Product/${numericId}`;
}

export function variantGidFromId(numericId) {
  return `gid://shopify/ProductVariant/${numericId}`;
}

export function numericIdFromGid(gid) {
  if (!gid) return "";
  const parts = String(gid).split("/");
  return parts[parts.length - 1];
}
