"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

import ProximityText from "./ProximityText";
import LocalTime from "./LocalTime";
import type { PieceInfo } from "./Sculpture";
import { STUDIO } from "@/lib/content";
import { gsap, useGSAP, useMediaQuery, useReducedMotion } from "@/lib/motion";
import { useFitText } from "@/lib/useFitText";

const Sculpture = dynamic(() => import("./Sculpture"), { ssr: false });

// Under the cursor the type erodes: heavy and wide becomes light and narrow.
const ERODE = { wght: 180, wdth: 62 };

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const breakRef = useRef<HTMLSpanElement>(null);
  const ordinaryRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const [piece, setPiece] = useState<PieceInfo | null>(null);
  const [inView, setInView] = useState(true);
  const reduced = useReducedMotion();
  const wide = useMediaQuery("(min-width: 768px)");

  // Desktop: type owns the left ~62% of the hero, the cube owns the right column.
  useFitText(breakRef, wide ? 0.6 : 1, wide ? 30 : 22);
  useFitText(ordinaryRef, wide ? 0.66 : 1, wide ? 34 : 22);

  // Pointer for the sculpture (window-wide, so the type layered on top never blocks it).
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointerRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
      const label = labelRef.current;
      if (label) label.style.transform = `translate3d(${e.clientX + 18}px, ${e.clientY + 18}px, 0)`;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // Stop rendering the sculpture once the hero is off screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onHover = useCallback((p: PieceInfo | null) => setPiece(p), []);

  useGSAP(
    () => {
      if (reduced) {
        gsap.set("[data-hero-line], [data-hero-meta], [data-hero-the]", { clearProps: "all" });
        return;
      }
      // Entrance: lines rise out of their masks, the lime block wipes in, metadata types on.
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.from("[data-hero-line]", { yPercent: 105, duration: 1.4, stagger: 0.12 }, 0.15)
        .from("[data-hero-the]", { scaleX: 0, transformOrigin: "left center", duration: 0.9, ease: "power4.inOut" }, 0.55)
        .from("[data-hero-meta]", { opacity: 0, y: 8, duration: 0.8, stagger: 0.05 }, 0.7);

      // Scroll: the composition pulls apart as the hero leaves.
      gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
          onUpdate: (self) => (scrollRef.current = self.progress),
        },
      })
        .to("[data-hero-break]", { xPercent: -14, ease: "none" }, 0)
        .to("[data-hero-ordinary]", { xPercent: 9, ease: "none" }, 0)
        .to("[data-hero-the-wrap]", { rotate: -6, x: 40, ease: "none" }, 0);
    },
    { scope: sectionRef, dependencies: [reduced] },
  );

  return (
    <section
      ref={sectionRef}
      id="top"
      aria-labelledby="hero-title"
      className="relative h-[100svh] min-h-[600px] overflow-hidden bg-paper"
    >
      {/* Swiss column grid, faintly visible: the page is built on it. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 grid grid-cols-6 px-4 md:grid-cols-12 md:px-8">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className={`border-l border-ink/[0.07] ${i >= 6 ? "hidden md:block" : ""} ${i === 11 ? "border-r" : ""}`} />
        ))}
      </div>

      {/* Headline. All type sits above the 3D layer so it is never covered. */}
      <h1 id="hero-title" className="sr-only">
        Break the ordinary.
      </h1>
      {/* The cube: the ordinary, waiting to be broken. */}
      <div
        className="absolute inset-x-0 top-[11%] z-10 h-[42%] md:left-auto md:right-[2%] md:top-[15%] md:h-[70%] md:w-[34%]"
        aria-label="Interactive 3D block of concrete cut into ten slabs. Hover a slab to push it out, click to break it out."
        role="img"
      >
        <Sculpture
          scrollRef={scrollRef}
          pointerRef={pointerRef}
          active={inView}
          reducedMotion={reduced}
          compact={!wide}
          onHover={onHover}
        />
        <p data-hero-meta className="meta pointer-events-none absolute -bottom-6 right-0 hidden text-ink/60 lg:block">
          Fig. 01 / The ordinary, in 10 slabs
        </p>
      </div>

      {/* One stack, centred in the space between the metadata rows, so the three
          lines always read as a single block whatever the screen height. */}
      <div
        className="pointer-events-none absolute inset-x-4 bottom-[9%] z-20 md:inset-x-8 md:bottom-[8%] md:top-[max(13%,124px)] md:flex md:flex-col md:justify-center"
        aria-hidden
      >
        <div data-hero-break className="mb-[2vh] md:mb-[3vh]">
          <div className="overflow-hidden">
            <span ref={breakRef} data-hero-line className="display inline-block whitespace-nowrap leading-[0.8]">
              <ProximityText text="BREAK" rest={{ wght: 900, wdth: 125 }} near={ERODE} />
            </span>
          </div>
        </div>
        {/* Staircase: THE steps across so its right edge sits exactly under the K of BREAK. */}
        <div data-hero-the-wrap className="mb-[2vh] origin-left md:mb-[3vh] md:flex md:w-[60%] md:origin-right md:justify-end">
          {/* Room on the right and bottom so the mask doesn't clip the hard shadow. */}
          <div className="overflow-hidden pb-[10px] pr-[10px]">
            <span
              data-hero-line
              className="inline-block"
            >
              <span
                data-hero-the
                className="display slab inline-block bg-lime px-[0.12em] pt-[0.1em] text-[clamp(44px,10vw,64px)] leading-[0.85] md:text-[clamp(56px,7.2vw,132px)]"
              >
                <ProximityText text="THE" rest={{ wght: 900, wdth: 100 }} near={{ wght: 300, wdth: 125 }} radius={180} />
              </span>
            </span>
          </div>
        </div>
        <div data-hero-ordinary>
          <div className="overflow-hidden">
            <span ref={ordinaryRef} data-hero-line className="display inline-block whitespace-nowrap leading-[0.8]">
              <ProximityText text="ORDINARY." rest={{ wght: 900, wdth: 72 }} near={ERODE} />
            </span>
          </div>
        </div>
      </div>

      {/* Metadata in the margins. */}
      <div className="meta pointer-events-none absolute inset-x-4 top-[76px] z-30 flex justify-between text-ink/70 md:inset-x-8 md:top-[92px]">
        <p data-hero-meta className="max-w-[22ch]">
          (00) {STUDIO.descriptor}
        </p>
        <p data-hero-meta className="text-right">
          Est. {STUDIO.founded}
          <br />
          Vol. 07 / 2026
        </p>
      </div>
      <div className="meta pointer-events-none absolute inset-x-4 bottom-3 z-30 flex items-end justify-between text-ink/70 md:inset-x-8 md:bottom-4">
        <p data-hero-meta>
          {STUDIO.coordinates}
          <br />
          {STUDIO.city} <LocalTime />
        </p>
        <p data-hero-meta className="text-right">
          Scroll to break it ↓
        </p>
      </div>

      {/* Spec label for the sculpture piece under the cursor. */}
      <div
        ref={labelRef}
        aria-live="polite"
        className={`meta pointer-events-none fixed left-0 top-0 z-[60] border-2 border-ink bg-paper px-2.5 py-2 text-ink transition-opacity duration-200 ${
          piece ? "opacity-100" : "opacity-0"
        }`}
      >
        {piece && (
          <>
            <span className="block font-bold">{piece.label}</span>
            <span className="block text-ink/65 normal-case tracking-normal">{piece.spec}</span>
          </>
        )}
      </div>
    </section>
  );
}
