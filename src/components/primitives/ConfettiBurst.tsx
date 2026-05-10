import React, { useMemo } from 'react';

type ConfettiBurstProps = {
  /** CSS color value, e.g. 'var(--ed-r-teal)' or '#5fb3b3'. */
  tone: string;
  /** Number of shards. Defaults to 11 (matches the prototype's EConfettiBurst). */
  count?: number;
};

/**
 * Deterministic LCG (Linear Congruential Generator) — Numerical Recipes constants.
 *
 * The prototype's EConfettiBurst uses Math.random(), which is non-deterministic.
 * The plan spec says: "Port LCG from prototype" and "use seed 1337 if prototype
 * doesn't specify one." The prototype does NOT seed — it uses bare Math.random().
 * Therefore we use seed 1337 as documented in the spec, wrapped in useMemo([count])
 * so shard layout is stable across re-renders.
 *
 * LCG parameters (Numerical Recipes / glibc):
 *   a = 1664525, c = 1013904223, m = 2^32
 * Returns values in [0, 1).
 */
function makeLcg(seed: number) {
  let s = seed >>> 0; // ensure 32-bit unsigned
  return () => {
    s = Math.imul(1664525, s) + 1013904223;
    // Bring into [0, 1) by dividing by 2^32
    return (s >>> 0) / 4294967296;
  };
}

type Shard = {
  dx: number;
  dy: number;
  w: number;
  h: number;
  rot: number;
  delay: number;
};

/**
 * ConfettiBurst — celebratory shard burst used in the mark-as-solved choreography.
 *
 * Ported faithfully from EConfettiBurst in editorial-detail.jsx. Key differences:
 * - Math.random() replaced with a deterministic LCG seeded at 1337.
 * - Shards generated once per [count] change via useMemo (stable across re-renders).
 * - CSS vars --dx / --dy / --rot set inline per shard.
 * - Uses the .ed-confetti-piece class from index.css which applies position:absolute,
 *   left/top 50%, pointer-events:none, and the ed-confetti keyframe animation.
 * - animationDelay applied inline per shard (0–60ms range).
 * - Container: position:absolute, inset:0, pointer-events:none.
 *
 * The .ed-confetti-piece class in index.css already sets:
 *   position: absolute; left: 50%; top: 50%; pointer-events: none;
 *   will-change: transform, opacity;
 *   animation: ed-confetti .85s cubic-bezier(.2,.7,.2,1) forwards;
 * So we only need inline overrides for shard-specific values.
 */
export function ConfettiBurst({ tone, count = 11 }: ConfettiBurstProps) {
  const shards: Shard[] = useMemo(() => {
    // Seed: 1337 — chosen per spec (prototype uses Math.random() without a seed,
    // so we default to 1337 as documented in the Wave 1B agent instructions).
    const rand = makeLcg(1337);

    return Array.from({ length: count }, (_, i) => {
      // Radiate angle: -90° ± 80° (mostly upward), with gentle per-shard spread.
      // Mirrors prototype: angle = (-90 + (i - 5) * 16) + (rand() - 0.5) * 8
      const angle = (-90 + (i - 5) * 16) + (rand() - 0.5) * 8;
      // Distance: 28–50px (matches spec; prototype uses 28 + rand()*22).
      const dist = 28 + rand() * 22;
      const rad = (angle * Math.PI) / 180;
      const dx = Math.cos(rad) * dist;
      const dy = Math.sin(rad) * dist;
      // Width: 2–5px; height: 4–9px.
      const w = 2 + rand() * 3;
      const h = 4 + rand() * 5;
      // Rotation: ±110deg (prototype uses (rand()-0.5)*220).
      const rot = (rand() - 0.5) * 220;
      // Delay: 0–60ms per shard.
      const delay = rand() * 60;
      return { dx, dy, w, h, rot, delay };
    });
  }, [count]);

  return (
    <span
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      {shards.map((s, i) => (
        <span
          key={i}
          className="ed-confetti-piece"
          style={
            {
              width: s.w,
              height: s.h,
              background: tone,
              borderRadius: 1,
              '--dx': `${s.dx}px`,
              '--dy': `${s.dy}px`,
              '--rot': `${s.rot}deg`,
              animationDelay: `${s.delay}ms`,
            } as React.CSSProperties & Record<string, string | number>
          }
        />
      ))}
    </span>
  );
}

export default ConfettiBurst;
