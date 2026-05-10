import { Panel } from '@/components/primitives/Panel';
import { Header } from '@/components/primitives/Header';
import { Eyebrow } from '@/components/primitives/Eyebrow';
import { USER } from '@/data/user';
import { PROBLEMS } from '@/data/problems';

const MONO = "'DM Mono', ui-monospace, monospace";
const SANS = "'DM Sans', system-ui, sans-serif";

// ── Stat card ─────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: string;
}) {
  return (
    <Panel padded style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <Eyebrow style={{ marginBottom: 12 }}>{label}</Eyebrow>
      <div
        style={{
          fontFamily: "'Geist', system-ui, sans-serif",
          fontSize: 40,
          fontWeight: 400,
          letterSpacing: -1.4,
          lineHeight: 0.95,
          color: tone || 'var(--ed-fg)',
          fontFeatureSettings: '"tnum", "zero"',
        }}
      >
        {value}
      </div>
      {hint && (
        <div
          style={{
            fontFamily: MONO,
            fontSize: 10.5,
            color: 'var(--ed-fg-faint)',
            letterSpacing: 0.3,
            marginTop: 6,
          }}
        >
          {hint}
        </div>
      )}
    </Panel>
  );
}

// ── Heatmap cell colour ───────────────────────────────────────────────────
function heatColor(v: number): string {
  if (v === 0) return 'var(--ed-bg-2)';
  if (v === 1) return 'color-mix(in oklab, var(--ed-r-teal) 22%, var(--ed-bg-2))';
  if (v === 2) return 'color-mix(in oklab, var(--ed-r-teal) 40%, var(--ed-bg-2))';
  if (v === 3) return 'color-mix(in oklab, var(--ed-r-teal) 58%, var(--ed-bg-2))';
  if (v === 4) return 'color-mix(in oklab, var(--ed-r-teal) 74%, var(--ed-bg-2))';
  // v >= 5
  return 'var(--ed-r-teal)';
}

// ── Tag frequency from PROBLEMS ───────────────────────────────────────────
function computeTopTags(n: number): { tag: string; count: number }[] {
  const freq: Record<string, number> = {};
  for (const p of PROBLEMS) {
    if (p.status !== 'solved') continue;
    for (const t of p.tags) {
      freq[t] = (freq[t] ?? 0) + 1;
    }
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([tag, count]) => ({ tag, count }));
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function Progress() {
  const u = USER;
  const totalSolves = u.activity.reduce((a, b) => a + b, 0);

  const topTags = computeTopTags(8);
  const maxTagCount = topTags[0]?.count ?? 1;

  return (
    <div style={{ padding: 'var(--ed-screen-pad)' }}>
      <Header
        eyebrow="Trajectory"
        title="Progress."
        subtitle="What you've solved, when, and where you're strong."
      />

      {/* ── 5 Stat cards ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 'var(--ed-section-gap)',
          marginBottom: 'var(--ed-section-gap)',
        }}
      >
        <StatCard label="Solved" value={u.solvedTotal} hint="all-time" />
        <StatCard label="Contests" value={u.contests} hint="rated" />
        <StatCard
          label="Streak"
          value={`${u.streak}d`}
          hint="best 21d"
          tone="var(--ed-r-teal)"
        />
        <StatCard
          label="Peak rating"
          value={u.maxRating}
          hint="all-time high"
          tone="var(--ed-r-amber)"
        />
        <StatCard
          label="Current rating"
          value={u.rating}
          hint={`${u.maxRating - u.rating} from peak`}
          tone="var(--ed-r-indigo)"
        />
      </div>

      {/* ── Lower two-col layout: heatmap + tag chart ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 'var(--ed-section-gap)',
        }}
      >
        {/* Heatmap panel */}
        <Panel padded style={{ padding: '20px 22px' }}>
          {/* Header row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: 18,
            }}
          >
            <Eyebrow>Last 90 days</Eyebrow>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 10.5,
                color: 'var(--ed-fg-mute)',
                letterSpacing: 0.3,
                fontFeatureSettings: '"tnum"',
              }}
            >
              {totalSolves} solves
            </span>
          </div>

          {/* 15 × 6 grid, fixed 12 px cells */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(15, 12px)',
              gridTemplateRows: 'repeat(6, 12px)',
              gap: 4,
            }}
          >
            {u.activity.map((v, i) => (
              <div
                key={i}
                title={`Day ${i + 1}: ${v} solve${v !== 1 ? 's' : ''}`}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  background: heatColor(v),
                  transition: 'transform 0.12s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform =
                    'scale(1.25)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform =
                    'scale(1)';
                }}
              />
            ))}
          </div>

          {/* Legend */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 14,
              fontFamily: MONO,
              fontSize: 10.5,
              color: 'var(--ed-fg-faint)',
              letterSpacing: 0.3,
            }}
          >
            <span>90d ago</span>
            <span
              style={{ display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <span>less</span>
              {[0, 1, 3, 5].map((v) => (
                <span
                  key={v}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: heatColor(v),
                  }}
                />
              ))}
              <span>more</span>
            </span>
            <span>today</span>
          </div>
        </Panel>

        {/* Strongest tags panel */}
        <Panel padded style={{ padding: '20px 22px' }}>
          <Eyebrow style={{ marginBottom: 18 }}>Strongest tags</Eyebrow>

          {topTags.map(({ tag, count }) => {
            const pct = count / maxTagCount;
            return (
              <div key={tag} style={{ marginBottom: 12 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: 5,
                  }}
                >
                  <span
                    style={{
                      fontFamily: SANS,
                      fontSize: 13,
                      color: 'var(--ed-fg)',
                      letterSpacing: -0.1,
                    }}
                  >
                    {tag}
                  </span>
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 10.5,
                      color: 'var(--ed-fg-mute)',
                      letterSpacing: 0.3,
                      fontFeatureSettings: '"tnum"',
                    }}
                  >
                    {count}
                  </span>
                </div>
                {/* Horizontal bar */}
                <div
                  style={{
                    height: 4,
                    background: 'var(--ed-bg-2)',
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${pct * 100}%`,
                      height: '100%',
                      background: 'var(--ed-r-indigo)',
                      borderRadius: 2,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </Panel>
      </div>
    </div>
  );
}
