"use client";

import { useRef } from "react";

import { MARQUEE_WORDS, STUDIO } from "@/lib/content";
import { ScrollTrigger, gsap, useGSAP, useReducedMotion } from "@/lib/motion";

function MarqueeStrip({ tone, direction }: { tone: "lime" | "ink"; direction: 1 | -1 }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const track = ref.current;
      if (!track || reduced) return;
      // Seamless loop over half the track (the content is doubled).
      const loop = gsap.fromTo(
        track,
        { xPercent: direction === 1 ? 0 : -50 },
        { xPercent: direction === 1 ? -50 : 0, duration: 28, ease: "none", repeat: -1 },
      );
      // Scrolling fast throws the strips forward, then they ease back to cruising speed.
      const st = ScrollTrigger.create({
        onUpdate: (self) => {
          const boost = Math.min(Math.abs(self.getVelocity()) / 350, 7);
          gsap.timeline({ overwrite: true })
            .to(loop, { timeScale: 1 + boost, duration: 0.15 })
            .to(loop, { timeScale: 1, duration: 1.4, ease: "power2.out" });
        },
      });
      return () => st.kill();
    },
    { dependencies: [reduced, direction] },
  );

  const words = [...MARQUEE_WORDS, ...MARQUEE_WORDS];
  const bg = tone === "lime" ? "bg-lime text-ink" : "bg-ink text-lime";
  return (
    <div className={`overflow-hidden border-y-2 border-ink ${bg}`} aria-hidden>
      <div ref={ref} className="flex w-max">
        {words.map((w, i) => (
          <span
            key={i}
            className="display flex items-center whitespace-nowrap py-3 text-[clamp(36px,5vw,84px)] [font-variation-settings:'wght'_900,'wdth'_110]"
          >
            <span className="px-[0.4em]">{w}</span>
            <span className="text-[0.5em]">✳</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** Circular badge whose text runs around the rim; it turns as you scroll. */
function Badge() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden>
      <defs>
        <path id="badge-circle" d="M100 100 m-74 0 a74 74 0 1 1 148 0 a74 74 0 1 1 -148 0" />
      </defs>
      <circle cx="100" cy="100" r="98" fill="#d7ff35" stroke="#111" strokeWidth="4" />
      <text fontFamily="var(--font-geist-mono), monospace" fontSize="17" letterSpacing="3" fill="#111">
        <textPath href="#badge-circle">INDEPENDENT ✳ SINCE {STUDIO.founded} ✳ LOUD BY DESIGN ✳</textPath>
      </text>
      <rect x="78" y="78" width="44" height="44" fill="#111" />
    </svg>
  );
}

export default function Statement() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const trigger = { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: 0.8 };
      // Lines slide in opposite directions: the composition shears as you pass.
      gsap.fromTo("[data-s1]", { xPercent: 18 }, { xPercent: -6, ease: "none", scrollTrigger: trigger });
      gsap.fromTo("[data-s2]", { xPercent: -14 }, { xPercent: 8, ease: "none", scrollTrigger: trigger });
      gsap.fromTo("[data-s3]", { xPercent: 12 }, { xPercent: -4, ease: "none", scrollTrigger: trigger });
      gsap.fromTo("[data-badge]", { rotate: -120 }, { rotate: 240, ease: "none", scrollTrigger: trigger });
      // A steady, slow spin, so the badge reads as a turning stamp even at rest.
      gsap.to("[data-badge-spin]", { rotate: 360, duration: 16, ease: "none", repeat: -1 });
      gsap.fromTo("[data-block]", { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { ...trigger, end: "center center" } });
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <section ref={ref} aria-labelledby="statement-title" className="relative overflow-hidden border-t-2 border-ink bg-paper">
      <div className="relative px-4 pb-20 pt-24 md:px-8 md:pb-28 md:pt-32">
        <p className="meta mb-8">(04) Belief</p>
        <h2
          id="statement-title"
          aria-label="Make something that matters."
          className="display relative text-[clamp(64px,15.5vw,300px)] leading-[0.8]"
        >
          <span aria-hidden data-s1 className="block text-right [font-variation-settings:'wght'_900,'wdth'_125]">
            Make
          </span>
          {/* Highlights live inside the words they mark, so they travel with the type
              and hug the cap height instead of the line box. */}
          <span aria-hidden data-s2 className="block [font-variation-settings:'wght'_900,'wdth'_80]">
            <span className="relative inline-block">
              <span data-block className="absolute -inset-x-[0.04em] bottom-[0.025em] top-[0.01em] origin-bottom bg-cobalt" />
              <span className="outline-text relative">Some</span>
            </span>
            <span className="outline-text">thing</span>
          </span>
          <span aria-hidden data-s3 className="block [font-variation-settings:'wght'_900,'wdth'_62]">
            That{" "}
            <span className="relative inline-block">
              <span className="absolute -inset-x-[0.05em] bottom-[0.025em] top-[0.01em] bg-lime" />
              <span className="relative">matters.</span>
            </span>
          </span>
        </h2>

        {/* Outer layer turns with scroll; inner layer spins on its own. */}
        <div data-badge className="absolute right-[6%] top-[38%] h-[clamp(110px,14vw,220px)] w-[clamp(110px,14vw,220px)] md:right-[12%]">
          <div data-badge-spin className="h-full w-full">
            <Badge />
          </div>
        </div>
      </div>

      {/* Two crossing strips, one each way. */}
      <div className="relative h-[clamp(150px,18vw,260px)]">
        <div className="absolute inset-x-[-4%] top-[18%] -rotate-[4deg]">
          <MarqueeStrip tone="ink" direction={-1} />
        </div>
        <div className="absolute inset-x-[-4%] top-[18%] rotate-[3deg]">
          <MarqueeStrip tone="lime" direction={1} />
        </div>
      </div>
    </section>
  );
}
