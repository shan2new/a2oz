import { useMemo, useState } from 'react';
import { Panel } from '@/components/primitives/Panel';
import { Header } from '@/components/primitives/Header';
import { Eyebrow } from '@/components/primitives/Eyebrow';
import { Input } from '@/components/ui/input';
import { useCatalogStore } from '@/store/catalogStore';
import { useUserStore } from '@/store/userStore';

const MONO = "'DM Mono', ui-monospace, monospace";
const SANS = "'DM Sans', system-ui, sans-serif";

type Cat = { name: string; count: number; solved: number; hot: boolean };
type Group = { key: string; label: string; cats: Cat[]; tone: string };

// Semantic group tones — each section gets a distinct accent so users can
// scan / locate. Reusing the rating-tier palette to stay on-system.
const GROUP_TONES: Record<string, string> = {
  fundamentals: 'var(--ed-r-sage)',
  search: 'var(--ed-r-teal)',
  dp: 'var(--ed-r-indigo)',
  graphs: 'var(--ed-r-plum)',
  'data-structures': 'var(--ed-r-amber)',
  math: 'var(--ed-r-red)',
  strings: 'var(--ed-r-gray)',
  geometry: 'var(--ed-r-gray)',
  misc: 'var(--ed-r-gray)',
  other: 'var(--ed-r-gray)',
};

// Codeforces tag taxonomy, grouped by problem-solving discipline.
// Tags are the canonical set returned by problemset.problems (lowercased
// already). Anything CF adds later falls into "other".
//
// Reference: cp-algorithms.com index, USACO Guide topic structure, and
// the way CF categorizes problems for filtering.
const GROUPS: { key: string; label: string; tags: string[] }[] = [
  {
    key: 'fundamentals',
    label: 'Fundamentals',
    tags: [
      'implementation',
      'brute force',
      'sortings',
      'two pointers',
      'greedy',
      'constructive algorithms',
    ],
  },
  {
    key: 'search',
    label: 'Search & reduction',
    tags: [
      'binary search',
      'ternary search',
      'divide and conquer',
      'meet-in-the-middle',
    ],
  },
  {
    key: 'dp',
    label: 'Dynamic programming',
    tags: ['dp', 'bitmasks'],
  },
  {
    key: 'graphs',
    label: 'Graphs & trees',
    tags: [
      'graphs',
      'trees',
      'dfs and similar',
      'shortest paths',
      'graph matchings',
      'flows',
      '2-sat',
    ],
  },
  {
    key: 'data-structures',
    label: 'Data structures',
    tags: ['data structures', 'dsu', 'hashing'],
  },
  {
    key: 'math',
    label: 'Math',
    tags: [
      'math',
      'number theory',
      'combinatorics',
      'probabilities',
      'games',
      'matrices',
      'chinese remainder theorem',
      'fft',
    ],
  },
  {
    key: 'strings',
    label: 'Strings',
    tags: ['strings', 'string suffix structures', 'expression parsing'],
  },
  {
    key: 'geometry',
    label: 'Geometry',
    tags: ['geometry'],
  },
  {
    key: 'misc',
    label: 'Misc',
    tags: ['interactive', 'schedules', '*special'],
  },
];

const TAG_TO_GROUP = new Map<string, string>();
for (const g of GROUPS) {
  for (const t of g.tags) TAG_TO_GROUP.set(t, g.key);
}

function groupKeyFor(tag: string): string {
  return TAG_TO_GROUP.get(tag.toLowerCase()) ?? 'other';
}

export default function Categories() {
  const [q, setQ] = useState('');
  const catalog = useCatalogStore((s) => s.list);
  const byId = useCatalogStore((s) => s.byId);
  const solvedIds = useUserStore((s) => s.solvedIds);
  const localUnsolved = useUserStore((s) => s.localUnsolved);

  // Derive categories from the real CF catalog: count by tag, solved count
  // by joining solvedIds → catalog → tags.
  const categories = useMemo<Cat[]>(() => {
    const total: Record<string, number> = {};
    const solvedSet = new Set(solvedIds);
    for (const id of localUnsolved) solvedSet.delete(id);

    for (const p of catalog) {
      for (const t of p.tags) total[t] = (total[t] ?? 0) + 1;
    }

    const solved: Record<string, number> = {};
    for (const id of solvedSet) {
      const p = byId.get(id);
      if (!p) continue;
      for (const t of p.tags) solved[t] = (solved[t] ?? 0) + 1;
    }

    const ranked = Object.entries(total)
      .map(([name, count]): Cat => ({
        name,
        count,
        solved: solved[name] ?? 0,
        hot: false,
      }))
      .sort((a, b) => b.count - a.count);

    // Top 5 by total = "hot"
    for (let i = 0; i < Math.min(5, ranked.length); i++) ranked[i].hot = true;

    return ranked;
  }, [catalog, solvedIds, localUnsolved]);

  const filtered = useMemo(
    () =>
      categories.filter((c) =>
        c.name.toLowerCase().includes(q.toLowerCase()),
      ),
    [categories, q],
  );

  // Group filtered cats into semantic sections (Foundations / Graphs / etc).
  const groups = useMemo<Group[]>(() => {
    const map = new Map<string, Cat[]>();
    for (const c of filtered) {
      const k = groupKeyFor(c.name);
      const arr = map.get(k) ?? [];
      arr.push(c);
      map.set(k, arr);
    }
    const out: Group[] = [];
    for (const g of GROUPS) {
      const cats = map.get(g.key);
      if (!cats || cats.length === 0) continue;
      out.push({ key: g.key, label: g.label, cats, tone: GROUP_TONES[g.key] });
    }
    const otherCats = map.get('other');
    if (otherCats && otherCats.length) {
      out.push({ key: 'other', label: 'Other', cats: otherCats, tone: GROUP_TONES.other });
    }
    return out;
  }, [filtered]);

  return (
    <div style={{ padding: 'var(--ed-screen-pad)' }}>
      <Header
        eyebrow="Topics"
        title="Categories."
        subtitle={`${categories.length} tags · ${catalog.length.toLocaleString()} problems indexed`}
        right={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--ed-bg-1)',
              border: '1px solid var(--ed-line)',
              padding: '8px 14px',
              borderRadius: 8,
              flexShrink: 0,
            }}
          >
            <span style={{ color: 'var(--ed-fg-faint)', fontSize: 15 }}>⌕</span>
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter topics…"
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--ed-fg)',
                fontFamily: SANS,
                fontSize: 13,
                width: 200,
                boxShadow: 'none',
                height: 'auto',
                padding: 0,
              }}
              className="focus-visible:ring-0 focus-visible:border-transparent"
            />
          </div>
        }
      />

      {catalog.length === 0 ? (
        <div
          style={{
            padding: '60px 0',
            color: 'var(--ed-fg-mute)',
            fontFamily: MONO,
            fontSize: 12,
          }}
        >
          Catalog still loading… (categories appear once the Codeforces problem
          set has been fetched at least once)
        </div>
      ) : groups.length === 0 ? (
        <div
          style={{
            padding: '60px 0',
            color: 'var(--ed-fg-mute)',
            fontFamily: MONO,
            fontSize: 12,
          }}
        >
          Nothing matches that filter.
        </div>
      ) : (
        groups.map((group, gIdx) => (
          <div
            key={group.key}
            style={{ marginBottom: gIdx === groups.length - 1 ? 0 : 32 }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 14,
                marginBottom: 14,
              }}
            >
              <Eyebrow style={{ marginBottom: 0, color: group.tone }}>
                {group.label}
              </Eyebrow>
              <span
                style={{
                  fontFamily: "'Geist Mono', ui-monospace, monospace",
                  fontSize: 10,
                  color: 'var(--ed-fg-faint)',
                  letterSpacing: 0.3,
                }}
              >
                {group.cats.length} tag{group.cats.length === 1 ? '' : 's'}
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 16,
              }}
            >
              {group.cats.map((cat) => {
            const fillPct = cat.count > 0 ? (cat.solved / cat.count) * 100 : 0;

            return (
              <Panel
                key={cat.name}
                padded={false}
                interactive
                style={{
                  padding: '14px 16px',
                  borderRadius: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* HOT pill — top-right */}
                {cat.hot && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 14,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Geist Mono', ui-monospace, monospace",
                        fontSize: 9.5,
                        padding: '3px 9px',
                        background: 'transparent',
                        color: 'var(--ed-fg-mute)',
                        border: '1px solid var(--ed-line)',
                        borderRadius: 999,
                        letterSpacing: 0.6,
                        textTransform: 'uppercase',
                      }}
                    >
                      hot
                    </span>
                  </div>
                )}

                {/* Body: numeral + label/progress */}
                <div
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      flexShrink: 0,
                      minWidth: 32,
                      textAlign: 'left',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Geist Mono', ui-monospace, monospace",
                        fontWeight: 200,
                        fontSize: 44,
                        color: 'var(--ed-fg)',
                        letterSpacing: -2,
                        lineHeight: 0.85,
                        fontFeatureSettings: '"tnum", "zero"',
                      }}
                    >
                      {cat.solved}
                    </div>
                  </div>

                  {/* Label + progress */}
                  <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
                    <div
                      style={{
                        fontFamily: "'Geist', system-ui, sans-serif",
                        fontSize: 14,
                        fontWeight: 500,
                        letterSpacing: -0.3,
                        color: 'var(--ed-fg)',
                        marginBottom: 2,
                        lineHeight: 1.25,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {cat.name}
                    </div>
                    <div
                      style={{
                        fontFamily: MONO,
                        fontSize: 10,
                        color: 'var(--ed-fg-mute)',
                        letterSpacing: 0.2,
                        marginBottom: 12,
                        fontFeatureSettings: '"tnum"',
                      }}
                    >
                      of {cat.count.toLocaleString()}
                    </div>

                    {/* Progress bar + % */}
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
                            width: `${fillPct}%`,
                            background: 'var(--ed-fg-dim)',
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
                          minWidth: 32,
                          textAlign: 'right',
                          fontFeatureSettings: '"tnum"',
                        }}
                      >
                        {Math.round(fillPct)}%
                      </span>
                    </div>
                  </div>
                </div>
              </Panel>
            );
          })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
