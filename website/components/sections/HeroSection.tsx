"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { GhostButton } from "@/components/ui/GhostButton";
import { TagPill } from "@/components/ui/TagPill";

const childVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.12 },
  },
};

const TAGS = ["Premium Streetwear", "Safari Apparel", "Indian Wild"] as const;

export function HeroSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="hero"
      className="grid min-h-[100svh] grid-cols-1 lg:grid-cols-2"
      aria-label="Wild Wild hero"
    >
      {/* Left — leopard + baked-in logo (always visible, no JS required) */}
      <div className="relative min-h-[52vh] w-full lg:min-h-[100svh]">
        <Image
          src="/hero-split-leopard.jpg"
          alt="Leopard in the red jungle — Wild Wild"
          fill
          priority
          className="object-cover object-[center_42%] lg:object-center"
          sizes="(max-width: 1024px) 100vw, 50vw"
          quality={90}
        />
      </div>

      {/* Right — copy panel */}
      <div className="relative flex min-h-[48vh] flex-col items-center justify-center px-6 py-16 sm:px-10 sm:py-20 lg:min-h-[100svh] lg:px-14 lg:py-24">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_100%_0%,rgba(100,18,28,0.5),transparent_58%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_100%,rgba(0,0,0,0.65),transparent_70%)] lg:hidden"
          aria-hidden
        />

        <motion.div
          className="relative z-10 flex w-full max-w-[36rem] flex-col items-center text-center"
          initial={reduceMotion ? false : "hidden"}
          animate="visible"
          variants={containerVariants}
        >
          <motion.h1
            variants={childVariants}
            className="mb-8 font-display text-[clamp(4.75rem,14.5vw,7.75rem)] font-normal uppercase leading-[0.85] tracking-wild text-wild-cream"
          >
            Wild
            <br />
            Wild
          </motion.h1>

          <motion.div
            variants={childVariants}
            className="flex w-full flex-col items-center border-t border-wild-line pt-8"
          >
            <p className="font-sans text-[clamp(1.125rem,2.8vw,1.5rem)] font-semibold leading-tight text-wild-cream">
              Defend the Habitat.
            </p>

            <p className="mt-4 max-w-[36rem] font-sans text-[clamp(0.875rem,1.6vw,1.0625rem)] font-normal leading-[1.6] text-wild-creamMuted">
              Premium Indian wildlife streetwear. Every purchase funds active
              conservation on the ground in India.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
              {TAGS.map((tag) => (
                <TagPill key={tag}>{tag}</TagPill>
              ))}
            </div>

            <div className="mt-10 sm:mt-11">
              <GhostButton href="#shop">Shop The Wild</GhostButton>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
