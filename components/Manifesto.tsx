"use client";

import { useRef } from "react";

import { gsap, useGSAP, useReducedMotion } from "@/lib/motion";
import { useFitText } from "@/lib/useFitText";

const WIDEST = '"wght" 900, "wdth" 125';

export default function Manifesto() {
  const ref = useRef<HTMLElement>(null);
  const lastLineRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  // The closing line widens as it scrolls in; size it at its widest state so it
  // always ends on exactly one line.
  useFitText(lastLineRef, 1, 30, 400, WIDEST);

  useGSAP(
    () => {
      if (reduced) return;
      // Lines rise out of their masks as they enter.
      gsap.utils.toArray<HTMLElement>("[data-line]").forEach((line) => {
        gsap.from(line, {
          yPercent: 108,
          duration: 1.2,
          ease: "expo.out",
          scrollTrigger: { trigger: line, start: "top 88%" },
        });
      });

      // Scrubbed: ATTENTION fills from outline to solid; a lime block wipes in behind TAKES.
      gsap.fromTo(
        "[data-fill]",
        { clipPath: "inset(0 100% 0 0)" },
        {
          clipPath: "inset(0 0% 0 0)",
          ease: "none",
          scrollTrigger: { trigger: "[data-fill]", start: "top 80%", end: "top 35%", scrub: true },
        },
      );
      gsap.fromTo(
        "[data-highlight]",
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: "[data-highlight]", start: "top 85%", end: "top 55%", scrub: true },
        },
      );
      // The closing line widens as it settles, from condensed to expanded.
      gsap.fromTo(
        "[data-widen]",
        { fontVariationSettings: '"wght" 900, "wdth" 62' },
        {
          fontVariationSettings: WIDEST,
          ease: "none",
          // Finishes growing once the line is 60% up the screen, so it is at full width
          // while you are actually reading it.
          scrollTrigger: { trigger: "[data-widen]", start: "top 100%", end: "top 60%", scrub: true },
        },
      );
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <section
      ref={ref}
      id="manifesto"
      aria-labelledby="manifesto-title"
      className="relative border-t-2 border-ink bg-paper px-4 py-24 md:px-8 md:py-36"
    >
      <div className="grid gap-10 md:grid-cols-12">
        <aside className="md:col-span-3">
          <div className="md:sticky md:top-28">
            <p className="meta">(01) Manifesto</p>
            <p className="mt-5 max-w-[30ch] text-[15px] leading-[1.6] text-ink/75">
              We&apos;re a small studio that would rather be remembered than liked. Six people, one rule: if it could
              belong to anyone, it isn&apos;t finished.
            </p>
          </div>
        </aside>

        <h2
          id="manifesto-title"
          className="display text-[clamp(46px,10.4vw,188px)] md:col-span-9"
          aria-label="Good design doesn't ask for attention. It takes it."
        >
          <span aria-hidden className="block overflow-hidden">
            <span data-line className="block [font-variation-settings:'wght'_900,'wdth'_125]">
              Good design
            </span>
          </span>
          <span aria-hidden className="block overflow-hidden">
            <span data-line className="block pl-[8%] [font-variation-settings:'wght'_300,'wdth'_62]">
              doesn&apos;t ask
            </span>
          </span>
          <span aria-hidden className="block overflow-hidden">
            <span data-line className="block [font-variation-settings:'wght'_900,'wdth'_80]">
              for{" "}
              <span className="relative inline-block">
                <span className="outline-text">attention.</span>
                <span data-fill className="absolute inset-0 text-ink" style={{ clipPath: "inset(0 0 0 0)" }}>
                  attention.
                </span>
              </span>
            </span>
          </span>
          <span aria-hidden className="mt-[0.18em] block overflow-hidden pb-[0.04em]">
            <span
              ref={lastLineRef}
              data-line
              data-widen
              className="inline-block whitespace-nowrap [font-variation-settings:'wght'_900,'wdth'_125]"
            >
              It{" "}
              <span className="relative inline-block px-[0.06em]">
                <span data-highlight aria-hidden className="absolute inset-y-[0.04em] inset-x-0 -z-0 origin-left bg-lime" />
                <span className="relative">takes</span>
              </span>{" "}
              it.
            </span>
          </span>
        </h2>
      </div>

      <div className="mt-20 grid gap-6 md:mt-28 md:grid-cols-12">
        <p className="meta md:col-span-3 md:col-start-4">Fig. 02 / Reading order</p>
        <p className="max-w-[46ch] text-[17px] leading-[1.6] md:col-span-5">
          Attention is the only currency a brand really spends. We design the moment it&apos;s earned: the first
          screen, the first second, the first sentence.
        </p>
      </div>
    </section>
  );
}
