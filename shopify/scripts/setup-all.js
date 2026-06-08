#!/usr/bin/env node
/**
 * Full backend setup sequence — development / pre-launch only.
 */
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function run(script) {
  return new Promise((resolve, reject) => {
    const child = spawn("node", [path.join(__dirname, script)], {
      stdio: "inherit",
      env: process.env
    });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${script} exited with code ${code}`));
    });
  });
}

async function main() {
  console.log("Wild Wild Shopify setup — PRE-LAUNCH / UNPUBLISHED\n");
  console.log("Confirm password protection is ON before continuing.\n");

  await run("verify-store-settings.js");
  await run("setup-metafields.js");
  await run("setup-products.js");
  await run("create-discount.js");
  await run("export-storefront-config.js");

  console.log(`
Setup complete (backend).

Next steps:
  1. Deploy Shopify Function: cd shopify && shopify app deploy
  2. Link NOWASTE150 discount to the no-waste-discount function in Admin
  3. Enable gift cards: Products → Gift cards
  4. Issue creator credits: npm run issue:creators (after editing creators.seed.json)
  5. Test cart on shop.html with Shopify Payments test mode
  6. Run: npm run verify — before and after every admin session
`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
