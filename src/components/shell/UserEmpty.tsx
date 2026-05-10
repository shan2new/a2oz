// UserEmpty — shown in the sidebar when no Codeforces handle is linked.
// Subdued, dashed card pointing the user to /onboarding.

import { Link } from 'react-router-dom';

export function UserEmpty() {
  return (
    <div
      style={{
        background: 'var(--ed-bg-1)',
        border: '1px dashed var(--ed-line)',
        borderRadius: 10,
        padding: '14px 14px',
        textAlign: 'center',
      }}
    >
      {/* Avatar placeholder */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'var(--ed-bg-2)',
          border: '1px dashed var(--ed-line)',
          display: 'grid',
          placeItems: 'center',
          color: 'var(--ed-fg-faint)',
          fontSize: 14,
          margin: '0 auto 10px',
        }}
      >
        ?
      </div>

      <div
        style={{
          fontSize: 12,
          color: 'var(--ed-fg-dim)',
          marginBottom: 8,
          fontFamily: "'DM Sans', system-ui, sans-serif",
        }}
      >
        No handle linked.
      </div>

      <Link
        to="/onboarding"
        style={{
          fontFamily: "'DM Mono', ui-monospace, monospace",
          fontSize: 10.5,
          color: 'var(--ed-pri)',
          textDecoration: 'none',
          letterSpacing: 0.2,
        }}
      >
        Link handle →
      </Link>
    </div>
  );
}
