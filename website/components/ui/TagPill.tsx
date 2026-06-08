import type { ReactNode } from "react";

type TagPillProps = {
  children: ReactNode;
};

export function TagPill({ children }: TagPillProps) {
  return (
    <span className="inline-block rounded-[3px] border border-wild-tagBorder bg-wild-tag px-3.5 py-2 font-sans text-[0.625rem] font-medium uppercase tracking-tag text-wild-cream">
      {children}
    </span>
  );
}
