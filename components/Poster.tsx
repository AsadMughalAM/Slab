import type { Project } from "@/lib/content";

type Palette = { bg: string; a: string; b: string; c: string };

const NORMAL: Palette = { bg: "#f4f1e8", a: "#111111", b: "#d7ff35", c: "#304ffe" };
const INVERTED: Palette = { bg: "#111111", a: "#f4f1e8", b: "#ff5a1f", c: "#d7ff35" };

/**
 * Generative poster per project. Each `<g data-depth>` layer drifts with the
 * cursor by its own depth (via CSS vars set by the parent), giving parallax.
 */
export default function Poster({ kind, inverted = false }: { kind: Project["poster"]; inverted?: boolean }) {
  const p = inverted ? INVERTED : NORMAL;
  const layer = (depth: number) => ({
    style: {
      transform: `translate(calc((var(--mx, 0.5) - 0.5) * ${depth}px), calc((var(--my, 0.5) - 0.5) * ${depth}px))`,
      transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
    },
  });

  return (
    <svg viewBox="0 0 400 500" className="block h-full w-full" aria-hidden preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="500" fill={p.bg} />

      {kind === "kiln" && (
        <>
          <g {...layer(-14)}>
            <path d="M40 470 A160 160 0 0 1 360 470 Z" fill="#ff5a1f" />
          </g>
          <g {...layer(22)}>
            <rect x="40" y="70" width="40" height="300" fill={p.a} />
            <rect x="110" y="120" width="40" height="250" fill={p.a} />
            <rect x="180" y="40" width="40" height="330" fill={p.a} />
          </g>
          <g {...layer(36)}>
            <rect x="250" y="160" width="110" height="110" fill={p.b} stroke={p.a} strokeWidth="6" />
          </g>
          <text x="40" y="34" fontFamily="monospace" fontSize="13" fill={p.a}>KILN / FIRED IDENTITY</text>
        </>
      )}

      {kind === "volt" && (
        <>
          <g {...layer(-18)}>
            <rect x="60" y="250" width="280" height="200" fill={p.c} />
          </g>
          <g {...layer(26)}>
            <path d="M0 500 L400 0 L400 90 L72 500 Z" fill={p.b} stroke={p.a} strokeWidth="6" />
          </g>
          <g {...layer(40)}>
            <text x="34" y="200" fontFamily="var(--font-archivo), sans-serif" fontWeight="900" fontSize="210" fill={p.a} style={{ fontVariationSettings: '"wdth" 125' }}>
              V
            </text>
          </g>
          <text x="40" y="34" fontFamily="monospace" fontSize="13" fill={p.a}>VOLT / LAUNCH 2025</text>
        </>
      )}

      {kind === "archiv" && (
        <>
          <g {...layer(-10)}>
            {Array.from({ length: 5 }).map((_, r) =>
              Array.from({ length: 4 }).map((_, c) => (
                <rect
                  key={`${r}-${c}`}
                  x={40 + c * 82}
                  y={70 + r * 82}
                  width="70"
                  height="70"
                  fill={r === 2 && c === 1 ? p.c : r === 4 && c === 3 ? p.b : "none"}
                  stroke={p.a}
                  strokeWidth="5"
                />
              )),
            )}
          </g>
          <g {...layer(30)}>
            <rect x="204" y="152" width="152" height="152" fill={p.a} />
          </g>
          <text x="40" y="34" fontFamily="monospace" fontSize="13" fill={p.a}>ARCHIV / MUSEUM OF FORM</text>
        </>
      )}

      {kind === "wave" && (
        <>
          {Array.from({ length: 9 }).map((_, i) => (
            <g key={i} {...layer((i - 4) * 9)}>
              <path
                d={`M0 ${120 + i * 38} C 80 ${60 + i * 38}, 160 ${180 + i * 38}, 240 ${120 + i * 38} S 360 ${70 + i * 38}, 400 ${120 + i * 38}`}
                fill="none"
                stroke={i === 4 ? p.b : p.a}
                strokeWidth={i === 4 ? 16 : 6}
              />
            </g>
          ))}
          <text x="40" y="34" fontFamily="monospace" fontSize="13" fill={p.a}>NORTHWAVE / 3 NIGHTS</text>
        </>
      )}
    </svg>
  );
}
