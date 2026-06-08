import type { ReactNode } from "react";

type GhostButtonProps = {
  href?: string;
  children: ReactNode;
  className?: string;
};

export function GhostButton({
  href = "#shop",
  children,
  className = "",
}: GhostButtonProps) {
  return (
    <a
      href={href}
      className={`inline-block rounded-[3px] border border-wild-cream/90 bg-transparent px-10 py-3.5 font-sans text-[0.6875rem] font-medium uppercase tracking-cta text-wild-cream transition-colors hover:bg-wild-cream/10 ${className}`}
    >
      {children}
    </a>
  );
}
