// SyncBanner — shown at the top of <main> when syncStore.status === 'broken'.
// Amber left border, pulsing dot, last-synced timestamp, and a retry button.

import { useSyncStore } from '@/store/syncStore';

export function SyncBanner() {
  const lastSyncedAgo = useSyncStore((s) => s.lastSyncedAgo);
  const setStatus = useSyncStore((s) => s.setStatus);

  return (
    <div
      style={{
        background: 'color-mix(in oklab, var(--ed-warn) 12%, var(--ed-bg-1))',
        borderBottom: '1px solid var(--ed-warn)',
        borderLeft: '2px solid var(--ed-warn)',
        padding: '10px 40px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        fontSize: 13,
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      {/* Pulsing amber dot */}
      <span
        className="ed-pulse"
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: 'var(--ed-warn)',
          flexShrink: 0,
        }}
      />

      {/* Message */}
      <span style={{ color: 'var(--ed-fg)', fontWeight: 500 }}>Sync failed</span>
      <span style={{ color: 'var(--ed-fg-dim)' }}>
        — last attempt {lastSyncedAgo}.{' '}
        <button
          onClick={() => setStatus('syncing')}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--ed-pri)',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            fontWeight: 500,
            cursor: 'pointer',
            padding: 0,
            textDecoration: 'underline',
            textUnderlineOffset: 2,
          }}
        >
          Retry
        </button>
        .
      </span>
    </div>
  );
}
