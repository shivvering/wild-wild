# Wild Wild — Next.js Website

Minimalist monochrome single-page site (inspired by the [Wild Wild Gamma deck](https://gamma.app/docs/Wild-Wild-Website-2k5cuo7u2laner8)).

## Run locally

```bash
cd website
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Shopify Buy Button

1. Open `components/ShopifyBuyButtonSlot.tsx`
2. Replace the placeholder `<div>` inside `#shopify-buy-button-container` with your full Shopify embed (HTML + `<script>` tags)
3. For script tags, you may need a small client wrapper — or paste the div + use `next/script` in that file

## 3D model

- Set `NEXT_PUBLIC_GARMENT_MODEL_URL` in `.env.local` to your `.glb` URL, or
- Add `public/garment.glb` and update `ModelViewer.tsx`

## Garment photos

Add files to `public/garments/` and wire them in `GarmentGallery.tsx`.

## Hero image

Copy your leopard asset to `public/hero-leopard.png` (symlinked from repo assets if present).
