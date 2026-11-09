"use client";

import { useRef, type PointerEvent as ReactPointerEvent } from "react";

import Poster from "./Poster";
import { PROJECTS, type Project } from "@/lib/content";
import { ScrollTrigger, gsap, useDesktop, useGSAP, useReducedMotion } from "@/lib/motion";
import { useFitText } from "@/lib/useFitText";

/** Poster with depth parallax and a cursor lens that reveals an inverted print beneath. */
function PosterFrame({ project }: { project: Project }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", String((e.clientX - r.left) / r.width));
    el.style.setProperty("--my", String((e.clientY - r.top) / r.height));
    el.style.setProperty("--lens", "120px");
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--mx", "0.5");
    el.style.setProperty("--my", "0.5");
    el.style.setProperty("--lens", "0px");
  };

  return (
    <div
      ref={ref}
      data-poster
      data-cursor="View"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="slab lens-frame relative aspect-[4/5] w-full overflow-hidden bg-paper [--mx:0.5] [--my:0.5] lg:h-full lg:w-auto"
    >
      <Poster kind={project.poster} />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          WebkitMaskImage:
            "radial-gradient(circle at calc(var(--mx) * 100%) calc(var(--my) * 100%), #000 var(--lens), transparent calc(var(--lens) + 1px))",
          maskImage:
            "radial-gradient(circle at calc(var(--mx) * 100%) calc(var(--my) * 100%), #000 var(--lens), transparent calc(var(--lens) + 1px))",
        }}
      >
        <Poster kind={project.poster} inverted />
      </div>
    </div>
  );
}

function Panel({ project }: { project: Project }) {
  const titleRef = useRef<HTMLSpanElement>(null);
  useFitText(titleRef, 0.94, 24, 200);

  return (
    <article
      data-panel
      aria-labelledby={`project-${project.id}`}
      className="relative grid shrink-0 gap-6 border-ink pr-2 lg:h-full lg:w-[82vw] lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-10 lg:border-r-2 lg:pr-10"
    >
      <div className="flex min-w-0 flex-col justify-between gap-8">
        <div>
          <p className="meta flex flex-wrap gap-x-6 gap-y-1">
            <span>({project.index})</span>
            <span>{project.year}</span>
            <span>{project.discipline}</span>
          </p>
          {/* Layered title, fitted to its column so long names never push the layout. */}
          <h3 id={`project-${project.id}`} className="display relative mt-6 leading-[0.82]">
            <span ref={titleRef} className="relative inline-block whitespace-nowrap">
              <span
                aria-hidden
                data-title-shadow
                className="outline-text absolute left-[0.05em] top-[0.05em] [font-variation-settings:'wght'_900,'wdth'_125]"
              >
                {project.title}
              </span>
              <span className="relative [font-variation-settings:'wght'_900,'wdth'_125]">{project.title}</span>
            </span>
          </h3>
        </div>
        <div className="flex flex-col gap-4">
          <p className="max-w-[38ch] text-[16px] leading-[1.6]">{project.summary}</p>
          <p className="meta text-ink/60">Client / {project.client}</p>
        </div>
      </div>
      <div className="lg:h-full">
        <div data-reveal className="h-full">
          <PosterFrame project={project} />
        </div>
      </div>
    </article>
  );
}

export default function Showcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const desktop = useDesktop();
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const track = trackRef.current;
      const section = sectionRef.current;
      if (!track || !section || reduced) return;

      if (desktop) {
        // Pinned horizontal story: vertical scroll drives the track sideways.
        const distance = () => track.scrollWidth - window.innerWidth + 64;
        const move = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });
        // Each poster is unmasked from the bottom as its panel slides in.
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el, i) => {
          if (i === 0) return;
          gsap.fromTo(
            el,
            { clipPath: "inset(100% 0 0 0)" },
            {
              clipPath: "inset(0% 0 0 0)",
              ease: "none",
              // Completes by the time the poster's left edge is 3/4 across the screen,
              // so even the last poster is fully revealed before the pin releases.
              scrollTrigger: { trigger: el, containerAnimation: move, start: "left 100%", end: "left 75%", scrub: true },
            },
          );
        });
        // Outline titles drift against the solid ones.
        gsap.utils.toArray<HTMLElement>("[data-title-shadow]").forEach((el) => {
          gsap.fromTo(
            el,
            { x: 40 },
            {
              x: -24,
              ease: "none",
              scrollTrigger: { trigger: el, containerAnimation: move, start: "left right", end: "right left", scrub: true },
            },
          );
        });
      } else {
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
          gsap.fromTo(
            el,
            { clipPath: "inset(100% 0 0 0)" },
            { clipPath: "inset(0% 0 0 0)", duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 85%" } },
          );
        });
      }
      ScrollTrigger.refresh();
    },
    { scope: sectionRef, dependencies: [desktop, reduced], revertOnUpdate: true },
  );

  return (
    <section
      ref={sectionRef}
      id="work"
      aria-labelledby="work-title"
      className="overflow-hidden border-t-2 border-ink bg-paper lg:h-screen"
    >
      <div className="flex h-full flex-col px-4 pb-10 pt-24 md:px-8 lg:pb-8 lg:pt-[96px]">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4 lg:mb-6">
          <div>
            <p className="meta">(03) Selected work</p>
            <h2 id="work-title" className="display mt-3 text-[clamp(36px,4.4vw,72px)] [font-variation-settings:'wght'_900,'wdth'_70]">
              Four projects. <span className="outline-text">No whispering.</span>
            </h2>
          </div>
          <p className="meta hidden text-ink/60 lg:block">Scroll → / Hover a poster to look underneath</p>
        </header>

        <div ref={trackRef} className="flex flex-col gap-20 lg:min-h-0 lg:flex-1 lg:flex-row lg:gap-10">
          {PROJECTS.map((p) => (
            <Panel key={p.id} project={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
