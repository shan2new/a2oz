import React from 'react';
import { cn } from '@/lib/utils';

type PanelProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * When true (default), apply `var(--ed-panel-pad)` as padding.
   */
  padded?: boolean;
  /**
   * When true, adds a hover lift and elevated shadow matching the design system
   * "interactive card" pattern (translateY(-1px) + elevated shadow).
   */
  interactive?: boolean;
};

/**
 * Generic raised surface — bg-1, 1px solid border, radius 12, --ed-glow shadow.
 * Forwards all standard div props (className, style, children, event handlers, etc.).
 *
 * Usage:
 *   <Panel>content</Panel>
 *   <Panel padded={false} interactive>clickable card</Panel>
 */
export function Panel({
  padded = true,
  interactive = false,
  className,
  style,
  children,
  ...rest
}: PanelProps) {
  return (
    <div
      {...rest}
      className={cn(
        interactive && 'ed-card',   // ed-card class adds CSS hover lift from index.css
        className,
      )}
      style={{
        background: 'var(--ed-bg-1)',
        border: '1px solid var(--ed-line)',
        borderRadius: 12,
        boxShadow: 'var(--ed-glow)',
        ...(padded ? { padding: 'var(--ed-panel-pad)' } : {}),
        ...(interactive
          ? {
              cursor: 'pointer',
              transition: 'transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease',
            }
          : {}),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default Panel;
