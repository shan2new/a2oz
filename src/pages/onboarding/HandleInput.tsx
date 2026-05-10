import React from 'react';

type HandleInputProps = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

export function HandleInput({ value, onChange, onSubmit, disabled }: HandleInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !disabled) onSubmit();
  };

  return (
    <div style={{ width: '100%', maxWidth: 640, padding: '0 24px' }}>
      {/* Eyebrow */}
      <div style={{
        fontFamily: "'DM Mono', ui-monospace, monospace",
        fontSize: 10.5,
        color: 'var(--ed-fg-faint)',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span style={{ width: 14, height: 1, background: 'var(--ed-fg-faint)', display: 'inline-block' }} />
        {disabled ? (
          <>
            Connecting
            <span className="ed-dot-blink" style={{ marginLeft: 2 }}>
              <span>.</span><span>.</span><span>.</span>
            </span>
          </>
        ) : (
          'Setup · 1 of 2'
        )}
      </div>

      {/* Headline */}
      <div style={{
        fontFamily: "'Instrument Serif', ui-serif, serif",
        fontSize: 52,
        fontWeight: 400,
        letterSpacing: -1.6,
        lineHeight: 1.03,
        marginBottom: 16,
        color: 'var(--ed-fg)',
      }}>
        <span style={{ color: 'var(--ed-fg-dim)' }}>Tell us</span> who<br />
        you are on CF.
      </div>

      {/* Subtitle */}
      <div style={{
        color: 'var(--ed-fg-dim)',
        fontSize: 15,
        lineHeight: 1.6,
        maxWidth: 500,
        marginBottom: 32,
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}>
        A2OJ pulls your solved set, contests, and rating directly from Codeforces. No password — only your handle.
      </div>

      {/* Input card */}
      <div style={{
        background: 'var(--ed-bg-1)',
        border: `1px solid ${disabled ? 'var(--ed-pri)' : 'var(--ed-line)'}`,
        borderRadius: 12,
        padding: '6px 6px 6px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        boxShadow: 'var(--ed-glow)',
        maxWidth: 540,
        marginBottom: 18,
        transition: 'border-color .25s ease',
      }}>
        <span style={{
          fontFamily: "'DM Mono', ui-monospace, monospace",
          fontSize: 13,
          color: 'var(--ed-fg-faint)',
          letterSpacing: 0.3,
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
          codeforces.com/profile/
        </span>
        <input
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="your_handle"
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--ed-fg)',
            fontFamily: "'DM Mono', ui-monospace, monospace",
            fontSize: 15,
            fontWeight: 500,
            flex: 1,
            padding: '14px 0',
            letterSpacing: 0.3,
            minWidth: 0,
          }}
        />
        <button
          onClick={() => !disabled && onSubmit()}
          disabled={disabled}
          style={{
            background: disabled ? 'var(--ed-bg-2)' : 'var(--ed-fg)',
            color: disabled ? 'var(--ed-fg-mute)' : 'var(--ed-bg-0)',
            border: 'none',
            padding: '12px 22px',
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: 13,
            fontWeight: 500,
            borderRadius: 8,
            cursor: disabled ? 'default' : 'pointer',
            transition: 'background .2s ease, color .2s ease',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {disabled ? 'Working…' : 'Connect'}
        </button>
      </div>

      {/* Helper text — only when not disabled */}
      {!disabled && (
        <div style={{
          fontFamily: "'DM Mono', ui-monospace, monospace",
          fontSize: 11,
          color: 'var(--ed-fg-faint)',
          letterSpacing: 0.3,
          marginBottom: 40,
        }}>
          Press Enter or hit Connect. We'll fetch your profile in a couple seconds.
        </div>
      )}

      {/* Feature grid — only when not connecting */}
      {!disabled && (
        <div style={{ borderTop: '1px solid var(--ed-line)', paddingTop: 28 }}>
          <div style={{
            fontFamily: "'DM Mono', ui-monospace, monospace",
            fontSize: 10.5,
            color: 'var(--ed-fg-mute)',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            marginBottom: 18,
          }}>
            What you'll unlock
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { n: '01', t: 'Live ladder progress', d: 'See exactly how many problems stand between you and the next tier.' },
              { n: '02', t: 'Strength/weakness map', d: 'Tag-level breakdown across 8,148 indexed Codeforces problems.' },
              { n: '03', t: 'Streak & cadence', d: '90-day activity calendar tracking practice consistency.' },
            ].map((x) => (
              <div key={x.n} style={{ padding: '16px 4px 0', borderTop: '2px solid var(--ed-fg)' }}>
                <div style={{
                  fontFamily: "'DM Mono', ui-monospace, monospace",
                  fontSize: 10,
                  color: 'var(--ed-fg-faint)',
                  letterSpacing: '0.15em',
                  marginBottom: 10,
                }}>
                  {x.n}
                </div>
                <div style={{
                  fontFamily: "'Instrument Serif', ui-serif, serif",
                  fontSize: 17,
                  fontWeight: 400,
                  marginBottom: 6,
                  letterSpacing: -0.2,
                  color: 'var(--ed-fg)',
                }}>
                  {x.t}
                </div>
                <div style={{
                  fontSize: 12.5,
                  color: 'var(--ed-fg-dim)',
                  lineHeight: 1.55,
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                }}>
                  {x.d}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
