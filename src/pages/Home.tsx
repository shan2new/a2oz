import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Eyebrow } from '@/components/primitives/Eyebrow';
import { Header } from '@/components/primitives/Header';
import { ratingTone } from '@/lib/ratingTone';
import { tierForRating } from '@/lib/tiers';
import { useUserStore } from '@/store/userStore';
import { useLadders, getRawLadder } from '@/data/ladders';
import { useProblemsForLadder } from '@/data/problems';
import type { Ladder } from '@/types';

function pickActiveLadder(rating: number, ladders: Ladder[]): Ladder {
  // Prefer a non-extra rating-tier ladder whose range contains the user's
  // rating. Fall back to the first incomplete one, then the first ladder.
  const preferred = ladders.find((l) => {
    if (l.kind !== 'rating') return false;
    if (l.id.startsWith('ladder2') || l.id === 'ladder3' || l.id === 'ladder31' || l.id === 'ladder32') {
      // Skip "extra" variants when picking a primary recommendation.
      if (l.id !== 'ladder21') return false;
    }
    const m = l.range.match(/(\d+)/g);
    if (!m) return false;
    const lo = +m[0];
    const hi = m[1] ? +m[1] : 9999;
    return rating >= lo && rating <= hi;
  });
  return preferred ?? ladders.find((l) => l.solved < l.total) ?? ladders[0];
}

// Cursor-spotlight style injection — targets .ed-spot-hero which is added inline
// on the hero Panel. The ::before overlay is already provided globally via .ed-spot,
// but we apply --spot as a custom property pointing to the tier tone color.
// The .ed-spot class in index.css handles the radial-gradient + opacity transition.

export default function Home() {
  const user = useUserStore((s) => s.user);
  const userRating = user?.rating ?? 1500;
  const tone = ratingTone(userRating);

  const ladders = useLadders();
  const ladder = pickActiveLadder(userRating, ladders);
  const pct = ladder.total > 0 ? Math.round((ladder.solved / ladder.total) * 100) : 0;

  const raw = getRawLadder(ladder.id) ?? null;
  const ladderProblems = useProblemsForLadder(raw);
  const nextUp = ladderProblems.filter((p) => p.status !== 'solved').slice(0, 5);

  const recent = (user?.recent ?? []).slice(0, 6);

  // Page header eyebrow: current date
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  // Hero card mouse-move handler — updates --mx / --my CSS vars for spotlight
  const heroRef = useRef<HTMLDivElement>(null);
  const onHeroMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = heroRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
    el.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
  };

  const onHeroEnter = () => {
    if (heroRef.current) {
      heroRef.current.style.borderColor = tone;
    }
  };
  const onHeroLeave = () => {
    if (heroRef.current) {
      heroRef.current.style.borderColor = 'var(--ed-line)';
    }
  };

  return (
    <div style={{ padding: 'var(--ed-screen-pad)' }}>
      {/* Page header */}
      <Header
        eyebrow={today}
        title={`${userRating} · ${tierForRating(userRating).label}`}
      />

      {/* ── Hero "Continue the climb" card ─────────────────────────────── */}
      <div
        ref={heroRef}
        className="ed-card ed-rise ed-spot"
        onMouseMove={onHeroMove}
        onMouseEnter={onHeroEnter}
        onMouseLeave={onHeroLeave}
        style={{
          background: 'var(--ed-bg-1)',
          border: '1px solid var(--ed-line)',
          borderRadius: 14,
          padding: '28px 32px',
          marginBottom: 'var(--ed-section-gap)',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--ed-glow)',
          // --spot drives the radial-gradient color in .ed-spot::before (index.css)
          ['--spot' as string]: tone,
          transition: 'border-color .25s ease, transform .18s ease, box-shadow .18s ease',
        }}
      >
        {/* Corner radial glow — decorative, tier-toned */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -120,
            width: 360,
            height: 360,
            background: `radial-gradient(circle, color-mix(in oklab, ${tone} 16%, transparent), transparent 65%)`,
            pointerEvents: 'none',
            zIndex: 0,
          }}
          aria-hidden="true"
        />

        {/* Card content grid: left info + right big percent numeral */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 32,
            alignItems: 'flex-end',
          }}
        >
          {/* Left: eyebrow → title → subtitle → progress bar */}
          <div>
            {/* Eyebrow with ladder range */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 14,
              }}
            >
              <span
                style={{
                  fontFamily: "'DM Mono', ui-monospace, monospace",
                  fontSize: 10.5,
                  color: tone,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  fontWeight: 500,
                }}
              >
                Continue the climb
              </span>
              <span
                style={{
                  fontFamily: "'DM Mono', ui-monospace, monospace",
                  fontSize: 10.5,
                  color: 'var(--ed-fg-faint)',
                  letterSpacing: '0.05em',
                }}
              >
                · {ladder.label} · {ladder.range}
              </span>
            </div>

            {/* Section title */}
            <div
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: 30,
                fontWeight: 400,
                letterSpacing: -0.8,
                lineHeight: 1.15,
                color: 'var(--ed-fg)',
                marginBottom: 8,
              }}
            >
              {ladder.label} ladder
            </div>

            {/* Subtitle */}
            <div
              style={{
                color: 'var(--ed-fg-dim)',
                fontSize: 13.5,
                fontFamily: "'DM Sans', system-ui, sans-serif",
                maxWidth: 420,
              }}
            >
              {ladder.solved} / {ladder.total} solved · {pct}% to {ladder.target}
            </div>

            {/* Progress bar */}
            <div style={{ marginTop: 22, maxWidth: 480 }}>
              <div
                className="ed-fill"
                style={{
                  height: 6,
                  background: 'var(--ed-bg-2)',
                  borderRadius: 3,
                  overflow: 'hidden',
                }}
              >
                <i
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, var(--ed-r-sage), ${tone})`,
                  }}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 8,
                  fontFamily: "'DM Mono', ui-monospace, monospace",
                  fontSize: 10.5,
                  color: 'var(--ed-fg-faint)',
                  letterSpacing: '0.03em',
                }}
              >
                <span>0</span>
                <span style={{ color: tone }}>{ladder.solved} ✓</span>
                <span>{ladder.total}</span>
              </div>
            </div>

            {/* CTA pill */}
            <div style={{ marginTop: 24 }}>
              <Link
                to={`/ladders/${ladder.id}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 18px',
                  background: tone,
                  color: 'var(--ed-bg-0)',
                  borderRadius: 999,
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: 13,
                  fontWeight: 500,
                  textDecoration: 'none',
                  letterSpacing: -0.1,
                  transition: 'opacity .18s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                Continue →
              </Link>
            </div>
          </div>

          {/* Right: big percent numeral */}
          <div style={{ textAlign: 'right', marginBottom: 4 }}>
            <div
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: 96,
                fontWeight: 400,
                color: tone,
                letterSpacing: -4,
                lineHeight: 0.85,
                fontFeatureSettings: '"tnum", "zero"',
              }}
            >
              {pct}
              <span
                style={{
                  fontFamily: "'DM Mono', ui-monospace, monospace",
                  fontSize: 22,
                  color: 'var(--ed-fg-mute)',
                  fontWeight: 400,
                  letterSpacing: 0,
                }}
              >
                %
              </span>
            </div>
            <div
              style={{
                fontFamily: "'DM Mono', ui-monospace, monospace",
                fontSize: 10.5,
                color: 'var(--ed-fg-faint)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginTop: 8,
              }}
            >
              complete
            </div>
          </div>
        </div>
      </div>

      {/* ── Two-column quiet zone: Next up | Recent ─────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr',
          gap: 'var(--ed-section-gap)',
        }}
      >
        {/* ── Left: Next up ────────────────────────────────────────────── */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: 18,
            }}
          >
            <Eyebrow>
              Next up · {ladder.label}
            </Eyebrow>
            <Link
              to={`/ladders/${ladder.id}`}
              style={{
                fontFamily: "'DM Mono', ui-monospace, monospace",
                fontSize: 10.5,
                color: 'var(--ed-fg-dim)',
                textDecoration: 'none',
                letterSpacing: '0.02em',
              }}
            >
              see all →
            </Link>
          </div>

          <ul className="ed-cascade" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {nextUp.map((p, i) => (
              <li
                key={p.id}
                className="ed-row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '70px 1fr auto auto auto',
                  padding: '13px 12px 13px 0',
                  gap: 16,
                  alignItems: 'center',
                  borderBottom:
                    i === nextUp.length - 1
                      ? 'none'
                      : '1px solid var(--ed-line-soft)',
                  cursor: 'pointer',
                  fontSize: 13.5,
                  borderRadius: 6,
                }}
              >
                {/* Problem ID (mono mute) */}
                <span
                  style={{
                    fontFamily: "'DM Mono', ui-monospace, monospace",
                    fontSize: 10.5,
                    color: 'var(--ed-fg-mute)',
                    letterSpacing: '0.02em',
                    fontFeatureSettings: '"tnum"',
                  }}
                >
                  {p.id}
                </span>

                {/* Problem name (truncated) */}
                <span
                  style={{
                    color: 'var(--ed-fg)',
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    letterSpacing: -0.1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {p.name}
                </span>

                {/* Tag (mono dim) */}
                <span style={{ display: 'flex', gap: 4 }}>
                  {p.tags.slice(0, 1).map((t) => (
                    <span
                      key={t}
                      style={{
                        fontFamily: "'DM Mono', ui-monospace, monospace",
                        fontSize: 10,
                        color: 'var(--ed-fg-mute)',
                        padding: '2px 8px',
                        borderRadius: 999,
                        background: 'transparent',
                        border: '1px solid var(--ed-line)',
                        letterSpacing: '0.01em',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </span>

                {/* Rating (mono in tier color) */}
                <span
                  style={{
                    fontFamily: "'DM Mono', ui-monospace, monospace",
                    fontSize: 11.5,
                    color: ratingTone(p.rating),
                    fontWeight: 500,
                    minWidth: 36,
                    textAlign: 'right',
                    letterSpacing: '0.01em',
                    fontFeatureSettings: '"tnum"',
                  }}
                >
                  {p.rating}
                </span>

                {/* Chevron (revealed on hover via .ed-chev) */}
                <span
                  className="ed-chev"
                  style={{
                    color: tone,
                    fontFamily: "'DM Mono', ui-monospace, monospace",
                    fontSize: 14,
                    width: 14,
                    textAlign: 'center',
                  }}
                >
                  →
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Right: Recent verdicts ───────────────────────────────────── */}
        <div>
          <div style={{ marginBottom: 18 }}>
            <Eyebrow>Recent</Eyebrow>
          </div>

          <ul className="ed-cascade" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {recent.map((r, i) => (
              <li
                key={i}
                className="ed-row"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 0',
                  fontSize: 12.5,
                  borderBottom:
                    i === recent.length - 1
                      ? 'none'
                      : '1px solid var(--ed-line-soft)',
                  borderRadius: 4,
                }}
              >
                {/* Verdict dot */}
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: r.verdict === 'AC' ? 'var(--ed-ok)' : 'var(--ed-err)',
                    opacity: 0.85,
                    flexShrink: 0,
                  }}
                  aria-label={r.verdict}
                />

                {/* Problem name */}
                <span
                  style={{
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: 'var(--ed-fg)',
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    letterSpacing: -0.1,
                  }}
                >
                  {r.problem}
                </span>

                {/* Verdict tag */}
                <span
                  style={{
                    fontFamily: "'DM Mono', ui-monospace, monospace",
                    fontSize: 10,
                    fontWeight: 500,
                    color: r.verdict === 'AC' ? 'var(--ed-ok)' : 'var(--ed-err)',
                    letterSpacing: '0.04em',
                    padding: '1px 6px',
                    borderRadius: 4,
                    background:
                      r.verdict === 'AC'
                        ? 'color-mix(in oklab, var(--ed-ok) 10%, transparent)'
                        : 'color-mix(in oklab, var(--ed-err) 10%, transparent)',
                  }}
                >
                  {r.verdict}
                </span>

                {/* Date (mono mute) */}
                <span
                  style={{
                    color: 'var(--ed-fg-faint)',
                    fontFamily: "'DM Mono', ui-monospace, monospace",
                    fontSize: 10.5,
                    letterSpacing: '0.02em',
                    flexShrink: 0,
                  }}
                >
                  {r.date}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
