// Sparkline — SVG 56×16 path that draws in via stroke-dashoffset.
// Props: points (7 numbers), tone (CSS color string, defaults to var(--ed-r-teal)).

import { useEffect, useRef } from 'react';

interface SparklineProps {
  points: number[];
  tone?: string;
}

export function Sparkline({ points, tone = 'var(--ed-r-teal)' }: SparklineProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const W = 56;
  const H = 16;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const norm = (v: number) => (max === min ? 0.5 : (v - min) / (max - min));

  const d = points
    .map((v, i) => {
      const x = (i / (points.length - 1)) * W;
      const y = H - norm(v) * H;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  const lastY = H - norm(points[points.length - 1]) * H;

  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;
    // Read the real path length and apply the dasharray + initial dashoffset.
    const len = el.getTotalLength();
    el.style.strokeDasharray = String(len);
    el.style.strokeDashoffset = String(len);
    // Force a reflow so the browser registers the starting value, then
    // set the dashoffset to 0 — the CSS transition defined inline drives it.
    void el.getBoundingClientRect();
    el.style.strokeDashoffset = '0';
  }, [d]);

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <path
        ref={pathRef}
        d={d}
        fill="none"
        stroke={tone}
        strokeWidth="1.25"
        strokeOpacity="0.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(.2,.7,.2,1)' }}
      />
      <circle cx={W} cy={lastY} r="2" fill={tone} />
    </svg>
  );
}
