import { useState } from 'react';
import { Panel } from '@/components/primitives/Panel';
import { Header } from '@/components/primitives/Header';
import { Input } from '@/components/ui/input';
import { CATEGORIES } from '@/data/categories';

const MONO = "'DM Mono', ui-monospace, monospace";
const SANS = "'DM Sans', system-ui, sans-serif";

const maxCount = Math.max(...CATEGORIES.map((c) => c.count));

export default function Categories() {
  const [q, setQ] = useState('');

  const filtered = CATEGORIES.filter((c) =>
    c.name.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div style={{ padding: 'var(--ed-screen-pad)' }}>
      <Header
        eyebrow="Topics"
        title="Categories."
        subtitle="Drill into the patterns you want to master."
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

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--ed-section-gap)',
        }}
      >
        {filtered.map((cat) => {
          const fillPct = (cat.count / maxCount) * 100;

          return (
            <Panel
              key={cat.name}
              padded={false}
              interactive
              style={{
                padding: '18px 20px',
                borderRadius: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 0,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor =
                  'var(--ed-r-indigo)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor =
                  'var(--ed-line)';
              }}
            >
              {/* Top row: name + HOT badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: SANS,
                    fontSize: 18,
                    fontWeight: 400,
                    letterSpacing: -0.2,
                    color: 'var(--ed-fg)',
                    lineHeight: 1.2,
                  }}
                >
                  {cat.name}
                </span>

                {cat.hot && (
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 9,
                      fontWeight: 500,
                      textTransform: 'uppercase' as const,
                      letterSpacing: '0.12em',
                      color: 'var(--ed-warn)',
                      background:
                        'color-mix(in oklab, var(--ed-warn) 18%, transparent)',
                      padding: '2px 7px',
                      borderRadius: 4,
                      flexShrink: 0,
                      marginLeft: 8,
                    }}
                  >
                    HOT
                  </span>
                )}
              </div>

              {/* Problem count */}
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  color: 'var(--ed-fg-mute)',
                  letterSpacing: 0.2,
                  marginBottom: 14,
                  fontFeatureSettings: '"tnum", "zero"',
                }}
              >
                {cat.count.toLocaleString()} problems
              </div>

              {/* Progress bar */}
              <div
                style={{
                  height: 2,
                  background: 'var(--ed-bg-2)',
                  borderRadius: 1,
                  overflow: 'hidden',
                  marginTop: 'auto',
                }}
              >
                <div
                  style={{
                    width: `${fillPct}%`,
                    height: '100%',
                    background: 'var(--ed-r-indigo)',
                    borderRadius: 1,
                  }}
                />
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
