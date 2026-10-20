"use client";

import type { ReactNode } from "react";

/** Dark translucent intelligence-terminal panel used for both decision beats. */
export function TerminalPrompt({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      className="w-[min(520px,92vw)] border px-4 sm:px-8 py-5 sm:py-7 text-center backdrop-blur-[3px]"
      style={{
        borderColor: "oklch(0.5 0.2 24 / 0.45)",
        background: "oklch(0.09 0.01 20 / 0.72)",
        boxShadow:
          "0 0 0 1px oklch(0.5 0.2 24 / 0.12), 0 30px 70px oklch(0.02 0 0 / 0.8)",
      }}
    >
      <p className="font-mono text-[10px] tracking-wider text-crimson">{label}</p>
      <h2 className="mt-2 sm:mt-3 font-display text-xl sm:text-3xl leading-tight font-medium tracking-wide uppercase">
        {title}
      </h2>
      <div className="mt-5 sm:mt-7 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
        {children}
      </div>
    </div>
  );
}

export function PromptButton({
  children,
  onClick,
  tone = "neutral",
}: {
  children: ReactNode;
  onClick: () => void;
  tone?: "crimson" | "neutral";
}) {
  const crimson = tone === "crimson";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-[120px] sm:min-w-[140px] cursor-pointer border px-5 sm:px-7 py-3 font-display text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-crimson active:translate-y-[1px] ${
        crimson
          ? "border-crimson bg-crimson/15 text-foreground hover:bg-crimson/35 hover:shadow-[0_0_28px_oklch(0.5_0.2_24/0.45)]"
          : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

