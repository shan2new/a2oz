import { useEffect, useRef, useState } from 'react';
import { useCount } from '@/lib/useCountUp';
import { ratingTone } from '@/lib/ratingTone';
import { tierForRating, tierIndexForRating, TIERS } from '@/lib/tiers';
import { useUserStore } from '@/store/userStore';

type RevealHandleProps = {
  handle: string;
  onEnter: () => void;
};

// Inline sparkline — larger version for the reveal screen
function RevealSparkline({ points, tone, active }: { points: number[]; tone: string; active: boolean }) {
  const pathRef = useRef<SVGPathElement>(null);
  const W = 320;
  const H = 56;

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

  useEffect(() => {
    if (!active) return;
    const el = pathRef.current;
    if (!el) return;
    const len = el.getTotalLength();
    el.style.strokeDasharray = String(len);
    el.style.strokeDashoffset = String(len);
    void el.getBoundingClientRect();
    el.style.strokeDashoffset = '0';
  }, [active, d]);

  if (!active) return null;

  return (
    <svg
      width={W}
      height={H}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <path
        ref={pathRef}
        d={d}
        fill="none"
        stroke={tone}
        strokeWidth="1.5"
        strokeOpacity="0.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(.2,.7,.2,1)' }}
      />
    </svg>
  );
}

function Skel({ w, h }: { w: number; h: number }) {
  return (
    <span
      className="ed-skel"
      style={{ display: 'inline-block', width: w, height: h, verticalAlign: 'middle' }}
    />
  );
}

export function RevealHandle({ handle, onEnter }: RevealHandleProps) {
  const [step, setStep] = useState(0);

  // Cascade timing: 0/120/480/760/1040/1320ms
  useEffect(() => {
    const delays = [120, 480, 760, 1040, 1320];
    const ids = delays.map((t, i) => setTimeout(() => setStep(i + 1), t));
    return () => ids.forEach(clearTimeout);
  }, []);

  const u = useUserStore((s) => s.user);
  const ratingHistory = useUserStore((s) => s.ratingHistory);

  const TARGET_RATING = u?.rating ?? 0;
  const TARGET_MAX = u?.maxRating ?? TARGET_RATING;
  const TARGET_SOLVED = u?.solvedTotal ?? 0;
  const TARGET_CONTESTS = u?.contests ?? 0;
  const TARGET_STREAK = u?.streak ?? 0;

  const tone = ratingTone(TARGET_RATING);
  const tier = tierForRating(TARGET_RATING);
  const tierIdx = tierIndexForRating(TARGET_RATING);
  const nextTier = TIERS[tierIdx + 1];
  const toNextTier = nextTier ? Math.max(0, nextTier.min - TARGET_RATING) : 0;

  const rating = useCount(TARGET_RATING, 1100, step >= 2);
  const solved = useCount(TARGET_SOLVED, 900, step >= 3);
  const contests = useCount(TARGET_CONTESTS, 800, step >= 3);
  const streak = useCount(TARGET_STREAK, 600, step >= 3);

  // Sparkline: take last 8 rating points if we have rating history, else
  // synthesize from current rating.
  const sparkPoints = (() => {
    if (ratingHistory.length >= 2) {
      const slice = ratingHistory.slice(-8);
      return slice.map((p) => p.newRating);
    }
    return [TARGET_RATING - 30, TARGET_RATING - 12, TARGET_RATING - 18, TARGET_RATING];
  })();

  const recent7d = (() => {
    if (ratingHistory.length < 2) return 0;
    const last = ratingHistory[ratingHistory.length - 1];
    const cutoff = last.ratingUpdateTimeSeconds - 7 * 86400;
    const earlier = [...ratingHistory].reverse().find((p) => p.ratingUpdateTimeSeconds <= cutoff);
    if (!earlier) return last.newRating - ratingHistory[0].newRating;
    return last.newRating - earlier.newRating;
  })();

  return (
    <div style={{
      width: '100%',
      maxWidth: 880,
      padding: '0 24px',
    }}>
      {/* Live indicator eyebrow */}
      <div style={{
        fontFamily: "'DM Mono', ui-monospace, monospace",
        fontSize: 10.5,
        color: 'var(--ed-ok)',
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <span style={{
          width: 6,
          height: 6,
          background: 'var(--ed-ok)',
          borderRadius: '50%',
          display: 'inline-block',
          flexShrink: 0,
        }} />
        Profile linked · live
      </div>

      {/* Welcome headline */}
      <div style={{
        fontFamily: "'Instrument Serif', ui-serif, serif",
        fontSize: 56,
        fontWeight: 400,
        letterSpacing: -1.6,
        lineHeight: 1.02,
        marginBottom: 32,
        color: 'var(--ed-fg)',
      }}>
        <span style={{ color: 'var(--ed-fg-dim)' }}>Welcome,</span>
        <br />
        {step >= 1 ? (
          <span
            className="ed-blur-in"
            style={{
              color: tone,
              fontFamily: "'Geist', system-ui, sans-serif",
              fontWeight: 600,
              fontSize: 52,
              letterSpacing: -1.2,
            }}
          >
            {handle}
          </span>
        ) : (
          <Skel w={280} h={48} />
        )}
        <span style={{ color: 'var(--ed-fg-dim)' }}>.</span>
      </div>

      {/* Hero rating card */}
      <div style={{
        background: 'var(--ed-bg-1)',
        border: `1px solid ${step >= 2 ? `color-mix(in oklab, ${tone} 35%, var(--ed-line))` : 'var(--ed-line)'}`,
        borderRadius: 14,
        padding: '28px 32px',
        boxShadow: 'var(--ed-glow)',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: 24,
        transition: 'border-color .4s ease',
      }}>
        {/* Radial glow accent */}
        {step >= 2 && (
          <div style={{
            position: 'absolute',
            top: -120,
            right: -120,
            width: 360,
            height: 360,
            background: `radial-gradient(circle, color-mix(in oklab, ${tone} 18%, transparent), transparent 65%)`,
            pointerEvents: 'none',
          }} />
        )}

        <div style={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: 36,
          alignItems: 'flex-end',
        }}>
          {/* Rating numeral */}
          <div>
            <div style={{
              fontFamily: "'DM Mono', ui-monospace, monospace",
              fontSize: 10.5,
              color: 'var(--ed-fg-mute)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: 12,
            }}>
              Current rating
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
              <div style={{
                fontFamily: "'Geist Mono', ui-monospace, monospace",
                fontWeight: 300,
                fontSize: 96,
                lineHeight: 0.85,
                letterSpacing: -5,
                color: step >= 2 ? tone : 'var(--ed-fg-faint)',
                fontFeatureSettings: '"tnum","zero"',
                minWidth: 240,
                transition: 'color .4s ease',
              }}>
                {step >= 2 ? Math.round(rating) : <Skel w={200} h={72} />}
              </div>
              <div style={{ paddingBottom: 10 }}>
                <div style={{
                  fontFamily: "'DM Mono', ui-monospace, monospace",
                  fontSize: 11,
                  color: 'var(--ed-fg-mute)',
                  letterSpacing: 0.3,
                  marginBottom: 4,
                }}>
                  {tier.label.toLowerCase()} · tier {String(tierIndexForRating(TARGET_RATING) + 1).padStart(2, '0')}
                </div>
                {step >= 2 ? (
                  <div
                    className="ed-blur-in"
                    style={{
                      fontFamily: "'DM Mono', ui-monospace, monospace",
                      fontSize: 11,
                      color: recent7d >= 0 ? 'var(--ed-ok)' : 'var(--ed-err)',
                    }}
                  >
                    {recent7d >= 0 ? '+' : ''}
                    {recent7d} in 7d
                  </div>
                ) : (
                  <Skel w={70} h={11} />
                )}
              </div>
            </div>
          </div>

          {/* Sparkline */}
          <div style={{ alignSelf: 'flex-end' }}>
            <RevealSparkline points={sparkPoints} tone={tone} active={step >= 2} />
          </div>
        </div>
      </div>

      {/* Mini stat cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12,
        marginBottom: 32,
      }}>
        {[
          { label: 'Solved',   value: Math.round(solved),   tone: 'var(--ed-fg)',     shown: step >= 3 },
          { label: 'Contests', value: Math.round(contests), tone: 'var(--ed-fg)',     shown: step >= 3 },
          { label: 'Streak',   value: `${Math.round(streak)}d`, tone: 'var(--ed-r-teal)', shown: step >= 3 },
          { label: 'Peak',     value: TARGET_MAX,            tone: ratingTone(TARGET_MAX), shown: step >= 4 },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: 'var(--ed-bg-1)',
              border: '1px solid var(--ed-line)',
              borderRadius: 10,
              padding: '16px 18px',
              boxShadow: 'var(--ed-glow)',
            }}
          >
            <div style={{
              fontFamily: "'DM Mono', ui-monospace, monospace",
              fontSize: 10,
              color: 'var(--ed-fg-mute)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}>
              {s.label}
            </div>
            {s.shown ? (
              <div
                className="ed-blur-in"
                style={{
                  fontFamily: "'Instrument Serif', ui-serif, serif",
                  fontSize: 32,
                  fontWeight: 400,
                  color: s.tone,
                  letterSpacing: -0.8,
                  lineHeight: 1,
                }}
              >
                {s.value}
              </div>
            ) : (
              <Skel w={56} h={28} />
            )}
          </div>
        ))}
      </div>

      {/* CTA */}
      {step >= 5 && (
        <div className="ed-blur-in" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={onEnter}
            style={{
              background: tone,
              color: '#0e0f12',
              border: 'none',
              padding: '14px 24px',
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: 14,
              fontWeight: 600,
              borderRadius: 10,
              cursor: 'pointer',
              letterSpacing: -0.1,
            }}
          >
            Enter A2OJ →
          </button>
          <span style={{
            fontFamily: "'DM Mono', ui-monospace, monospace",
            fontSize: 11,
            color: 'var(--ed-fg-faint)',
            letterSpacing: 0.3,
          }}>
            {nextTier
              ? `${toNextTier} rating to ${nextTier.label.toLowerCase()}`
              : 'top of the ladder'}
          </span>
        </div>
      )}
    </div>
  );
}
