
type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  count?: number;
};

type SegmentedProps<T extends string> = {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (v: T) => void;
};

/**
 * Segmented pill-row control — ported from ESegmented in editorial-detail.jsx.
 *
 * Container: bg-1, 1px border, rounded pill (radius 999), 3px padding.
 * Active option: bg-3 background, fg color, weight 500.
 * Inactive options: fg-dim color, weight 400.
 * Each option renders: label + count in mono ("All · 100").
 * Smooth background transition 200ms ease-in-out.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: SegmentedProps<T>) {
  return (
    <div
      style={{
        display: 'flex',
        background: 'var(--ed-bg-1)',
        border: '1px solid var(--ed-line)',
        borderRadius: 999,
        padding: 3,
      }}
      role="group"
      aria-label="Filter options"
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            role="radio"
            aria-checked={active}
            style={{
              background: active ? 'var(--ed-bg-3)' : 'transparent',
              border: 'none',
              color: active ? 'var(--ed-fg)' : 'var(--ed-fg-dim)',
              padding: '6px 14px',
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: 12,
              fontWeight: active ? 500 : 400,
              borderRadius: 999,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'background 200ms ease-in-out, color 200ms ease-in-out',
              whiteSpace: 'nowrap' as const,
              outline: 'none',
            }}
          >
            <span>{opt.label}</span>
            {opt.count !== undefined && (
              <span
                style={{
                  fontFamily: "'DM Mono', ui-monospace, monospace",
                  fontSize: 10.5,
                  color: active ? 'var(--ed-fg-mute)' : 'var(--ed-fg-faint)',
                  transition: 'color 200ms ease-in-out',
                }}
              >
                · {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default Segmented;
