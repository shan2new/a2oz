// LadderComplete — celebration page for finishing a ladder.
// Route: /ladders/:id/complete

import { useParams, Link } from 'react-router-dom';
import { LADDERS } from '@/data/ladders';
import { TIERS } from '@/lib/tiers';
import { useCountUp } from '@/lib/useCountUp';
import { Panel } from '@/components/primitives/Panel';
import { Eyebrow } from '@/components/primitives/Eyebrow';

// ── Stat strip item ──────────────────────────────────────────────────────────

type StatProps = {
  label: string;
  value: string;
  tone?: string;
  hint?: string;
};

function CompleteStat({ label, value, tone, hint }: StatProps) {
  return (
    <div>
      <div
        style={{
          fontFamily: "'Geist Mono', ui-monospace, monospace",
          fontSize: 36,
          fontWeight: 300,
          color: tone ?? 'var(--ed-fg)',
          letterSpacing: -1,
          lineHeight: 1,
          fontFeatureSettings: '"tnum","zero"',
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: "'DM Mono', ui-monospace, monospace",
          fontSize: 10.5,
          color: 'var(--ed-fg-mute)',
          marginTop: 8,
          letterSpacing: '0.14em',
          textTransform: 'uppercase' as const,
        }}
      >
        {label}
      </div>
      {hint && (
        <div
          style={{
            fontFamily: "'DM Mono', ui-monospace, monospace",
            fontSize: 10,
            color: 'var(--ed-fg-faint)',
            marginTop: 3,
            letterSpacing: 0.2,
          }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}

// ── LadderComplete ───────────────────────────────────────────────────────────

export default function LadderComplete() {
  const { id } = useParams<{ id: string }>();

  const ladderIdx = LADDERS.findIndex((l) => l.id === id);
  const ladder = LADDERS[ladderIdx];

  // Count-up for the big tier numeral
  const animatedTier = useCountUp(ladder ? ladder.tier + 1 : 0, 1100);

  if (!ladder) {
    return (
      <div
        style={{
          padding: '64px 40px',
          color: 'var(--ed-fg-mute)',
          fontFamily: "'DM Mono', ui-monospace, monospace",
          fontSize: 13,
        }}
      >
        <div style={{ marginBottom: 8, color: 'var(--ed-fg-faint)', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          404
        </div>
        Ladder &ldquo;{id}&rdquo; not found.{' '}
        <Link
          to="/ladders"
          style={{ color: 'var(--ed-fg-dim)', textDecoration: 'underline', textUnderlineOffset: 3 }}
        >
          Back to ladders →
        </Link>
      </div>
    );
  }

  // Tier data
  const tier = TIERS[ladder.tier] ?? TIERS[0];
  const tone = `var(${tier.toneVar})`;

  // Next ladder (clamped) for the preview card + CTA
  const nextLadderIdx = Math.min(ladderIdx + 1, LADDERS.length - 1);
  const nextLadder = LADDERS[nextLadderIdx];
  const nextTier = TIERS[nextLadder.tier] ?? tier;
  const nextTone = `var(${nextTier.toneVar})`;
  const isLastLadder = nextLadderIdx === ladderIdx;

  // Tier numeral display: count-up rounds to integer, pad to 2 digits
  const tierNumeral = Math.round(animatedTier).toString().padStart(2, '0');

  // Mock plausible stats
  const SOLVED = 100;
  const DAYS = 47;
  const ACCEPTANCE = 92;
  const RATING_GAIN = 47;

  return (
    <div
      style={{
        minHeight: '100%',
        background: 'var(--ed-bg-0)',
        position: 'relative',
      }}
    >
      {/* ── Hero section ─────────────────────────────────────────────────── */}
      <div
        style={{
          padding: '64px 40px 56px',
          borderBottom: '1px solid var(--ed-line)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Layered radial glows */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: -200,
            left: '40%',
            width: 700,
            height: 700,
            background: `radial-gradient(circle, color-mix(in oklab, ${tone} 22%, transparent), transparent 60%)`,
            pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: -160,
            left: -80,
            width: 400,
            height: 400,
            background: `radial-gradient(circle, color-mix(in oklab, ${nextTone} 16%, transparent), transparent 65%)`,
            pointerEvents: 'none',
          }}
        />

        {/* Content — max-width constrains to readable width */}
        <div style={{ position: 'relative', maxWidth: 760 }}>
          {/* Eyebrow */}
          <Eyebrow
            style={{
              color: tone,
              marginBottom: 20,
            }}
          >
            <span style={{ display: 'inline-block', width: 14, height: 1, background: tone, marginRight: 8 }} />
            Ladder complete · {ladder.label}
          </Eyebrow>

          {/* Big tier numeral — Geist Mono, count-up animation */}
          <div
            style={{
              fontFamily: "'Geist Mono', ui-monospace, monospace",
              fontSize: 'clamp(72px, 10vw, 120px)',
              fontWeight: 300,
              letterSpacing: -5,
              lineHeight: 0.88,
              color: tone,
              marginBottom: 16,
              fontFeatureSettings: '"tnum","zero"',
              userSelect: 'none',
            }}
          >
            {tierNumeral}
          </div>

          {/* Title — DM Sans display */}
          <div
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: 'clamp(48px, 7vw, 80px)',
              fontWeight: 400,
              letterSpacing: -3,
              lineHeight: 1.0,
              color: 'var(--ed-fg)',
              marginBottom: 22,
            }}
          >
            {ladder.label}
          </div>

          {/* Subtitle */}
          <div
            style={{
              color: 'var(--ed-fg-dim)',
              fontSize: 16,
              lineHeight: 1.6,
              maxWidth: 540,
              marginBottom: 36,
            }}
          >
            100 problems · cleared in 47 days · 92% acceptance
          </div>

          {/* ── 4-stat strip ────────────────────────────────────────────── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 24,
              paddingTop: 28,
              borderTop: '1px solid var(--ed-line)',
              maxWidth: 600,
              marginBottom: 36,
            }}
          >
            <CompleteStat value={String(SOLVED)} label="Solved" tone="var(--ed-r-sage)" />
            <CompleteStat value={String(DAYS)} label="Days" tone="var(--ed-r-teal)" hint="best 21d streak" />
            <CompleteStat value={`${ACCEPTANCE}%`} label="Acceptance" tone="var(--ed-r-sage)" />
            <CompleteStat value={`+${RATING_GAIN}`} label="Rating gain" tone={tone} />
          </div>

          {/* ── Action buttons ───────────────────────────────────────────── */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const }}>
            {!isLastLadder && (
              <Link
                to={`/ladders/${nextLadder.id}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: tone,
                  color: '#0e0f12',
                  border: 'none',
                  padding: '13px 22px',
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: 13.5,
                  fontWeight: 500,
                  borderRadius: 8,
                  cursor: 'pointer',
                  letterSpacing: 0.1,
                  textDecoration: 'none',
                  transition: 'opacity 0.15s ease',
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = '0.88')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = '1')}
              >
                Begin {nextLadder.label} →
              </Link>
            )}
            <Link
              to={`/ladders/${ladder.id}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: 'transparent',
                color: 'var(--ed-fg)',
                border: '1px solid var(--ed-line)',
                padding: '13px 18px',
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: 13.5,
                borderRadius: 8,
                cursor: 'pointer',
                textDecoration: 'none',
                transition: 'border-color 0.15s ease',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ed-fg-faint)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ed-line)')}
            >
              Review this ladder
            </Link>
          </div>
        </div>
      </div>

      {/* ── Next-tier preview ─────────────────────────────────────────────── */}
      <div style={{ padding: '36px 40px 48px' }}>
        <div
          style={{
            fontFamily: "'DM Mono', ui-monospace, monospace",
            fontSize: 10.5,
            color: 'var(--ed-fg-mute)',
            letterSpacing: '0.16em',
            textTransform: 'uppercase' as const,
            marginBottom: 18,
          }}
        >
          What&apos;s next
        </div>

        {isLastLadder ? (
          /* Edge case: completed the final ladder */
          <Panel
            padded
            style={{
              maxWidth: 640,
              background: 'var(--ed-bg-1)',
            }}
          >
            <div
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: 20,
                fontWeight: 400,
                color: tone,
                marginBottom: 8,
              }}
            >
              You&apos;ve climbed every ladder.
            </div>
            <div style={{ color: 'var(--ed-fg-dim)', fontSize: 13.5, lineHeight: 1.6 }}>
              The summit is yours. Track your continued progress in{' '}
              <Link to="/progress" style={{ color: tone, textDecoration: 'underline', textUnderlineOffset: 3 }}>
                Progress
              </Link>
              .
            </div>
          </Panel>
        ) : (
          <Panel
            padded={false}
            interactive
            style={{
              maxWidth: 700,
              overflow: 'hidden',
              position: 'relative',
              padding: '24px 28px',
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLDivElement).style.borderColor = nextTone)
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLDivElement).style.borderColor = 'var(--ed-line)')
            }
          >
            {/* Glow accent */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: -100,
                right: -100,
                width: 280,
                height: 280,
                background: `radial-gradient(circle, color-mix(in oklab, ${nextTone} 16%, transparent), transparent 65%)`,
                pointerEvents: 'none',
              }}
            />

            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 24,
              }}
            >
              {/* Tier numeral */}
              <div style={{ flexShrink: 0 }}>
                <div
                  style={{
                    fontFamily: "'DM Mono', ui-monospace, monospace",
                    fontSize: 9.5,
                    color: 'var(--ed-fg-faint)',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase' as const,
                    marginBottom: 2,
                  }}
                >
                  Tier
                </div>
                <div
                  style={{
                    fontFamily: "'Geist Mono', ui-monospace, monospace",
                    fontSize: 80,
                    fontWeight: 300,
                    color: nextTone,
                    letterSpacing: -4,
                    lineHeight: 0.9,
                    fontFeatureSettings: '"tnum","zero"',
                  }}
                >
                  {(nextLadder.tier + 1).toString().padStart(2, '0')}
                </div>
              </div>

              {/* Next ladder info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    fontSize: 26,
                    fontWeight: 400,
                    letterSpacing: -0.5,
                    marginBottom: 4,
                    color: 'var(--ed-fg)',
                  }}
                >
                  {nextLadder.label}
                </div>
                <div
                  style={{
                    fontFamily: "'DM Mono', ui-monospace, monospace",
                    fontSize: 11,
                    color: 'var(--ed-fg-mute)',
                    letterSpacing: 0.2,
                    marginBottom: 10,
                  }}
                >
                  {nextLadder.range} · {nextLadder.total} problems · fresh
                </div>
                <div
                  style={{
                    color: 'var(--ed-fg-dim)',
                    fontSize: 13.5,
                    lineHeight: 1.5,
                    maxWidth: 420,
                  }}
                >
                  The next rung awaits — harder problems, sharper thinking.
                </div>
              </div>

              {/* Start link */}
              <Link
                to={`/ladders/${nextLadder.id}`}
                style={{
                  flexShrink: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: 'transparent',
                  color: 'var(--ed-fg)',
                  border: `1px solid ${nextTone}`,
                  padding: '10px 18px',
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: 13,
                  fontWeight: 500,
                  borderRadius: 8,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.background =
                    `color-mix(in oklab, ${nextTone} 12%, transparent)`)
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.background = 'transparent')
                }
              >
                Start →
              </Link>
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}
