import React, { useState, useRef, useEffect } from 'react';
import type { Problem } from '@/types';
import { ratingTone } from '@/lib/ratingTone';
import { ConfettiBurst } from '@/components/primitives/ConfettiBurst';
import { useUserStore } from '@/store/userStore';

type ProblemRowProps = { problem: Problem; index: number };

export function ProblemRow({ problem, index }: ProblemRowProps) {
  const solvedIds = useUserStore((s) => s.solvedIds);
  const initialSolved =
    problem.status === 'solved' || solvedIds.includes(problem.id);

  const [solved, setSolved] = useState(initialSolved);
  const [justSolved, setJustSolved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tone = ratingTone(problem.rating);

  // Sync external store changes (e.g. another component unmarks)
  useEffect(() => {
    const storeHas = useUserStore.getState().solvedIds.includes(problem.id);
    setSolved(storeHas || problem.status === 'solved');
  }, [solvedIds, problem.id, problem.status]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, []);

  function handleToggle(e: React.MouseEvent) {
    e.stopPropagation();
    if (solved) {
      // Unmark
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      setSolved(false);
      setJustSolved(false);
      useUserStore.getState().unmarkSolved(problem.id);
    } else {
      // Mark solved
      setSolved(true);
      setJustSolved(true);
      useUserStore.getState().markSolved(problem.id);
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setJustSolved(false);
        timerRef.current = null;
      }, 950);
    }
  }

  const indexLabel = (index + 1).toString().padStart(2, '0');
  const solversDisplay =
    problem.solvers > 1000
      ? `${(problem.solvers / 1000).toFixed(1)}k`
      : problem.solvers.toString();

  return (
    <div
      className={'ed-row' + (justSolved ? ' ed-row-glow' : '')}
      style={
        {
          display: 'grid',
          gridTemplateColumns: '32px 28px 80px 1fr 220px 80px 64px',
          padding: 'var(--ed-row-pad)',
          borderRadius: 8,
          gap: 14,
          alignItems: 'center',
          fontSize: 13.5,
          cursor: 'pointer',
          position: 'relative',
          '--glow': tone,
        } as React.CSSProperties & { '--glow': string }
      }
    >
      {/* Col 1: Index */}
      <span
        style={{
          fontFamily: "'DM Mono', ui-monospace, monospace",
          fontSize: 10.5,
          color: 'var(--ed-fg-faint)',
          letterSpacing: 0.3,
        }}
      >
        {indexLabel}
      </span>

      {/* Col 2: Solve checkbox */}
      <span
        onClick={handleToggle}
        className={justSolved ? 'ed-box-pop' : ''}
        style={{
          width: 18,
          height: 18,
          borderRadius: 5,
          position: 'relative',
          border: `1.5px solid ${
            solved
              ? 'var(--ed-ok)'
              : problem.status === 'attempted'
              ? 'var(--ed-warn)'
              : 'var(--ed-fg-faint)'
          }`,
          background: solved ? 'var(--ed-ok)' : 'transparent',
          display: 'grid',
          placeItems: 'center',
          color: '#0e0f12',
          fontSize: 11,
          transition: 'background 0.2s ease, border-color 0.2s ease',
          cursor: 'pointer',
          flexShrink: 0,
        }}
        role="checkbox"
        aria-checked={solved}
        aria-label={`Mark ${problem.name} as solved`}
      >
        {solved && (
          <svg
            className={justSolved ? 'ed-check' : ''}
            width="11"
            height="11"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path
              d="M2.5 6.2 L5 8.6 L9.5 3.6"
              stroke="#0e0f12"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={14}
              strokeDashoffset={justSolved ? 14 : 0}
            />
          </svg>
        )}
        {!solved && problem.status === 'attempted' && (
          <span style={{ color: 'var(--ed-warn)', lineHeight: 1 }}>×</span>
        )}
        {justSolved && <ConfettiBurst tone={tone} />}
      </span>

      {/* Col 3: Problem ID */}
      <span
        style={{
          fontFamily: "'DM Mono', ui-monospace, monospace",
          fontSize: 11,
          color: 'var(--ed-fg-mute)',
          letterSpacing: 0.3,
        }}
      >
        {problem.id}
      </span>

      {/* Col 4: Problem name */}
      <span
        style={{
          color: solved ? 'var(--ed-fg-faint)' : 'var(--ed-fg)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontFamily: "'DM Sans', system-ui, sans-serif",
          fontSize: 13.5,
          fontWeight: solved ? 400 : 500,
          letterSpacing: -0.1,
          position: 'relative',
          display: 'inline-block',
          maxWidth: '100%',
          textDecoration: solved && !justSolved ? 'line-through' : 'none',
          textDecorationColor: 'var(--ed-fg-faint)',
        }}
      >
        <span className={justSolved ? 'ed-strike-anim' : ''}>{problem.name}</span>
      </span>

      {/* Col 5: Up to 2 tag chips */}
      <span style={{ display: 'flex', gap: 5, overflow: 'hidden' }}>
        {problem.tags.slice(0, 2).map((t) => (
          <span
            key={t}
            style={{
              color: 'var(--ed-fg-mute)',
              fontFamily: "'DM Mono', ui-monospace, monospace",
              fontSize: 10.5,
              padding: '2px 7px',
              borderRadius: 10,
              background: 'var(--ed-bg-2)',
              whiteSpace: 'nowrap',
              letterSpacing: 0.2,
            }}
          >
            {t}
          </span>
        ))}
      </span>

      {/* Col 6: Solver count */}
      <span
        style={{
          color: 'var(--ed-fg-faint)',
          fontFamily: "'DM Mono', ui-monospace, monospace",
          fontSize: 10.5,
          textAlign: 'right',
          fontFeatureSettings: '"tnum"',
        }}
      >
        {solversDisplay}
      </span>

      {/* Col 7: Rating */}
      <span
        style={{
          color: tone,
          fontFamily: "'DM Mono', ui-monospace, monospace",
          fontWeight: 500,
          textAlign: 'right',
          fontSize: 12.5,
          fontFeatureSettings: '"tnum", "zero"',
        }}
      >
        {problem.rating}
      </span>
    </div>
  );
}

export default ProblemRow;
