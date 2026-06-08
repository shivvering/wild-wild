"use client";

import { useState } from "react";

const GARMENT_FRAMES = [
  { id: 0, label: "Front" },
  { id: 1, label: "Detail" },
  { id: 2, label: "Back" },
  { id: 3, label: "Lifestyle" },
];

export function GarmentGallery() {
  const [active, setActive] = useState(0);
  const current = GARMENT_FRAMES[active];

  return (
    <div className="flex flex-col gap-4">
      <div className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden border border-wild-line bg-wild-accent/[0.12] backdrop-blur-md">
        <span className="label-caps">{current.label} view</span>
        <p className="absolute bottom-4 left-4 right-4 text-center text-[0.65rem] text-wild-cream">
          Add images to <code className="font-mono">public/garments/</code>
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {GARMENT_FRAMES.map((frame) => (
          <button
            key={frame.id}
            type="button"
            onClick={() => setActive(frame.id)}
            className={`flex aspect-square items-center justify-center border text-[0.55rem] font-medium uppercase tracking-[0.2em] transition-colors ${
              active === frame.id
                ? "border-wild-accent bg-wild-accent/[0.22] text-wild-cream backdrop-blur-md"
                : "border-wild-line bg-wild-accent/[0.12] text-wild-cream backdrop-blur-md hover:border-wild-accent"
            }`}
            aria-label={`${frame.label} view`}
            aria-current={active === frame.id}
          >
            {frame.label}
          </button>
        ))}
      </div>
    </div>
  );
}
