"use client";

import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Edges } from "@react-three/drei";

export type PieceInfo = { id: string; label: string; spec: string };

type SculptureProps = {
  /** 0..1 progress of the hero scrolling away (written by GSAP). */
  scrollRef: MutableRefObject<number>;
  /** Normalised pointer, -1..1 on both axes, relative to the viewport. */
  pointerRef: MutableRefObject<{ x: number; y: number }>;
  active: boolean;
  reducedMotion: boolean;
  compact: boolean;
  onHover: (piece: PieceInfo | null) => void;
};

const INK = "#111111";
const PAPER = "#f4f1e8";
const LIME = "#d7ff35";
const COBALT = "#304ffe";
const SIGNAL = "#ff5a1f";

const GAP = 0.09;

type Block = {
  index: number;
  /** Centre of the slab, cube centred on the origin (cube spans -1.5..1.5). */
  center: THREE.Vector3;
  /** Slab size in cube units, before the saw-cut gap. */
  dims: [number, number, number];
  color: string;
  /** Outward direction from the cube's centre. */
  out: THREE.Vector3;
  /** Entrance order: lower slabs land first. */
  order: number;
};

/**
 * A 3×3×3 block of concrete sawn into ten irregular slabs: bars, plates and
 * single blocks. Each entry is [min corner, max corner] in grid units (0..3).
 * Accents sit on the faces the camera sees (+x, +y, +z).
 */
const CUTS: { min: [number, number, number]; max: [number, number, number]; color: string }[] = [
  { min: [0, 0, 0], max: [3, 1, 2], color: PAPER },  // base plate
  { min: [0, 0, 2], max: [3, 1, 3], color: SIGNAL }, // front base bar
  { min: [0, 1, 0], max: [1, 2, 3], color: PAPER },  // left bar, front to back
  { min: [1, 1, 0], max: [3, 2, 1], color: PAPER },  // back bar
  { min: [1, 1, 1], max: [2, 2, 3], color: PAPER },  // middle block
  { min: [2, 1, 1], max: [3, 2, 3], color: COBALT }, // right block
  { min: [0, 2, 0], max: [2, 3, 2], color: PAPER },  // top plate
  { min: [2, 2, 0], max: [3, 3, 3], color: PAPER },  // top right bar
  { min: [0, 2, 2], max: [1, 3, 3], color: LIME },   // top front corner
  { min: [1, 2, 2], max: [2, 3, 3], color: INK },    // top front block
];

function buildBlocks(): Block[] {
  return CUTS.map((c, index) => {
    const dims: [number, number, number] = [c.max[0] - c.min[0], c.max[1] - c.min[1], c.max[2] - c.min[2]];
    const center = new THREE.Vector3(
      (c.min[0] + c.max[0]) / 2 - 1.5,
      (c.min[1] + c.max[1]) / 2 - 1.5,
      (c.min[2] + c.max[2]) / 2 - 1.5,
    );
    return { index, center, dims, color: c.color, out: center.clone().normalize(), order: c.min[1] * 4 + index * 0.4 };
  });
}

/** Three hard steps of light: the cube reads like a print, not a render. */
function useToonGradient() {
  return useMemo(() => {
    const data = new Uint8Array([90, 90, 90, 255, 185, 185, 185, 255, 255, 255, 255, 255]);
    const t = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
    t.minFilter = THREE.NearestFilter;
    t.magFilter = THREE.NearestFilter;
    t.generateMipmaps = false;
    t.needsUpdate = true;
    return t;
  }, []);
}

function Cube({ scrollRef, pointerRef, reducedMotion, compact, onHover }: Omit<SculptureProps, "active">) {
  const gradient = useToonGradient();
  const blocks = useMemo(buildBlocks, []);
  const rootRef = useRef<THREE.Group>(null);
  const shadowRootRef = useRef<THREE.Group>(null);
  const blockRefs = useRef<(THREE.Group | null)[]>([]);
  const shadowRefs = useRef<(THREE.Group | null)[]>([]);
  const hovered = useRef<number | null>(null);
  const broken = useRef<Set<number>>(new Set());
  const push = useRef<Float32Array>(new Float32Array(16));
  const turn = useRef<Float32Array>(new Float32Array(16));
  const startTime = useRef<number | null>(null);

  const geometries = useMemo(
    () => blocks.map((b) => new THREE.BoxGeometry(b.dims[0] - GAP, b.dims[1] - GAP, b.dims[2] - GAP)),
    [blocks],
  );
  const materials = useMemo(
    () => blocks.map((b) => new THREE.MeshToonMaterial({ color: b.color, gradientMap: gradient })),
    [blocks, gradient],
  );
  const shadowMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: INK }), []);
  const baseColors = useMemo(() => blocks.map((b) => new THREE.Color(b.color)), [blocks]);
  const hoverLime = useMemo(() => new THREE.Color(LIME), []);
  const hoverSignal = useMemo(() => new THREE.Color(SIGNAL), []);

  useEffect(
    () => () => {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      shadowMaterial.dispose();
      gradient.dispose();
    },
    [geometries, materials, shadowMaterial, gradient],
  );

  const tmp = useMemo(
    () => ({ right: new THREE.Vector3(), up: new THREE.Vector3(), back: new THREE.Vector3(), e: new THREE.Euler() }),
    [],
  );

  const describe = (i: number): PieceInfo => {
    const count = broken.current.size;
    const isBroken = broken.current.has(i);
    const [w, h, d] = blocks[i].dims;
    return {
      id: String(i),
      label: `Slab ${String(i + 1).padStart(2, "0")} / ${blocks.length} · ${w} × ${h} × ${d}`,
      spec: `${isBroken ? "Click to put it back" : "Click to break it out"} · ${count} broken`,
    };
  };

  useFrame((state, rawDelta) => {
    const root = rootRef.current;
    const shadowRoot = shadowRootRef.current;
    if (!root || !shadowRoot) return;
    const dt = Math.min(rawDelta, 1 / 20);
    const t = state.clock.elapsedTime;
    if (startTime.current === null) startTime.current = t;
    const since = t - startTime.current;
    const p = scrollRef.current;
    const ptr = pointerRef.current;
    const k = 1 - Math.exp(-dt * 4);

    // The cube only tilts toward the cursor: no free spin, so it stays in its column.
    const sway = reducedMotion ? 0 : Math.sin(t * 0.35) * 0.06;
    const ry = ptr.x * 0.38 + sway + p * 0.9;
    const rx = -ptr.y * 0.22 + p * 0.25;
    root.rotation.y += (ry - root.rotation.y) * k;
    root.rotation.x += (rx - root.rotation.x) * k;
    root.scale.setScalar(compact ? 0.86 : 1);

    const h = hovered.current;
    blocks.forEach((b, i) => {
      const g = blockRefs.current[i];
      const s = shadowRefs.current[i];
      if (!g || !s) return;

      // Entrance: slabs drop in, lowest first, like stacking concrete.
      const enter = reducedMotion ? 1 : Math.min(Math.max((since - 0.2 - b.order * 0.07) / 0.75, 0), 1);
      const e = 1 - Math.pow(1 - enter, 3);

      // Hover pushes the slab out; slabs touching it shift a little in sympathy.
      let target = 0;
      if (h !== null) {
        const d = blocks[h].center.distanceTo(b.center);
        target = h === i ? 0.34 : d < 1.6 ? 0.07 : 0;
      }
      if (broken.current.has(i)) target = 0.9;
      push.current[i] += (target - push.current[i]) * (1 - Math.exp(-dt * 10));
      const turnTarget = broken.current.has(i) ? 0.35 : 0;
      turn.current[i] += (turnTarget - turn.current[i]) * (1 - Math.exp(-dt * 6));

      const dir = b.out;
      const travel = push.current[i] + p * 2.2;
      g.position.set(
        b.center.x + dir.x * travel,
        b.center.y + dir.y * travel + (1 - e) * 5,
        b.center.z + dir.z * travel,
      );
      tmp.e.set(p * dir.z * 1.1 + turn.current[i] * 0.4, p * dir.x * 1.3 + turn.current[i], p * dir.y * 0.7 - turn.current[i] * 0.3);
      g.quaternion.setFromEuler(tmp.e);
      g.scale.setScalar(Math.max(e, 0.0001));

      const goal = h === i ? (b.color === LIME ? hoverSignal : hoverLime) : baseColors[i];
      materials[i].color.lerp(goal, 0.2);

      s.position.copy(g.position);
      s.quaternion.copy(g.quaternion);
      s.scale.copy(g.scale);
    });

    // Flat shadow: offset down-right in screen space and pushed behind.
    const cam = state.camera as THREE.OrthographicCamera;
    tmp.right.setFromMatrixColumn(cam.matrixWorld, 0);
    tmp.up.setFromMatrixColumn(cam.matrixWorld, 1);
    tmp.back.setFromMatrixColumn(cam.matrixWorld, 2);
    const off = 0.16;
    shadowRoot.rotation.copy(root.rotation);
    shadowRoot.scale.copy(root.scale);
    shadowRoot.position
      .copy(root.position)
      .addScaledVector(tmp.right, off)
      .addScaledVector(tmp.up, -off)
      .addScaledVector(tmp.back, -8);

    // Fit the block (with room for hover and broken slabs) to the canvas.
    const zoom = Math.min(state.size.width, state.size.height) / 6.3;
    if (Math.abs(cam.zoom - zoom) > 0.01) {
      cam.zoom = zoom;
      cam.updateProjectionMatrix();
    }
  });

  const onMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const i = e.object.userData.index as number;
    if (hovered.current !== i) {
      hovered.current = i;
      onHover(describe(i));
    }
  };
  const onOut = (e: ThreeEvent<PointerEvent>) => {
    if (hovered.current === (e.object.userData.index as number)) {
      hovered.current = null;
      onHover(null);
    }
  };
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const i = e.object.userData.index as number;
    if (broken.current.has(i)) broken.current.delete(i);
    else broken.current.add(i);
    onHover(describe(i));
  };

  return (
    <>
      <group ref={shadowRootRef}>
        {blocks.map((b, i) => (
          <group key={b.index} ref={(el) => void (shadowRefs.current[i] = el)}>
            <mesh geometry={geometries[i]} material={shadowMaterial} />
          </group>
        ))}
      </group>
      <group ref={rootRef}>
        {blocks.map((b, i) => (
          <group key={b.index} ref={(el) => void (blockRefs.current[i] = el)} scale={0.0001}>
            <mesh
              geometry={geometries[i]}
              material={materials[i]}
              userData={{ index: i }}
              onPointerMove={onMove}
              onPointerOut={onOut}
              onClick={onClick}
            >
              <Edges threshold={15} lineWidth={compact ? 1.3 : 1.8} color={b.color === INK ? PAPER : INK} />
            </mesh>
          </group>
        ))}
      </group>
    </>
  );
}

export default function Sculpture(props: SculptureProps) {
  const { active, compact } = props;
  return (
    <Canvas
      orthographic
      flat
      frameloop={active ? "always" : "never"}
      dpr={compact ? [1, 1.5] : [1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [6, 5, 8], zoom: 100, near: 0.1, far: 100 }}
      onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={1.25} />
      <directionalLight position={[-3, 8, 5]} intensity={2.1} />
      <Cube {...props} />
    </Canvas>
  );
}
