import { Link } from 'react-router-dom';
import { useLadders } from '@/data/ladders';
import { TIERS } from '@/lib/tiers';
import { Header } from '@/components/primitives/Header';

// Map ladder tier index → CSS var for tone
function tierToneVar(tier: number): string {
  const t = TIERS[Math.min(tier, TIERS.length - 1)];
  return t ? `var(${t.toneVar})` : 'var(--ed-r-gray)';
}

export default function Ladders() {
  const ladders = useLadders();
  return (
    <div style={{ padding: 'var(--ed-screen-pad)' }}>
      <Header
        eyebrow="Sequence"
        title="Ladders."
        subtitle="Tier-by-tier walks through 800–2300+."
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 'var(--ed-section-gap)',
        }}
      >
        {ladders.map((ladder) => {
          const tone = tierToneVar(ladder.tier);
          const pct = ladder.solved / ladder.total;
          const locked = ladder.solved === 0 && ladder.tier > 3;
          const done = ladder.solved === ladder.total;
          const active = ladder.solved > 0 && ladder.solved < ladder.total;

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
                  borderRadius: 18,
                  padding: '26px 28px',
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
                    width: 220,
                    height: 220,
                    backgroundImage: `radial-gradient(circle at top right, color-mix(in oklab, ${tone} 14%, transparent), transparent 65%)`,
                    pointerEvents: 'none',
                  }}
                />

                {/* Status pill — top right */}
                <div
                  style={{
                    position: 'absolute',
                    top: 22,
                    right: 24,
                    display: 'flex',
                    gap: 6,
                  }}
                >
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
                    gap: 22,
                  }}
                >
                  {/* HUGE tier numeral */}
                  <div style={{ flexShrink: 0, width: 84, textAlign: 'left' }}>
                    <div
                      style={{
                        fontFamily: "'Geist Mono', ui-monospace, monospace",
                        fontWeight: 200,
                        fontSize: 76,
                        color: tone,
                        letterSpacing: -4,
                        lineHeight: 0.85,
                        fontFeatureSettings: '"tnum", "zero"',
                      }}
                    >
                      {tierNumeral}
                    </div>
                  </div>

                  {/* Label + range + progress */}
                  <div style={{ flex: 1, minWidth: 0, paddingTop: 6 }}>
                    <div
                      style={{
                        fontFamily: "'Geist', system-ui, sans-serif",
                        fontSize: 20,
                        fontWeight: 500,
                        letterSpacing: -0.5,
                        marginBottom: 4,
                        color: 'var(--ed-fg)',
                      }}
                    >
                      {ladder.label}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Geist Mono', ui-monospace, monospace",
                        fontSize: 10.5,
                        color: 'var(--ed-fg-mute)',
                        letterSpacing: 0.2,
                        marginBottom: 22,
                      }}
                    >
                      {ladder.range}
                    </div>

                    {/* Progress bar + count */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                      }}
                    >
                      <div
                        className="ed-fill"
                        style={{
                          flex: 1,
                          height: 3,
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
                          fontSize: 11,
                          color: 'var(--ed-fg-dim)',
                          letterSpacing: 0.2,
                          minWidth: 56,
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
  );
}
