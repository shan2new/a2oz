import React from 'react';
import { Eyebrow } from './Eyebrow';

type HeaderProps = {
  /** Small mono uppercase caption above the title (optional). */
  eyebrow?: string;
  /** Page H1 — Geist 40px weight 500 letter-spacing -1.6. Required. */
  title: string;
  /** DM Sans 14px dim subtitle below the title (optional). */
  subtitle?: string;
  /** Optional right-slot content (e.g. search input, action button). */
  right?: React.ReactNode;
};

/**
 * Page header component — ported from EHeader in editorial-home.jsx.
 *
 * Layout: title+subtitle stacked left; `right` slot pinned to right.
 * Items align to baseline (flex items-end).
 * Includes a bottom border + bottom-padding matching the prototype.
 */
export function Header({ eyebrow, title, subtitle, right }: HeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 24,
        marginBottom: 36,
        paddingBottom: 22,
        borderBottom: '1px solid var(--ed-line)',
      }}
    >
      {/* Left: eyebrow + title + subtitle */}
      <div style={{ minWidth: 0 }}>
        {eyebrow && (
          <Eyebrow className="mb-4" style={{ marginBottom: 16 }}>
            {eyebrow}
          </Eyebrow>
        )}

        <div
          style={{
            fontFamily: "'Geist', system-ui, sans-serif",
            fontSize: 40,
            fontWeight: 500,
            letterSpacing: -1.6,
            lineHeight: 1.0,
            color: 'var(--ed-fg)',
          }}
        >
          {title}
        </div>

        {subtitle && (
          <div
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: 14,
              color: 'var(--ed-fg-dim)',
              marginTop: 14,
              maxWidth: 560,
              lineHeight: 1.55,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>

      {/* Right slot — rendered as-is, aligns to bottom of header */}
      {right}
    </div>
  );
}

export default Header;
