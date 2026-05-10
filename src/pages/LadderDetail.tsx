import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLadder, getRawLadder } from '@/data/ladders';
import { useProblemsForLadder } from '@/data/problems';
import { TIERS, tierToneVar } from '@/lib/tiers';
import { Segmented } from '@/components/primitives/Segmented';
import { ProblemRow } from '@/components/problem/ProblemRow';

type FilterVal = 'all' | 'unsolved' | 'attempted' | 'solved';

export default function LadderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const ladder = useLadder(id);
  const raw = useMemo(() => (id ? getRawLadder(id) ?? null : null), [id]);
  const allProblems = useProblemsForLadder(raw);

  const [filter, setFilter] = useState<FilterVal>('all');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const stats = {
    solved: allProblems.filter((p) => p.status === 'solved').length,
    attempted: allProblems.filter((p) => p.status === 'attempted').length,
    unsolved: allProblems.filter((p) => p.status === 'unsolved').length,
  };

  useEffect(() => {
    if (!ladder) return;
    if (stats.solved === ladder.total && ladder.total > 0) {
      navigate(`/ladders/${ladder.id}/complete`);
    }
  }, [stats.solved, ladder, navigate]);

  const allTags = useMemo(
    () => [...new Set(allProblems.flatMap((p) => p.tags))].slice(0, 10),
    [allProblems],
  );

  const filtered = allProblems.filter((p) => {
    if (filter !== 'all' && p.status !== filter) return false;
    if (activeTag && !p.tags.includes(activeTag)) return false;
    if (
      search.trim() &&
      !p.name.toLowerCase().includes(search.toLowerCase()) &&
      !p.id.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  if (!ladder) {
    return (
      <div
        style={{
          padding: 'var(--ed-screen-pad)',
          color: 'var(--ed-fg-mute)',
          fontFamily: "'DM Mono', ui-monospace, monospace",
          fontSize: 13,
        }}
      >
        Ladder not found.{' '}
        <Link
          to="/ladders"
          style={{ color: 'var(--ed-pri)', textDecoration: 'underline' }}
        >
          ← All ladders
        </Link>
      </div>
    );
  }

  const tone = tierToneVar(ladder.tier);
  const completionPct = Math.round((ladder.solved / ladder.total) * 100);

  // Eyebrow above the title. For rating ladders, the title IS the range,
  // so use the tier name + a "Standard / Extra" qualifier instead. For
  // division ladders, surface the deck identifier.
  const eyebrowLabel = (() => {
    const tierName = TIERS[Math.min(ladder.tier, TIERS.length - 1)]?.label ?? '';
    if (ladder.kind === 'division') {
      return ladder.id.endsWith('_old')
        ? 'Codeforces · Div 2 · Older'
        : 'Codeforces · Div 2 · Updated';
    }
    return `${tierName} · ${ladder.extra ? 'Extra' : 'Standard'}`;
  })();

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          padding: '34px 40px 28px',
          borderBottom: '1px solid var(--ed-line)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Radial glow */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -100,
            width: 420,
            height: 420,
            backgroundImage: `radial-gradient(circle, color-mix(in oklab, ${tone} 16%, transparent), transparent 60%)`,
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative' }}>
          {/* Back link */}
          <Link
            to="/ladders"
            style={{
              display: 'inline-block',
              background: 'transparent',
              border: 'none',
              color: 'var(--ed-fg-mute)',
              fontFamily: "'DM Mono', ui-monospace, monospace",
              fontSize: 10.5,
              cursor: 'pointer',
              padding: 0,
              marginBottom: 16,
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              textDecoration: 'none',
            }}
          >
            ← All ladders
          </Link>

          {/* Hero grid: info | stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: 32,
              alignItems: 'flex-start',
            }}
          >
            {/* Label + range + description */}
            <div>
              <div
                style={{
                  fontFamily: "'DM Mono', ui-monospace, monospace",
                  fontSize: 11,
                  color: tone,
                  letterSpacing: 1.6,
                  textTransform: 'uppercase',
                  marginBottom: 8,
                  fontWeight: 500,
                }}
              >
                {eyebrowLabel}
              </div>
              <div
                style={{
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: 48,
                  fontWeight: 400,
                  letterSpacing: -1.2,
                  lineHeight: 1.05,
                  marginBottom: 12,
                  color: 'var(--ed-fg)',
                }}
              >
                {ladder.label}
              </div>
              <div
                style={{
                  color: 'var(--ed-fg-dim)',
                  maxWidth: 540,
                  lineHeight: 1.55,
                  fontSize: 14,
                }}
              >
                The 100 problems most-solved by users gaining 600+ rating while
                at this level. Complete to unlock{' '}
                <span style={{ color: tone, fontWeight: 500 }}>
                  {ladder.target}
                </span>
                .
              </div>
            </div>

            {/* Stat grid (4 mini cards) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
                minWidth: 240,
              }}
            >
              <MiniStat v={stats.solved} label="Solved" tone="var(--ed-ok)" />
              <MiniStat
                v={stats.attempted}
                label="Attempted"
                tone="var(--ed-warn)"
              />
              <MiniStat
                v={stats.unsolved}
                label="Untouched"
                tone="var(--ed-fg-mute)"
              />
              <MiniStat
                v={`${completionPct}%`}
                label="Complete"
                tone={tone}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Toolbar row ──────────────────────────────────────────────────── */}
      <div
        style={{
          padding: '14px 40px 10px',
          borderBottom: '1px solid var(--ed-line-soft)',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          background: 'var(--ed-bg-0)',
        }}
      >
        <Segmented<FilterVal>
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'All', count: allProblems.length },
            { value: 'unsolved', label: 'Untouched', count: stats.unsolved },
            { value: 'attempted', label: 'Attempted', count: stats.attempted },
            { value: 'solved', label: 'Solved', count: stats.solved },
          ]}
        />

        <div style={{ flex: 1 }} />

        {/* Search input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--ed-bg-1)',
            border: '1px solid var(--ed-line)',
            padding: '7px 12px',
            borderRadius: 8,
          }}
        >
          <span style={{ color: 'var(--ed-fg-faint)', fontSize: 14 }}>⌕</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find a problem…"
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--ed-fg)',
              fontFamily: 'inherit',
              fontSize: 13,
              width: 200,
            }}
          />
        </div>
      </div>

      {/* ── Tag list row ─────────────────────────────────────────────────── */}
      <div
        style={{
          padding: '10px 40px 14px',
          borderBottom: '1px solid var(--ed-line)',
          display: 'flex',
          alignItems: 'baseline',
          gap: 14,
          flexWrap: 'wrap',
          background: 'var(--ed-bg-0)',
        }}
      >
        <span
          style={{
            fontFamily: "'DM Mono', ui-monospace, monospace",
            fontSize: 10.5,
            color: 'var(--ed-fg-faint)',
            letterSpacing: 1.5,
            textTransform: 'uppercase',
          }}
        >
          Topics
        </span>

        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            flexWrap: 'wrap',
            flex: 1,
            fontSize: 12.5,
          }}
        >
          {allTags.map((tag, i) => {
            const isActive = activeTag === tag;
            return (
              <span key={tag} style={{ display: 'inline-flex', alignItems: 'baseline' }}>
                {i > 0 && (
                  <span
                    style={{
                      color: 'var(--ed-fg-faint)',
                      padding: '0 8px',
                    }}
                  >
                    ·
                  </span>
                )}
                <button
                  onClick={() => setActiveTag(isActive ? null : tag)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '2px 0',
                    color: isActive ? 'var(--ed-pri)' : 'var(--ed-fg-dim)',
                    fontFamily: 'inherit',
                    fontSize: 13,
                    cursor: 'pointer',
                    textDecoration: isActive ? 'underline' : 'none',
                    textUnderlineOffset: 4,
                    textDecorationThickness: '1px',
                    fontWeight: isActive ? 500 : 400,
                    transition: 'color 0.12s',
                  }}
                >
                  {tag}
                </button>
              </span>
            );
          })}

          {activeTag && (
            <button
              onClick={() => setActiveTag(null)}
              style={{
                marginLeft: 14,
                background: 'transparent',
                border: 'none',
                padding: 0,
                color: 'var(--ed-fg-faint)',
                fontFamily: "'DM Mono', ui-monospace, monospace",
                fontSize: 10.5,
                cursor: 'pointer',
                letterSpacing: 0.5,
              }}
            >
              clear ×
            </button>
          )}
        </div>
      </div>

      {/* ── Problem table ────────────────────────────────────────────────── */}
      <div style={{ padding: '8px 40px 40px' }}>
        {/* Column header row — must match ProblemRow grid + padding exactly. */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '32px 28px 80px minmax(220px, 1fr) minmax(280px, 1.4fr) 64px',
            padding: '6px 10px',
            gap: 14,
            marginBottom: 4,
          }}
        >
          {(['#', ' ', 'ID', 'Problem', 'Tags', 'Rating'] as const).map(
            (col, i) => (
              <span
                key={i}
                style={{
                  fontFamily: "'DM Mono', ui-monospace, monospace",
                  fontSize: 9.5,
                  color: 'var(--ed-fg-faint)',
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  textAlign: i === 5 ? 'right' : 'left',
                }}
              >
                {col}
              </span>
            ),
          )}
        </div>

        {filtered.length === 0 ? (
          <div
            style={{
              padding: '48px 0',
              textAlign: 'center',
              color: 'var(--ed-fg-faint)',
              fontFamily: "'DM Mono', ui-monospace, monospace",
              fontSize: 12,
              letterSpacing: 0.3,
            }}
          >
            Nothing matches that combination.
          </div>
        ) : (
          filtered.map((p, i) => (
            <ProblemRow key={p.id} problem={p} index={i} />
          ))
        )}
      </div>
    </div>
  );
}

// ── MiniStat card ─────────────────────────────────────────────────────────
type MiniStatProps = {
  v: number | string;
  label: string;
  tone?: string;
};

function MiniStat({ v, label, tone }: MiniStatProps) {
  return (
    <div
      style={{
        background: 'var(--ed-bg-1)',
        border: '1px solid var(--ed-line)',
        borderRadius: 8,
        padding: '10px 12px',
        boxShadow: 'var(--ed-glow)',
      }}
    >
      <div
        style={{
          fontFamily: "'DM Sans', system-ui, sans-serif",
          fontSize: 24,
          fontWeight: 400,
          color: tone || 'var(--ed-fg)',
          letterSpacing: -0.6,
          lineHeight: 1,
        }}
      >
        {v}
      </div>
      <div
        style={{
          fontSize: 11,
          color: 'var(--ed-fg-mute)',
          marginTop: 4,
          fontFamily: "'DM Mono', ui-monospace, monospace",
          letterSpacing: 0.3,
        }}
      >
        {label}
      </div>
    </div>
  );
}
