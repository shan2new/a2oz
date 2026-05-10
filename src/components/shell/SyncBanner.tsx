// SyncBanner — shown at the top of <main> when something needs the user's
// attention: an error from the last sync, an offline browser, or a stale
// cache (> 24 h since the last successful sync).

import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/userStore';
import { relativeFromNow } from '@/lib/time';

const STALE_MS = 24 * 60 * 60 * 1000;

export function SyncBanner() {
  const status = useUserStore((s) => s.status);
  const error = useUserStore((s) => s.error);
  const lastSyncedAt = useUserStore((s) => s.lastSyncedAt);
  const handle = useUserStore((s) => s.handle);

  const [online, setOnline] = useState(typeof navigator === 'undefined' || navigator.onLine);
  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const isStale = !!lastSyncedAt && Date.now() - lastSyncedAt > STALE_MS;

  let banner: { kind: 'error' | 'warn'; message: React.ReactNode; action?: React.ReactNode } | null =
    null;

  if (status === 'error' && error) {
    banner = {
      kind: 'error',
      message: <>Sync failed — {error}</>,
      action: handle ? (
        <RetryButton tone="var(--ed-err)" onClick={() => useUserStore.getState().syncNow()} />
      ) : null,
    };
  } else if (!online) {
    banner = {
      kind: 'warn',
      message: <>Offline — showing cached data. Changes will sync when you're back online.</>,
    };
  } else if (handle && isStale) {
    banner = {
      kind: 'warn',
      message: <>Cache is {relativeFromNow(lastSyncedAt!)} old.</>,
      action: <RetryButton tone="var(--ed-pri)" onClick={() => useUserStore.getState().syncNow()} />,
    };
  }

  if (!banner) return null;

  const tone = banner.kind === 'error' ? 'var(--ed-err)' : 'var(--ed-warn)';

  return (
    <div
      style={{
        background: `color-mix(in oklab, ${tone} 12%, var(--ed-bg-1))`,
        borderBottom: `1px solid ${tone}`,
        borderLeft: `2px solid ${tone}`,
        padding: '10px 40px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        fontSize: 13,
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <span
        className="ed-pulse"
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: tone,
          flexShrink: 0,
        }}
      />
      <span style={{ color: 'var(--ed-fg-dim)' }}>{banner.message}</span>
      {banner.action}
    </div>
  );
}

function RetryButton({ tone, onClick }: { tone: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'transparent',
        border: 'none',
        color: tone,
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
  );
}
