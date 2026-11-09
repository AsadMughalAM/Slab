"use client";

import { useRef } from "react";

import LocalTime from "./LocalTime";
import ProximityText from "./ProximityText";
import { NAV_LINKS, SOCIAL_LINKS, STUDIO } from "@/lib/content";
import { gsap, useGSAP, useReducedMotion } from "@/lib/motion";
import { useFitText } from "@/lib/useFitText";

function Asterisk() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
      {[0, 45, 90, 135].map((a) => (
        <rect key={a} x="44" y="0" width="12" height="100" fill="#111" transform={`rotate(${a} 50 50)`} />
      ))}
    </svg>
  );
}

export default function Footer() {
  const ref = useRef<HTMLElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  useFitText(wordRef, 1, 60, 2000);

  useGSAP(
    () => {
      if (reduced) return;
      // The asterisk turns with the page: one full turn across the footer.
      gsap.fromTo(
        "[data-asterisk]",
        { rotate: 0 },
        { rotate: 360, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom bottom", scrub: 0.5 } },
      );
    },
    { scope: ref, dependencies: [reduced] },
  );

  const year = new Date().getFullYear();

  return (
    <footer ref={ref} className="border-t-2 border-ink bg-paper px-4 pt-14 md:px-8 md:pt-20">
      <div className="grid gap-10 md:grid-cols-12">
        <div className="flex items-start gap-5 md:col-span-4">
          <div data-asterisk className="h-14 w-14 shrink-0 md:h-20 md:w-20">
            <Asterisk />
          </div>
          <p className="max-w-[24ch] text-[17px] font-semibold leading-[1.35]">{STUDIO.descriptor}. Loud by design since {STUDIO.founded}.</p>
        </div>

        <nav aria-label="Footer" className="md:col-span-2 md:col-start-6">
          <p className="meta mb-4 text-ink/55">Index</p>
          <ul className="space-y-1.5">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="group inline-flex items-center gap-2 text-[17px] font-bold uppercase">
                  <span className="inline-block w-0 overflow-hidden transition-[width] duration-300 group-hover:w-4">→</span>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-2">
          <p className="meta mb-4 text-ink/55">Elsewhere</p>
          <ul className="space-y-1.5">
            {SOCIAL_LINKS.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[linear-gradient(var(--lime),var(--lime))] bg-[length:0%_100%] bg-no-repeat text-[17px] font-bold uppercase transition-[background-size] duration-300 hover:bg-[length:100%_100%]"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          <p className="meta mb-4 text-ink/55">Studio</p>
          <dl className="meta space-y-2">
            <div className="flex justify-between border-b border-ink/20 pb-2">
              <dt>Based in</dt>
              <dd>{STUDIO.city}</dd>
            </div>
            <div className="flex justify-between border-b border-ink/20 pb-2">
              <dt>Local time</dt>
              <dd>
                <LocalTime />
              </dd>
            </div>
            <div className="flex justify-between border-b border-ink/20 pb-2">
              <dt>Position</dt>
              <dd>{STUDIO.coordinates}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Status</dt>
              <dd className="flex items-center gap-2 text-right">
                <span className="block h-2 w-2 animate-pulse bg-signal motion-reduce:animate-none" aria-hidden />
                {STUDIO.availability}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* The wordmark, as wide as the page allows. */}
      <div className="mt-16 overflow-hidden md:mt-24" aria-hidden>
        <span ref={wordRef} className="display inline-block whitespace-nowrap leading-[0.78]">
          <ProximityText text={`${STUDIO.name}®`} rest={{ wght: 900, wdth: 125 }} near={{ wght: 160, wdth: 62 }} radius={320} />
        </span>
      </div>

      <div className="meta flex flex-wrap justify-between gap-3 border-t-2 border-ink py-4">
        <span>
          © {year} {STUDIO.name}® — All rights reserved
        </span>
        <a href="#top" className="hover:bg-lime">
          Back to top ↑
        </a>
      </div>
    </footer>
  );
}
