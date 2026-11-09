"use client";

import { useRef, useState } from "react";

import Magnetic from "./Magnetic";
import { STUDIO } from "@/lib/content";
import { gsap, useGSAP, useReducedMotion } from "@/lib/motion";

export default function FinalCta() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [copied, setCopied] = useState(false);

  useGSAP(
    () => {
      if (reduced) return;
      gsap.from("[data-cta-line]", {
        yPercent: 108,
        duration: 1.3,
        ease: "expo.out",
        stagger: 0.1,
        scrollTrigger: { trigger: ref.current, start: "top 70%" },
      });
    },
    { scope: ref, dependencies: [reduced] },
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(STUDIO.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${STUDIO.email}`;
    }
  };

  return (
    <section
      ref={ref}
      id="contact"
      aria-labelledby="contact-title"
      className="relative overflow-hidden border-t-2 border-ink bg-lime px-4 py-24 md:px-8 md:py-32"
    >
      <p className="meta mb-10">(05) Contact</p>

      <h2 id="contact-title" className="display text-[clamp(60px,13.4vw,256px)] leading-[0.8]">
        <span className="block overflow-hidden">
          <span data-cta-line className="block [font-variation-settings:'wght'_900,'wdth'_62]">
            Got something
          </span>
        </span>
        <span className="block overflow-hidden">
          <span data-cta-line className="block [font-variation-settings:'wght'_900,'wdth'_125]">
            loud?
          </span>
        </span>
      </h2>

      <div className="mt-14 grid items-end gap-10 md:mt-20 md:grid-cols-12">
        <div className="md:col-span-6">
          <Magnetic strength={0.22}>
            <a
              href={`mailto:${STUDIO.email}?subject=New%20project`}
              data-cursor="Write to us"
              className="slab slab-interactive group inline-flex items-center gap-5 bg-ink px-7 py-6 text-lime md:px-10 md:py-8"
            >
              <span className="display whitespace-nowrap text-[clamp(30px,4.2vw,72px)] [font-variation-settings:'wght'_900,'wdth'_100] transition-[font-variation-settings] duration-500 group-hover:[font-variation-settings:'wght'_900,'wdth'_125]">
                Start a project
              </span>
              <span
                aria-hidden
                className="display text-[clamp(32px,4.4vw,72px)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1 group-hover:translate-x-2 group-hover:rotate-45"
              >
                ↗
              </span>
            </a>
          </Magnetic>
        </div>

        <div className="space-y-5 md:col-span-5 md:col-start-8">
          <p className="max-w-[36ch] text-[17px] leading-[1.55]">
            Tell us what you want people to feel. We reply within two working days, with questions, not a quote.
          </p>
          <button
            type="button"
            onClick={copy}
            data-cursor={copied ? "Copied" : "Copy"}
            className="slab slab-sm slab-interactive flex w-full items-center justify-between gap-4 bg-paper px-4 py-3 text-left"
          >
            <span className="text-[18px] font-bold tracking-[-0.01em]">{STUDIO.email}</span>
            <span className="meta" aria-live="polite">
              {copied ? "Copied ✓" : "Copy"}
            </span>
          </button>
          <p className="meta">{STUDIO.availability}</p>
        </div>
      </div>
    </section>
  );
}
