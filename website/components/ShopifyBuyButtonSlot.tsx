/**
 * SHOPIFY BUY BUTTON — paste your embed here
 * ─────────────────────────────────────────
 * 1. In Shopify Admin: Product → Buy Button → Generate embed code
 * 2. Paste the full HTML/JS snippet below (inside the container div)
 * 3. Remove the placeholder comment block when live
 *
 * Example structure Shopify provides:
 * <div id="product-component-xxxxx"></div>
 * <script type="text/javascript"> ... </script>
 */

export function ShopifyBuyButtonSlot() {
  return (
    <aside
      id="shop"
      className="flex h-full min-h-[min(100%,520px)] flex-col border border-wild-line bg-wild-accent/[0.12] backdrop-blur-md"
      aria-label="Purchase"
    >
      <div className="border-b border-wild-line px-6 py-5 md:px-8">
        <p className="label-caps mb-2">Shop</p>
        <h2 className="text-xl font-semibold tracking-tight text-wild-cream md:text-2xl">
          Get the piece
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-wild-cream">
          Secure checkout powered by Shopify.
        </p>
      </div>

      {/*
        ═══ PASTE SHOPIFY BUY BUTTON BELOW ═══
      */}
      <div
        id="shopify-buy-button-container"
        className="flex flex-1 flex-col justify-center p-6 md:p-8 [&_iframe]:mx-auto [&_iframe]:max-w-full"
      >
        {/* Placeholder — replace with your Shopify embed */}
        <div className="flex min-h-[280px] flex-col items-center justify-center border border-dashed border-wild-line bg-wild-accent/[0.08] p-8 text-center backdrop-blur-md">
          <p className="label-caps mb-3">Shopify Buy Button</p>
          <p className="max-w-xs text-sm leading-relaxed text-wild-cream">
            Paste your Shopify Buy Button HTML/JS into{" "}
            <code className="rounded bg-wild-line px-1.5 py-0.5 font-mono text-[0.7rem] text-wild-cream">
              components/ShopifyBuyButtonSlot.tsx
            </code>
          </p>
        </div>
      </div>
    </aside>
  );
}
