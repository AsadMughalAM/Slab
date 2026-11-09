"use client";

import { useEffect, useRef, useState } from "react";

import Magnetic from "./Magnetic";
import { NAV_LINKS, STUDIO } from "@/lib/content";
import { gsap, useGSAP, useReducedMotion } from "@/lib/motion";

/** Logo whose letters stretch along the width axis, one after another, on hover. */
function Logo() {
  return (
    <a
      href="#top"
      aria-label={`${STUDIO.name}, back to top`}
      className="group display flex items-start text-[26px] leading-none tracking-[-0.04em]"
    >
      {Array.from(STUDIO.name).map((ch, i) => (
        <span
          key={i}
          aria-hidden
          className="inline-block transition-[font-variation-settings] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] [font-variation-settings:'wdth'_62,'wght'_900] group-hover:[font-variation-settings:'wdth'_125,'wght'_900]"
          style={{ transitionDelay: `${i * 40}ms` }}
        >
          {ch}
        </span>
      ))}
      <span aria-hidden className="ml-0.5 mt-0.5 text-[11px] font-bold">
        ®
      </span>
    </a>
  );
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // Scroll progress + hide-on-scroll-down / reveal-on-scroll-up.
  useEffect(() => {
    let lastY = window.scrollY;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? y / max : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      if (pctRef.current) pctRef.current.textContent = String(Math.round(p * 100)).padStart(3, "0");
      setScrolled(y > 24);
      if (Math.abs(y - lastY) > 6) {
        setHidden(y > lastY && y > window.innerHeight * 0.9);
        lastY = y;
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Mobile menu: lock scroll, close on Escape, stagger links in.
  useEffect(() => {
    if (!menuOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    menuRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  useGSAP(
    () => {
      if (!menuOpen || reduced) return;
      gsap.from("[data-menu-item]", { yPercent: 110, duration: 0.8, ease: "expo.out", stagger: 0.06 });
    },
    { dependencies: [menuOpen, reduced], scope: menuRef },
  );

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          hidden && !menuOpen ? "-translate-y-full" : "translate-y-0"
        } ${scrolled ? "border-b-2 border-ink bg-paper" : "border-b-2 border-transparent bg-transparent"}`}
      >
        <nav aria-label="Main" className="flex h-16 items-center justify-between gap-6 px-4 md:h-[72px] md:px-8">
          <Logo />

          <ul className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((l, i) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="group relative block overflow-hidden px-3 py-2 text-[13px] font-semibold uppercase tracking-[0.02em]"
                >
                  <span className="meta mr-1.5 text-ink/45">0{i + 1}</span>
                  {/* A lime block wipes up behind the link on hover. */}
                  <span
                    aria-hidden
                    className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-lime transition-transform duration-300 ease-[cubic-bezier(0.7,0,0.2,1)] group-hover:scale-y-100"
                  />
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4">
            <span className="meta hidden tabular-nums text-ink/55 lg:block" aria-hidden>
              <span ref={pctRef}>000</span>%
            </span>
            <Magnetic className="hidden md:inline-block" strength={0.25}>
              <a
                href="#contact"
                className="slab slab-sm slab-interactive inline-block bg-paper px-4 py-2 text-[13px] font-extrabold uppercase tracking-[0.02em] hover:bg-lime"
              >
                Start a project ↗
              </a>
            </Magnetic>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="slab slab-sm slab-interactive bg-paper px-3 py-1.5 text-[12px] font-extrabold uppercase md:hidden"
            >
              {menuOpen ? "Close" : "Menu"}
            </button>
          </div>
        </nav>

        {/* Scroll progress. */}
        <div aria-hidden className="absolute inset-x-0 -bottom-[2px] h-[4px]">
          <div ref={barRef} className="h-full w-full origin-left bg-lime" style={{ transform: "scaleX(0)" }} />
        </div>
      </header>

      {menuOpen && (
        <div
          id="mobile-menu"
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-40 flex flex-col justify-between bg-lime px-4 pb-8 pt-24"
        >
          <ul className="space-y-1">
            {NAV_LINKS.map((l, i) => (
              <li key={l.href} className="overflow-hidden border-b-2 border-ink">
                <a
                  data-menu-item
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="display flex items-baseline justify-between py-3 text-[clamp(44px,14vw,88px)] [font-variation-settings:'wdth'_80]"
                >
                  {l.label}
                  <span className="meta">0{i + 1}</span>
                </a>
              </li>
            ))}
          </ul>
          <div className="meta flex justify-between">
            <span>{STUDIO.email}</span>
            <span>{STUDIO.city}</span>
          </div>
        </div>
      )}
    </>
  );
}
