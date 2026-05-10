import React from 'react';
import { cn } from '@/lib/utils';

type EyebrowProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Small mono uppercase label — used for section captions, page eyebrows, etc.
 * Matches the EHeader eyebrow style from editorial-home.jsx and the spec:
 *   ~10px, uppercase, tracking ~1.5–1.8em, color var(--ed-fg-mute), weight 500, font-mono.
 */
export function Eyebrow({ children, className, style }: EyebrowProps) {
  return (
    <div
      className={cn(className)}
      style={{
        fontFamily: "'DM Mono', ui-monospace, monospace",
        fontSize: 10.5,
        fontWeight: 500,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.18em',
        color: 'var(--ed-fg-mute)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        ...style,
      }}
    >
      {/* decorative em-rule matching editorial-home.jsx prototype */}
      <span
        style={{
          display: 'inline-block',
          width: 18,
          height: 1,
          background: 'var(--ed-fg-faint)',
          opacity: 0.7,
          flexShrink: 0,
        }}
        aria-hidden="true"
      />
      <span>{children}</span>
    </div>
  );
}

export default Eyebrow;
