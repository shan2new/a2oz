// Ported from reference/variations/editorial.jsx (useCountUp, line 94).
// rAF-driven count-up with easeOutCubic.
//
// useCountUp(target, ms?)            — runs on mount + whenever target/ms change.
// useCount(target, ms, start)        — same, but only ticks when start === true.
//                                      Resets to 0 whenever start flips back to true.

import { useEffect, useState } from 'react';

export function useCountUp(target: number, ms: number = 900): number {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf: number;
    let t0: number | undefined;
    const tick = (t: number) => {
      if (!t0) t0 = t;
      const p = Math.min(1, (t - t0) / ms);
      const e = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setV(Math.round(target * e));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

export function useCount(target: number, ms: number, start: boolean): number {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!start) {
      setV(0);
      return;
    }
    let raf: number;
    let t0: number | undefined;
    const tick = (t: number) => {
      if (!t0) t0 = t;
      const p = Math.min(1, (t - t0) / ms);
      const e = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setV(Math.round(target * e));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms, start]);
  return v;
}
