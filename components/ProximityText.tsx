"use client";

import { useEffect, useRef, type CSSProperties, type ElementType } from "react";

import { useFinePointer, useReducedMotion } from "@/lib/motion";

type Axis = { wght: number; wdth: number };

type ProximityTextProps = {
  text: string;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  /** Axis values far from the cursor. */
  rest: Axis;
  /** Axis values directly under the cursor. */
  near: Axis;
  /** Influence radius in px. */
  radius?: number;
};

/**
 * Variable-font letters that respond to cursor proximity: as the pointer
 * passes, the word erodes (or swells) letter by letter and slowly recovers.
 * Reads all positions first, then writes all styles, so each frame costs one layout.
 */
export default function ProximityText({
  text,
  as: Tag = "span",
  className,
  style,
  rest,
  near,
  radius = 220,
}: ProximityTextProps) {
  const rootRef = useRef<HTMLElement>(null);
  const fine = useFinePointer();
  const reduced = useReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !fine || reduced) return;
    const letters = Array.from(root.querySelectorAll<HTMLSpanElement>("[data-letter]"));
    const influence = new Float32Array(letters.length);
    let px = -9999;
    let py = -9999;
    let raf = 0;
    let running = false;
    let inView = true;

    const io = new IntersectionObserver(([e]) => (inView = e.isIntersecting));
    io.observe(root);

    const tick = () => {
      // Read phase.
      const rects = letters.map((l) => l.getBoundingClientRect());
      let active = false;
      // Write phase.
      for (let i = 0; i < letters.length; i++) {
        const r = rects[i];
        const d = Math.hypot(r.left + r.width / 2 - px, r.top + r.height / 2 - py);
        const target = Math.max(0, 1 - d / radius);
        const eased = target * target * (3 - 2 * target);
        // Quick to react, slow to recover.
        const k = eased > influence[i] ? 0.28 : 0.06;
        influence[i] += (eased - influence[i]) * k;
        if (influence[i] > 0.002 || eased > 0) active = true;
        const t = influence[i];
        letters[i].style.fontVariationSettings = `"wght" ${(rest.wght + (near.wght - rest.wght) * t).toFixed(1)}, "wdth" ${(rest.wdth + (near.wdth - rest.wdth) * t).toFixed(1)}`;
      }
      if (active) {
        raf = requestAnimationFrame(tick);
      } else {
        running = false;
      }
    };

    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      if (!running && inView) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      letters.forEach((l) => (l.style.fontVariationSettings = ""));
    };
  }, [fine, reduced, radius, rest.wght, rest.wdth, near.wght, near.wdth]);

  const restStyle = { fontVariationSettings: `"wght" ${rest.wght}, "wdth" ${rest.wdth}` };

  return (
    <Tag ref={rootRef} className={className} style={style} aria-label={text}>
      {Array.from(text).map((ch, i) => (
        <span key={i} data-letter aria-hidden className="inline-block" style={restStyle}>
          {ch === " " ? " " : ch}
        </span>
      ))}
    </Tag>
  );
}
