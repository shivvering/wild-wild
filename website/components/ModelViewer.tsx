"use client";

/** Set to your hosted .glb / .gltf URL when ready */
const MODEL_SRC = process.env.NEXT_PUBLIC_GARMENT_MODEL_URL || "";

export function ModelViewer() {
  const hasModel = Boolean(MODEL_SRC);

  return (
    <div className="relative w-full overflow-hidden border border-wild-line bg-wild-accent/[0.12] backdrop-blur-md">
      <div className="relative aspect-square w-full max-h-[min(85vw,640px)] md:max-h-[560px] lg:mx-auto lg:max-w-2xl">
        {hasModel ? (
          // @ts-expect-error custom element
          <model-viewer
            src={MODEL_SRC}
            alt="Wild Wild garment 3D model"
            camera-controls
            touch-action="pan-y"
            shadow-intensity="0.9"
            exposure="1"
            className="h-full w-full"
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3 p-8 text-center sm:min-h-[360px]">
            <p className="label-caps">Interactive 3D model</p>
            <p className="max-w-sm text-sm leading-relaxed text-wild-cream">
              Add your model URL to{" "}
              <code className="rounded bg-wild-line px-1.5 py-0.5 font-mono text-[0.65rem]">
                NEXT_PUBLIC_GARMENT_MODEL_URL
              </code>{" "}
              or place <code className="font-mono text-[0.65rem]">garment.glb</code> in{" "}
              <code className="font-mono text-[0.65rem]">public/</code>
            </p>
          </div>
        )}
      </div>
      <div className="border-t border-wild-line bg-wild-accent/[0.12] px-4 py-2.5 text-center backdrop-blur-md">
        <p className="label-caps">Drag to rotate · Pinch to zoom on mobile</p>
      </div>
    </div>
  );
}
