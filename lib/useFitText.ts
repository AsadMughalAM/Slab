"use client";

import { useLayoutEffect, type RefObject } from "react";

/**
 * Sizes `el`'s font so its text exactly spans `fraction` of its container's
 * width, capped at `maxVh` of the viewport height. Measured, not guessed, so
 * line lengths stay architectural whatever the font metrics.
 *
 * `measureAs` forces font-variation-settings while measuring: use it when the
 * element animates its width axis, so it fits at its widest state.
 */
export function useFitText(
  el: RefObject<HTMLElement | null>,
  fraction = 1,
  maxVh = 40,
  maxPx = 520,
  measureAs?: string,
) {
  useLayoutEffect(() => {
    const node = el.current;
    const container = node?.parentElement;
    if (!node || !container) return;

    const fit = () => {
      const previous = node.style.fontVariationSettings;
      if (measureAs) node.style.fontVariationSettings = measureAs;
      node.style.fontSize = "100px";
      const natural = node.scrollWidth;
      if (measureAs) node.style.fontVariationSettings = previous;
      if (!natural) return;
      const width = container.clientWidth * fraction;
      const size = Math.min((100 * width) / natural, (window.innerHeight * maxVh) / 100, maxPx);
      node.style.fontSize = `${size}px`;
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(container);
    // Re-fit once the webfont has loaded.
    document.fonts?.ready.then(fit).catch(() => {});
    window.addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [el, fraction, maxVh, maxPx, measureAs]);
}
