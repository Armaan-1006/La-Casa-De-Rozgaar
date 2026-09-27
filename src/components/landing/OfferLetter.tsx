"use client";

import paper from "./assets/paper.jpg";

const OPERATION_PILLARS = [
  {
    title: "Market-Aware Skill Intelligence",
    detail:
      "Real-time tracking of global hiring demand, high-leverage skill clusters, and shifting market wage benchmarks.",
  },
  {
    title: "Intelligent Role Matching",
    detail:
      "Algorithmic precision aligning your verified competency profile directly with high-impact strategic missions.",
  },
  {
    title: "Skill-Gap Analysis",
    detail:
      "Automated tactical diagnostics identifying mission-critical deficiencies and prescribing accelerated mastery paths.",
  },
  {
    title: "Secure Skill Assessment",
    detail:
      "High-integrity, anti-cheat verified technical evaluations providing cryptographic proof of execution capability.",
  },
  {
    title: "Personalized Learning Pathways",
    detail:
      "Dynamic curriculum tailored to eliminate skill gaps through practical problem-solving and real-world case studies.",
  },
  {
    title: "Career Simulation Sandbox",
    detail:
      "Interactive high-fidelity job simulations testing strategic judgment, tactical execution, and crisis management.",
  },
  {
    title: "Talent Intelligence Command",
    detail:
      "Deep macro analytics enabling recruiters and team leaders to forecast skill pipelines and optimize team composition.",
  },
  {
    title: "Workforce Intelligence & Planning",
    detail:
      "Enterprise-grade modeling for long-term organizational agility, transition readiness, and workforce scaling.",
  },
];

/**
 * The classified employment document.
 * When the suitcase opens and zooms in, this document expands to cover the entire viewport
 * with rich, elaborated platform capabilities from instructions.md.
 */
export function OfferLetter({
  variant,
  onJoin,
  onNotYet,
  scrollRef,
}: {
  variant: "inside" | "macro";
  onJoin?: () => void;
  onNotYet?: () => void;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const inside = variant === "inside";

  if (inside) {
    return (
      <div
        className="flex h-full w-full overflow-hidden rounded-[2px] text-paper-ink select-none"
        style={{
          backgroundImage: `url(${paper})`,
          backgroundSize: "cover",
          boxShadow:
            "0 6px 16px rgba(0,0,0,0.6), inset 0 0 30px rgba(180,140,90,0.3)",
        }}
      >
        <div className="flex w-full flex-col p-4">
          <div className="flex items-start justify-between border-b border-paper-ink/30 pb-1.5">
            <p className="font-mono text-[7px] tracking-widest uppercase text-crimson font-bold">
              OFFER LETTER · LCDR-1949
            </p>
            <p className="font-mono text-[7px] tracking-widest text-paper-ink/70 uppercase">
              TOP SECRET
            </p>
          </div>

          <h3 className="mt-2 font-display text-[14px] leading-tight font-black uppercase text-paper-ink">
            YOU HAVE BEEN SELECTED
            <br />
            <span className="text-crimson">FOR THE OPERATION.</span>
          </h3>

          <p className="mt-2 font-mono text-[7px] tracking-wider text-paper-ink/80 uppercase font-semibold">
            PLATFORM CAPABILITIES // BRIEFING
          </p>

          <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[6.5px] leading-tight text-paper-ink/90">
            {OPERATION_PILLARS.slice(0, 6).map((p) => (
              <div key={p.title} className="flex gap-1 items-start">
                <span className="text-crimson font-bold">»</span>
                <span className="truncate">{p.title}</span>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-2 flex items-end justify-between border-t border-paper-ink/20">
            <div>
              <p className="font-display italic text-[10px] text-paper-ink">
                El Profesor
              </p>
              <p className="font-mono text-[6px] tracking-widest text-crimson uppercase font-bold">
                AUTHORIZED
              </p>
            </div>
            <div
              className="flex items-center justify-center rounded-full border border-crimson/70 px-1.5 py-0.5 font-mono text-[6px] font-bold text-crimson uppercase"
              style={{ transform: "rotate(-12deg)" }}
            >
              LA CASA DE ROZGAAR
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MACRO / FULL SCREEN VIEW
  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden rounded-lg text-paper-ink shadow-[0_25px_80px_rgba(0,0,0,0.95)]"
      style={{
        backgroundImage: `url(${paper})`,
        backgroundSize: "cover",
        backgroundColor: "#e5d5be",
        color: "#2b2219",
        boxShadow:
          "0 30px 100px rgba(0,0,0,0.95), inset 0 0 100px rgba(180,140,80,0.25), 0 0 0 1px rgba(160,120,70,0.4)",
      }}
    >
      {/* Distressed Paper Top Bar & Stamps */}
      <div className="flex flex-wrap items-center justify-between border-b-2 border-paper-ink/30 px-6 sm:px-10 py-4 bg-black/5">
        <div className="flex items-center gap-3">
          <span className="inline-block h-3 w-3 rounded-full bg-crimson shadow-[0_0_8px_rgba(201,24,43,0.8)]" />
          <p className="font-mono text-xs sm:text-sm tracking-[0.25em] text-crimson font-bold uppercase">
            CLASSIFIED EMPLOYMENT DOSSIER · EXP. LCDR-1949
          </p>
        </div>
        <div className="flex items-center gap-4 mt-2 sm:mt-0 font-mono text-[11px] sm:text-xs tracking-widest text-paper-ink/75 uppercase">
          <span className="border border-paper-ink/40 px-2.5 py-0.5 font-semibold bg-black/5">
            CLEARANCE: LEVEL 5
          </span>
          <span className="text-crimson font-bold">CONFIDENTIAL</span>
        </div>
      </div>

      {/* Main Dossier Scrollable / Responsive Content without visible scrollbars */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 sm:px-12 py-6 sm:py-8 space-y-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {/* Title Header */}
        <div className="flex flex-col border-b border-paper-ink/20 pb-5">
          <p className="font-mono text-xs tracking-[0.3em] text-[#8a1d27] uppercase font-bold">
            CENTRAL COMMAND · OPERATIONAL BLUEPRINT
          </p>
          <h1 className="mt-1 font-display text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-paper-ink leading-[0.95]">
            YOU HAVE BEEN SELECTED
            <br />
            <span className="text-crimson">FOR THE OPERATION.</span>
          </h1>
          <p className="mt-3 font-mono text-xs sm:text-sm tracking-wide text-paper-ink/80 max-w-3xl leading-relaxed">
            Welcome to <strong>La Casa De Rozgaar</strong> (The House of Employment). You are invited into an intelligent talent and workforce ecosystem designed to orchestrate careers, master market demand, and execute mission-critical talent matching.
          </p>
        </div>

        {/* Section Heading */}
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-xs sm:text-sm tracking-[0.25em] text-crimson uppercase font-bold">
            WHAT YOU RECEIVE BY JOINING THE ECOSYSTEM
          </h2>
          <span className="font-mono text-[11px] tracking-widest text-paper-ink/60 uppercase">
            8 CORE PILLARS
          </span>
        </div>

        {/* 8 Elaborated Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 font-mono">
          {OPERATION_PILLARS.map((pillar, idx) => (
            <div
              key={pillar.title}
              className="flex flex-col border-l-2 border-crimson/60 pl-3.5 py-1.5 bg-paper-ink/[0.04] transition-colors hover:bg-paper-ink/[0.08]"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-crimson font-bold">
                  0{idx + 1}.
                </span>
                <h3 className="font-display text-sm sm:text-base font-bold text-paper-ink uppercase tracking-wide">
                  {pillar.title}
                </h3>
              </div>
              <p className="mt-1 text-[11px] sm:text-xs leading-relaxed text-paper-ink/80">
                {pillar.detail}
              </p>
            </div>
          ))}
        </div>

        {/* Sign-off, Stamps, and Official Authorization */}
        <div className="pt-4 border-t-2 border-paper-ink/25 flex flex-wrap items-end justify-between gap-6">
          <div className="flex flex-col">
            <p className="font-display italic text-2xl sm:text-3xl text-paper-ink">
              El Profesor
            </p>
            <div className="mt-1 w-36 border-t-2 border-paper-ink/60" />
            <p className="mt-1.5 font-mono text-xs tracking-[0.25em] text-crimson font-bold uppercase">
              OPERATIONAL COMMAND · AUTHORIZED
            </p>
          </div>

          {/* Red Ink Authorization Stamp */}
          <div
            className="flex flex-col items-center justify-center rounded-full border-2 border-dashed border-crimson px-6 py-3 text-center font-mono font-black text-crimson uppercase select-none shadow-[0_0_20px_rgba(201,24,43,0.15)]"
            style={{
              transform: "rotate(-6deg)",
              borderColor: "rgba(201, 24, 43, 0.8)",
              color: "rgba(201, 24, 43, 0.9)",
            }}
          >
            <span className="text-[10px] tracking-widest font-bold">OFFICIAL SEAL</span>
            <span className="text-sm sm:text-base font-extrabold tracking-wider leading-none my-0.5">
              LA CASA DE ROZGAAR
            </span>
            <span className="text-[9px] tracking-widest">VERIFIED OPERATION</span>
          </div>
        </div>

        {/* EMBEDDED FINAL HEIST RECRUITMENT DECISION */}
        <div className="mt-6 rounded-md border-2 border-crimson/50 bg-[#120506]/90 p-6 sm:p-8 text-center text-white shadow-[0_10px_35px_rgba(201,24,43,0.25)]">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-crimson animate-pulse" />
            <p className="font-mono text-xs tracking-[0.3em] text-crimson font-bold uppercase">
              FINAL CALL · RECRUITMENT DECISION
            </p>
          </div>
          <h2 className="font-display text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
            Do you want to be a part of this heist?
          </h2>
          <p className="mt-2 font-mono text-xs sm:text-sm text-paper-ink/80 max-w-xl mx-auto leading-relaxed">
            By joining the operation, you unlock market-aware intelligence, direct role matching, verified assessments, and workforce command.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={onJoin}
              className="cursor-pointer rounded bg-crimson px-8 py-3.5 font-mono text-xs sm:text-sm font-bold tracking-widest text-white uppercase transition-all duration-200 hover:bg-crimson-bright hover:shadow-[0_0_24px_rgba(201,24,43,0.8)] active:scale-95"
            >
              [ Yes, I&apos;m in ] — Enter Operation
            </button>
            <button
              type="button"
              onClick={onNotYet}
              className="cursor-pointer rounded border border-white/20 bg-white/5 px-6 py-3.5 font-mono text-xs sm:text-sm font-semibold tracking-widest text-white/80 uppercase transition-all duration-200 hover:border-white/50 hover:bg-white/10 hover:text-white active:scale-95"
            >
              [ Not yet ] — Return to Table
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
