import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useLadders } from '@/data/ladders';
import { TIERS, tierToneVar } from '@/lib/tiers';
import { Header } from '@/components/primitives/Header';
import { Eyebrow } from '@/components/primitives/Eyebrow';
import type { Ladder } from '@/types';

type Section = { key: string; label: string; tone: string; ladders: Ladder[] };

export default function Ladders() {
  const ladders = useLadders();

  const sections = useMemo<Section[]>(() => {
    const ratingByTier = new Map<number, Ladder[]>();
    const division: Ladder[] = [];
    for (const l of ladders) {
      if (l.kind === 'division') {
        division.push(l);
      } else {
        const arr = ratingByTier.get(l.tier) ?? [];
        arr.push(l);
        ratingByTier.set(l.tier, arr);
      }
    }
    const out: Section[] = [];
    for (let i = 0; i < TIERS.length; i++) {
      const arr = ratingByTier.get(i);
      if (!arr || arr.length === 0) continue;
      out.push({
        key: `tier-${i}`,
        label: TIERS[i].label,
        tone: `var(${TIERS[i].toneVar})`,
        ladders: arr,
      });
    }
    if (division.length) {
      out.push({
        key: 'division',
        label: 'Codeforces Division 2',
        tone: 'var(--ed-fg-mute)',
        ladders: division,
      });
    }
    return out;
  }, [ladders]);

  return (
    <div style={{ padding: 'var(--ed-screen-pad)' }}>
      <Header
        eyebrow="Sequence"
        title="Ladders."
        subtitle="Tier-by-tier walks through 800–2300+."
      />

      {sections.map((section, sIdx) => (
        <div
          key={section.key}
          style={{ marginBottom: sIdx === sections.length - 1 ? 0 : 32 }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 14,
              marginBottom: 14,
            }}
          >
            <Eyebrow style={{ color: section.tone, marginBottom: 0 }}>
              {section.label}
            </Eyebrow>
            <span
              style={{
                fontFamily: "'Geist Mono', ui-monospace, monospace",
                fontSize: 10,
                color: 'var(--ed-fg-faint)',
                letterSpacing: 0.3,
              }}
            >
              {section.ladders.length} ladder
              {section.ladders.length === 1 ? '' : 's'}
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16,
            }}
          >
            {section.ladders.map((ladder) => {
          const tone = tierToneVar(ladder.tier);
          const pct = ladder.solved / ladder.total;
          const locked = ladder.solved === 0 && ladder.tier > 3;
          const done = ladder.solved === ladder.total;
          const active = ladder.solved > 0 && ladder.solved < ladder.total;
          const isExtra = ladder.extra ?? false;
          const cleanLabel = ladder.label.replace(/\s*\(Extra\)\s*$/, '');

          const tierNumeral = (ladder.tier + 1).toString().padStart(2, '0');

          return (
            <Link
              key={ladder.id}
              to={`/ladders/${ladder.id}`}
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <div
                className="ed-card"
                style={{
                  background: 'var(--ed-bg-1)',
                  border: '1px solid var(--ed-line)',
                  borderRadius: 12,
                  padding: '14px 16px',
                  cursor: locked ? 'not-allowed' : 'pointer',
                  opacity: locked ? 0.4 : 1,
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: 'var(--ed-glow)',
                }}
              >
                {/* Tier-tinted radial glow */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 140,
                    height: 140,
                    backgroundImage: `radial-gradient(circle at top right, color-mix(in oklab, ${tone} 14%, transparent), transparent 65%)`,
                    pointerEvents: 'none',
                  }}
                />

                {/* Status pill — top right */}
                <div
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 14,
                    display: 'flex',
                    gap: 6,
                  }}
                >
                  {isExtra && (
                    <span
                      title="Bonus deck — 200 additional problems for the same tier"
                      style={{
                        fontFamily: "'Geist Mono', ui-monospace, monospace",
                        fontSize: 9.5,
                        padding: '3px 9px',
                        background: 'transparent',
                        color: 'var(--ed-fg-mute)',
                        border: '1px dashed var(--ed-line)',
                        borderRadius: 999,
                        letterSpacing: 0.6,
                        textTransform: 'uppercase',
                      }}
                    >
                      bonus
                    </span>
                  )}
                  {done && (
                    <span
                      style={{
                        fontFamily: "'Geist Mono', ui-monospace, monospace",
                        fontSize: 9.5,
                        padding: '3px 9px',
                        background: `color-mix(in oklab, var(--ed-ok) 18%, transparent)`,
                        color: 'var(--ed-ok)',
                        borderRadius: 999,
                        letterSpacing: 0.6,
                        fontWeight: 500,
                      }}
                    >
                      complete
                    </span>
                  )}
                  {active && (
                    <span
                      style={{
                        fontFamily: "'Geist Mono', ui-monospace, monospace",
                        fontSize: 9.5,
                        padding: '3px 9px',
                        background: `color-mix(in oklab, ${tone} 16%, transparent)`,
                        color: tone,
                        borderRadius: 999,
                        letterSpacing: 0.6,
                        fontWeight: 500,
                      }}
                    >
                      active
                    </span>
                  )}
                  {locked && (
                    <span
                      style={{
                        fontFamily: "'Geist Mono', ui-monospace, monospace",
                        fontSize: 9.5,
                        padding: '3px 9px',
                        background: 'transparent',
                        color: 'var(--ed-fg-faint)',
                        border: '1px solid var(--ed-line)',
                        borderRadius: 999,
                        letterSpacing: 0.6,
                      }}
                    >
                      locked
                    </span>
                  )}
                </div>

                {/* Card body: numeral + info */}
                <div
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 14,
                  }}
                >
                  {/* Tier numeral */}
                  <div style={{ flexShrink: 0, width: 48, textAlign: 'left' }}>
                    <div
                      style={{
                        fontFamily: "'Geist Mono', ui-monospace, monospace",
                        fontWeight: 200,
                        fontSize: 44,
                        color: tone,
                        letterSpacing: -2,
                        lineHeight: 0.85,
                        fontFeatureSettings: '"tnum", "zero"',
                      }}
                    >
                      {tierNumeral}
                    </div>
                  </div>

                  {/* Label + range + progress */}
                  <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
                    <div
                      style={{
                        fontFamily: "'Geist', system-ui, sans-serif",
                        fontSize: 14,
                        fontWeight: 500,
                        letterSpacing: -0.3,
                        marginBottom: 2,
                        color: 'var(--ed-fg)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {cleanLabel}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Geist Mono', ui-monospace, monospace",
                        fontSize: 10,
                        color: 'var(--ed-fg-mute)',
                        letterSpacing: 0.2,
                        marginBottom: 12,
                      }}
                    >
                      {ladder.range}
                      {isExtra && (
                        <span style={{ color: 'var(--ed-fg-faint)' }}> · 200 bonus</span>
                      )}
                    </div>

                    {/* Progress bar + count */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                      }}
                    >
                      <div
                        className="ed-fill"
                        style={{
                          flex: 1,
                          height: 2,
                          background: 'var(--ed-bg-2)',
                          borderRadius: 2,
                          overflow: 'hidden',
                        }}
                      >
                        <i
                          style={{
                            width: `${pct * 100}%`,
                            background: tone,
                            opacity: 0.85,
                            display: 'block',
                            height: '100%',
                            transformOrigin: 'left',
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontFamily: "'Geist Mono', ui-monospace, monospace",
                          fontSize: 10,
                          color: 'var(--ed-fg-dim)',
                          letterSpacing: 0.2,
                          minWidth: 44,
                          textAlign: 'right',
                          fontFeatureSettings: '"tnum"',
                        }}
                      >
                        {ladder.solved}
                        <span style={{ color: 'var(--ed-fg-faint)' }}>
                          /{ladder.total}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
          </div>
        </div>
      ))}
    </div>
  );
}
