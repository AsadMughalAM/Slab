"use client";

import { useEffect, useRef } from "react";

import { useFinePointer, useReducedMotion } from "@/lib/motion";

/**
 * A square cursor drawn in difference mode, so it inverts whatever it crosses:
 * black on paper, paper on black, violet on lime. Over anything carrying a
 * `data-cursor` label it opens into a labelled block; over links and buttons
 * it grows into a frame.
 */
export default function Cursor() {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const boxRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!fine) return;
    const box = boxRef.current;
    const label = labelRef.current;
    if (!box || !label) return;
    document.documentElement.classList.add("has-cursor");

    let x = -100;
    let y = -100;
    let cx = x;
    let cy = y;
    let size = 14;
    let targetSize = 14;
    let visible = false;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      if (!visible) {
        visible = true;
        cx = x;
        cy = y;
        box.style.opacity = "1";
      }
      const el = e.target instanceof Element ? e.target : null;
      const labelled = el?.closest<HTMLElement>("[data-cursor]");
      const interactive = el?.closest("a, button, [role='switch'], input, label");
      if (labelled) {
        label.textContent = labelled.dataset.cursor ?? "";
        label.style.opacity = "1";
        targetSize = 0;
      } else {
        label.style.opacity = "0";
        targetSize = interactive ? 44 : 14;
      }
    };
    const onLeave = (e: MouseEvent) => {
      if (!e.relatedTarget) {
        visible = false;
        box.style.opacity = "0";
        label.style.opacity = "0";
      }
    };
    const onDown = () => (targetSize *= 0.7);
    const onUp = () => (targetSize /= 0.7);

    const tick = () => {
      const follow = reduced ? 1 : 0.32;
      cx += (x - cx) * follow;
      cy += (y - cy) * follow;
      size += (targetSize - size) * 0.25;
      box.style.transform = `translate3d(${cx - size / 2}px, ${cy - size / 2}px, 0)`;
      box.style.width = box.style.height = `${size}px`;
      label.style.transform = `translate3d(${x + 14}px, ${y + 14}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("mouseout", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("mouseout", onLeave);
    };
  }, [fine, reduced]);

  if (!fine) return null;

  return (
    <>
      {/* The box is its own top-level layer: a z-indexed wrapper would isolate the
          blend, turning the inverting cursor into an opaque white square over text. */}
      <div
        ref={boxRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] bg-white opacity-0 mix-blend-difference"
        style={{ width: 14, height: 14 }}
      />
      <div
        ref={labelRef}
        aria-hidden
        className="meta pointer-events-none fixed left-0 top-0 z-[101] whitespace-nowrap border-2 border-ink bg-lime px-2 py-1 text-ink opacity-0 transition-opacity duration-200"
      />
    </>
  );
}
