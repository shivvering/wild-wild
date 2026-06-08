"use client";

import { useEffect, useState } from "react";

const links = [
  { href: "#story", label: "Story" },
  { href: "#garment", label: "Collection" },
  { href: "#impact", label: "Impact" },
  { href: null, label: "Shop" },
] as const;

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "border-b border-wild-line bg-wild-accent/[0.12] backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="section-pad mx-auto flex h-16 max-w-content items-center justify-between md:h-[4.5rem]">
        <a
          href="#"
          className="font-display text-xs font-medium uppercase tracking-[0.35em] text-wild-cream"
        >
          Wild Wild
        </a>
        <nav aria-label="Main">
          <ul className="flex items-center gap-6 md:gap-10">
            {links.map((link) => (
              <li key={link.label}>
                {link.href ? (
                  <a
                    href={link.href}
                    className="text-[0.7rem] font-medium uppercase tracking-[0.14em] text-wild-cream transition-colors hover:text-wild-cream"
                  >
                    {link.label}
                  </a>
                ) : (
                  <span
                    aria-disabled="true"
                    className="cursor-default text-[0.7rem] font-medium uppercase tracking-[0.14em] text-wild-cream"
                  >
                    {link.label}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
