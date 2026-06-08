import { GarmentGallery } from "./GarmentGallery";
import { ModelViewer } from "./ModelViewer";
import { ShopifyBuyButtonSlot } from "./ShopifyBuyButtonSlot";

export function GarmentSection() {
  return (
    <section
      id="garment"
      className="border-t border-wild-line py-section section-pad"
    >
      <div className="mx-auto max-w-content">
        <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
          <p className="label-caps mb-4">Collection</p>
          <h2 className="headline">The garment</h2>
          <p className="body-lg mt-6">
            Explore the piece in 3D, study the details in the gallery, and
            purchase through our Shopify checkout.
          </p>
        </div>

        <div className="flex flex-col items-center gap-8 md:gap-10">
          <div className="w-full">
            <ModelViewer />
          </div>
          <div className="w-full">
            <GarmentGallery />
          </div>
          <div className="w-full max-w-md">
            <ShopifyBuyButtonSlot />
          </div>
        </div>
      </div>
    </section>
  );
}
