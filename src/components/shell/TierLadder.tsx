// TierLadder — vertical "dots on a thread" visualization.
// 7 tiers rendered as small circles connected by a 1px vertical line.
// Current tier has a 4px outer glow and is filled with tone.
// Past tiers are dim-filled; future tiers are hollow.

import { TIERS, tierIndexForRating } from '@/lib/tiers';

const GMONO = "'Geist Mono', ui-monospace, monospace";
const GEIST = "'Geist', system-ui, sans-serif";

interface TierLadderProps {
  rating: number;
}

export function TierLadder({ rating }: TierLadderProps) {
  const curIdx = tierIndexForRating(rating);

  return (
    <div style={{ marginTop: 26, padding: '0 4px' }}>
      {/* Section eyebrow */}
      <div
        style={{
          fontFamily: GMONO,
          fontSize: 9.5,
          color: 'var(--ed-fg-faint)',
          letterSpacing: 1.8,
          textTransform: 'uppercase',
          marginBottom: 14,
          paddingLeft: 6,
        }}
      >
        The climb
      </div>

      {/* Dots + thread */}
      <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Vertical connecting thread */}
        <span
          style={{
            position: 'absolute',
            left: 9.5,
            top: 8,
            bottom: 8,
            width: 1,
            background: 'var(--ed-fg-faint)',
          }}
        />

        {TIERS.map((tier, i) => {
          const passed = i < curIdx;
          const here = i === curIdx;
          const toneVar = `var(${tier.toneVar})`;

          return (
            <div
              key={tier.key}
              style={{
                display: 'grid',
                gridTemplateColumns: '20px 1fr auto',
                alignItems: 'center',
                gap: 10,
                padding: '6px 6px',
                position: 'relative',
              }}
            >
              {/* Dot */}
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: here ? toneVar : passed ? toneVar : 'var(--ed-bg-0)',
                  border: `1.5px solid ${passed || here ? toneVar : 'var(--ed-fg-faint)'}`,
                  marginLeft: 5,
                  opacity: passed ? 0.5 : 1,
                  boxShadow: here
                    ? `0 0 0 4px color-mix(in oklab, ${toneVar} 18%, transparent)`
                    : 'none',
                  transition: 'box-shadow .2s ease',
                }}
              />

              {/* Tier name */}
              <span
                style={{
                  fontFamily: GEIST,
                  fontSize: 12,
                  color: here
                    ? 'var(--ed-fg)'
                    : passed
                    ? 'var(--ed-fg-dim)'
                    : 'var(--ed-fg-faint)',
                  fontWeight: here ? 500 : 400,
                  textTransform: 'capitalize',
                  letterSpacing: -0.1,
                }}
              >
                {tier.key === 'cm' ? 'cand. master' : tier.key === 'gm' ? 'grandmaster' : tier.key}
              </span>

              {/* Rating range label — only for current tier */}
              {here && (
                <span
                  style={{
                    fontFamily: GMONO,
                    fontSize: 9.5,
                    color: toneVar,
                    letterSpacing: 0.1,
                  }}
                >
                  {tier.max === 9999 ? `${tier.min}+` : tier.min}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
