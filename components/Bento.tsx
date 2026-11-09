"use client";

import { useEffect, useRef, useState } from "react";

import LocalTime from "./LocalTime";
import { SERVICES, STUDIO } from "@/lib/content";
import { gsap, useGSAP, useReducedMotion } from "@/lib/motion";

// ---------------------------------------------------------------------------
// Pixel field: paint on a grid; your marks fade after a few seconds.
// ---------------------------------------------------------------------------
const PIXELS = 10 * 7;
function PixelField() {
  const [lit, setLit] = useState<Record<number, number>>({});

  useEffect(() => {
    const id = window.setInterval(() => {
      const now = Date.now();
      setLit((prev) => {
        const next: Record<number, number> = {};
        let changed = false;
        for (const [k, t] of Object.entries(prev)) {
          if (now - t < 2600) next[+k] = t;
          else changed = true;
        }
        return changed ? next : prev;
      });
    }, 400);
    return () => window.clearInterval(id);
  }, []);

  const paint = (i: number) => setLit((p) => ({ ...p, [i]: Date.now() }));

  return (
    <div className="grid h-full grid-cols-10 gap-[3px]" data-cursor="Paint" aria-hidden>
      {Array.from({ length: PIXELS }).map((_, i) => (
        <div
          key={i}
          onPointerEnter={() => paint(i)}
          className={`aspect-square border-2 border-ink transition-colors duration-700 ${lit[i] ? "bg-lime duration-75" : "bg-cobalt"}`}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Type specimen: the cursor drives the font's weight and width axes.
// ---------------------------------------------------------------------------
function TypeSpecimen() {
  const boxRef = useRef<HTMLDivElement>(null);
  const glyphRef = useRef<HTMLSpanElement>(null);
  const readRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    const glyph = glyphRef.current;
    const read = readRef.current;
    if (!box || !glyph || !read) return;
    const set = (wght: number, wdth: number) => {
      glyph.style.fontVariationSettings = `"wght" ${wght}, "wdth" ${wdth}`;
      read.textContent = `wght ${Math.round(wght)} / wdth ${Math.round(wdth)}`;
    };
    const onMove = (e: PointerEvent) => {
      const r = box.getBoundingClientRect();
      const x = Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1);
      const y = Math.min(Math.max((e.clientY - r.top) / r.height, 0), 1);
      set(100 + (1 - y) * 800, 62 + x * 63);
    };
    const onLeave = () => set(900, 100);
    set(900, 100);
    box.addEventListener("pointermove", onMove);
    box.addEventListener("pointerleave", onLeave);
    return () => {
      box.removeEventListener("pointermove", onMove);
      box.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={boxRef} className="flex h-full flex-col justify-between" data-cursor="Move">
      <div className="flex justify-between">
        <p className="meta">Archivo / variable</p>
        <span ref={readRef} className="meta tabular-nums text-ink/60" />
      </div>
      <span
        ref={glyphRef}
        aria-hidden
        className="block text-center text-[clamp(120px,14vw,220px)] leading-[0.85] tracking-[-0.04em] transition-[font-variation-settings] duration-150"
      >
        Aa
      </span>
      <p className="meta text-ink/60">Left–right: width. Up–down: weight.</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Counter that runs up when it scrolls into view.
// ---------------------------------------------------------------------------
function Counter({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (reduced) {
        el.textContent = String(to);
        return;
      }
      const obj = { v: 0 };
      gsap.to(obj, {
        v: to,
        duration: 1.8,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 85%" },
        onUpdate: () => (el.textContent = String(Math.round(obj.v))),
      });
    },
    { dependencies: [reduced, to] },
  );
  return (
    <span ref={ref} className="tabular-nums">
      {to}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Modular tiles: a Bauhaus-style composition; hover turns each tile a quarter.
// ---------------------------------------------------------------------------
const TILES: { shape: "quarter" | "half" | "bar" | "tri" | "dot" | "square"; tone: "ink" | "paper" | "lime" }[] = [
  { shape: "quarter", tone: "ink" },
  { shape: "bar", tone: "paper" },
  { shape: "tri", tone: "ink" },
  { shape: "half", tone: "lime" },
  { shape: "square", tone: "paper" },
  { shape: "quarter", tone: "ink" },
  { shape: "dot", tone: "paper" },
  { shape: "tri", tone: "ink" },
];

function Tile({ shape, tone, i }: (typeof TILES)[number] & { i: number }) {
  const [turns, setTurns] = useState(i % 4);
  const bg = tone === "ink" ? "bg-ink" : tone === "lime" ? "bg-lime" : "bg-paper";
  const fg = tone === "ink" ? "fill-paper" : "fill-ink";
  return (
    <button
      type="button"
      aria-label="Rotate tile"
      onPointerEnter={() => setTurns((t) => t + 1)}
      onClick={() => setTurns((t) => t + 1)}
      className={`relative aspect-square overflow-hidden border-2 border-ink ${bg}`}
    >
      <svg
        viewBox="0 0 100 100"
        aria-hidden
        className={`absolute inset-0 h-full w-full transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.2,1)] ${fg}`}
        style={{ transform: `rotate(${turns * 90}deg)` }}
      >
        {shape === "quarter" && <path d="M0 0 H100 A100 100 0 0 1 0 100 Z" />}
        {shape === "half" && <path d="M0 50 A50 50 0 0 1 100 50 Z" />}
        {shape === "bar" && <rect x="0" y="34" width="100" height="32" />}
        {shape === "tri" && <path d="M0 100 L100 100 L0 0 Z" />}
        {shape === "dot" && <circle cx="50" cy="50" r="26" />}
        {shape === "square" && <rect x="25" y="25" width="50" height="50" />}
      </svg>
    </button>
  );
}

// ---------------------------------------------------------------------------

export default function Bento() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      // Cards drop onto the page: they arrive offset by their own shadow, then land.
      gsap.utils.toArray<HTMLElement>("[data-card]").forEach((card, i) => {
        gsap.from(card, {
          x: 10,
          y: 40,
          opacity: 0,
          duration: 0.9,
          ease: "expo.out",
          delay: (i % 3) * 0.06,
          scrollTrigger: { trigger: card, start: "top 92%" },
        });
      });
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <section ref={ref} id="studio" aria-labelledby="studio-title" className="border-t-2 border-ink bg-paper px-4 py-24 md:px-8 md:py-32">
      <header className="mb-12 grid gap-6 md:mb-16 md:grid-cols-12">
        <p className="meta md:col-span-3">(02) Studio</p>
        <h2
          id="studio-title"
          className="display text-[clamp(40px,6.4vw,112px)] [font-variation-settings:'wght'_900,'wdth'_70] md:col-span-9"
        >
          What we do, <span className="outline-text">in pieces.</span>
        </h2>
      </header>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-6 md:gap-6 lg:grid-cols-12">
        {/* Statement */}
        <article data-card className="slab slab-interactive group flex min-h-[340px] flex-col justify-between bg-paper p-6 md:col-span-6 lg:col-span-7 lg:row-span-2 md:p-8">
          <p className="meta">Position</p>
          <p className="display text-[clamp(40px,5.4vw,96px)] leading-[1.04] transition-[font-variation-settings] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] [font-variation-settings:'wght'_900,'wdth'_62] group-hover:[font-variation-settings:'wght'_900,'wdth'_100]">
            We make brands that refuse to{" "}
            <span className="inline-block bg-ink px-[0.08em] pb-[0.02em] pt-[0.1em] leading-[0.82] text-lime">whisper.</span>
          </p>
          <p className="max-w-[44ch] text-[15px] leading-[1.6] text-ink/75">
            Identity, web and creative code under one roof, so the idea survives all the way from the logo to the
            last line of JavaScript.
          </p>
        </article>

        {/* Stat */}
        <article data-card className="slab slab-interactive flex min-h-[220px] flex-col justify-between bg-lime p-6 md:col-span-3 lg:col-span-5 md:p-8">
          <p className="meta">Shipped since {STUDIO.founded}</p>
          <p className="display flex items-end justify-between text-[clamp(88px,10vw,176px)] [font-variation-settings:'wght'_900,'wdth'_80]">
            <Counter to={148} />
            <span className="mb-[0.12em] text-[0.18em] tracking-[0] [font-variation-settings:'wght'_800,'wdth'_100]">projects</span>
          </p>
        </article>

        {/* Services */}
        <article data-card className="slab slab-interactive bg-ink p-6 text-paper md:col-span-3 lg:col-span-5 md:p-8">
          <p className="meta mb-4 text-paper/60">Services</p>
          <ul>
            {SERVICES.map((s) => (
              <li key={s.name} className="group/row border-t-2 border-paper/20 last:border-b-2">
                <span className="flex flex-col items-start gap-1 px-2 py-3 transition-colors duration-200 group-hover/row:bg-lime group-hover/row:text-ink sm:flex-row sm:items-baseline sm:justify-between">
                  <span className="text-[19px] font-extrabold uppercase tracking-[-0.01em]">{s.name}</span>
                  <span className="meta text-paper/50 transition-[transform,color] duration-300 group-hover/row:-translate-x-1 group-hover/row:text-ink">
                    {s.detail} →
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </article>

        {/* Pixel field */}
        <article data-card className="slab slab-interactive flex flex-col gap-4 bg-cobalt p-5 text-paper md:col-span-3 lg:col-span-4">
          <div className="flex justify-between">
            <p className="meta">Pixel field</p>
            <p className="meta text-paper/70">Draw. It fades.</p>
          </div>
          <PixelField />
        </article>

        {/* Type specimen */}
        <article data-card className="slab slab-interactive min-h-[320px] bg-paper p-6 md:col-span-3 lg:col-span-4">
          <TypeSpecimen />
        </article>

        {/* Availability */}
        <article data-card className="slab slab-interactive flex min-h-[320px] flex-col justify-between bg-signal p-6 text-ink md:col-span-6 lg:col-span-4 md:p-8">
          <div className="flex items-center justify-between">
            <p className="meta">Availability</p>
            <span className="flex items-center gap-2">
              <span className="block h-2.5 w-2.5 animate-pulse bg-ink motion-reduce:animate-none" aria-hidden />
              <span className="meta">Open</span>
            </span>
          </div>
          <p className="display text-[clamp(44px,4.8vw,80px)] leading-[0.86] [font-variation-settings:'wght'_900,'wdth'_70]">
            Now booking Q1 2027
          </p>
          <p className="meta flex justify-between">
            <span>{STUDIO.city}</span>
            <LocalTime seconds={false} />
          </p>
        </article>

        {/* Modular tiles */}
        <article data-card className="slab flex flex-col justify-between gap-5 bg-paper p-5 md:col-span-6 lg:col-span-8 md:p-6">
          <p className="meta">System / 8 modules</p>
          <div className="grid grid-cols-4 gap-0 md:grid-cols-8">
            {TILES.map((t, i) => (
              <Tile key={i} {...t} i={i} />
            ))}
          </div>
          <p className="meta text-ink/60">Hover a tile to turn it. Every arrangement still works.</p>
        </article>

        {/* Awards */}
        <article data-card className="slab slab-interactive flex min-h-[200px] flex-col justify-between bg-paper p-6 md:col-span-6 lg:col-span-4 md:p-8">
          <p className="meta">Recognition, 2019–2026</p>
          <p className="display text-[clamp(64px,7vw,120px)] [font-variation-settings:'wght'_900,'wdth'_62]">
            <span className="outline-text">12</span> awards
          </p>
        </article>
      </div>
    </section>
  );
}
