# Wild Wild Shopify — Pre-Launch Backend Integration

**Development only.** The storefront stays password-protected and unpublished until you explicitly launch.

This package wires:

- Drop 01 products, variants, and `wildwild.*` metafields (Admin API)
- Storefront cart on `shop.html` with checkout redirect
- Zero-waste no-print toggle + `NOWASTE150` discount (Shopify Function)
- Creator wallet credits via gift cards (Admin API)
- Fulfillment order attributes on every cart

---

## Part 1 — Stay unpublished (mandatory)

Before and after every session, confirm in **Shopify Admin**:

| Setting | Required state |
|--------|----------------|
| Online Store → Preferences → **Password protection** | **ON** |
| Online Store → Themes | **Do not publish** |
| Shopify Payments | **Test mode** |
| Sales channels | No public launch |

Verify from terminal:

```bash
cd shopify
cp .env.example .env   # fill credentials
npm run verify
```

---

## Part 2 — One-time Shopify app setup

1. **Create a custom app** (Shopify Admin → Settings → Apps → Develop apps)
2. Enable **Admin API** scopes:
   - `write_products`, `read_products`
   - `write_discounts`, `read_discounts`
   - `write_customers`, `read_customers`
   - `write_gift_cards`, `read_gift_cards`
   - `read_orders`
3. Enable **Storefront API** scopes:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_write_checkouts`
   - `unauthenticated_read_checkouts`
4. Copy tokens into `shopify/.env`

---

## Part 3 — Run backend setup

```bash
cd shopify
npm run setup
```

This runs, in order:

1. `verify-store-settings.js`
2. `setup-metafields.js` — `wildwild.zone`, `species`, `location`, `year`, `conservation_status`, `print_included`
3. `setup-products.js` — 4 Drop 01 products, ₹2,499 variants, writes `config/variant-map.generated.json`
4. `create-discount.js` — `NOWASTE150` (₹150)
5. `export-storefront-config.js` — writes `config/storefront.public.js`

**Enable gift cards:** Products → Gift cards → Enable (one-time, in Admin).

---

## Part 4 — Deploy the no-waste discount function

```bash
npm install -g @shopify/cli @shopify/app
cd shopify
shopify app config link
shopify app deploy
```

Then in **Discounts** → edit `NOWASTE150` → link to the **no-waste-discount** function.

The function only applies ₹150 when:

- Cart has **2+ units of the same product** (any sizes/colourways on that product), and
- Cart attribute `ww_no_print_active` includes that product’s numeric ID (set by the toggle on `shop.html`).

---

## Part 5 — Connect shop.html

After `npm run export:config`, change the script in `shop.html`:

```html
<script src="./shopify/config/storefront.public.js"></script>
<script src="./shopify/js/wildwild-cart.js"></script>
```

Until then, the example config loads and Add to Cart shows a setup message.

---

## Part 6 — Zero-waste toggle (how it works)

1. Customer adds 2+ of the **same design** (same Shopify product, different sizes OK).
2. Cart drawer shows **Zero-Waste Option**.
3. Toggle on:
   - Applies discount code `NOWASTE150`
   - Sets `no_print_{productId}: true` and `ww_no_print_active`
   - Sets line attribute `print_included` on duplicate line(s)
4. Toggle off — reverses discount and attributes.

**Fulfillment** reads order attributes under **Additional details** — no automation required at pilot scale.

---

## Part 7 — Creator wallet

1. Edit `config/creators.seed.json` with real creators (tier `tier1` = ₹10,000).
2. Run:

```bash
npm run issue:creators
```

3. Send each creator their **gift card code** securely (DM/email).
4. Track balances: `npm run list:gift-cards` or Admin → Gift cards.

Internal reference: open `admin/creator-wallet.html` locally (do not deploy).

---

## Part 8 — Test plan (test mode)

### No-print toggle

- [ ] Add 2× same design → toggle appears
- [ ] Toggle on → ₹150 off, attributes on order
- [ ] Toggle off → discount removed
- [ ] 2 different designs → **no** toggle

### Gift cards

- [ ] Issue test card ₹10,000
- [ ] Complete test checkout with code
- [ ] Balance deducts; remainder stays on card

### Unpublished store

- [ ] Logged-out visit to `*.myshopify.com` → password page
- [ ] `npm run verify` passes

---

## Scripts reference

| Command | Purpose |
|---------|---------|
| `npm run setup` | Full backend setup |
| `npm run setup:metafields` | Metafield definitions only |
| `npm run setup:products` | Products + variants |
| `npm run setup:discount` | NOWASTE150 discount |
| `npm run export:config` | Regenerate `storefront.public.js` |
| `npm run issue:gift-card` | Single gift card |
| `npm run issue:creators` | Bulk tier-1 credits |
| `npm run list:gift-cards` | Internal balance report |
| `npm run verify` | Password / pre-launch check |

---

## Not in this integration (pre-launch backlog)

- QR on Chhapai card → animal story page
- Size chart + carbon exchange notice
- 20% conservation donation automation
- Shiprocket labels
- No-print logic for 3+ units (extend `wildwild-cart.js` + function)

---

## Security

| Token | Where |
|-------|--------|
| `SHOPIFY_ADMIN_ACCESS_TOKEN` | `shopify/.env` only — **never** in `shop.html` |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | `storefront.public.js` — public, limited scopes |

`storefront.public.js` and `.env` are gitignored.
