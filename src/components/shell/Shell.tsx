// Shell — top-level layout: 252px sidebar + scrolling main area.
// SyncBanner mounts conditionally at the top of main when sync is broken.

import { Outlet } from 'react-router-dom';
import { useSyncStore } from '@/store/syncStore';
import { Sidebar } from './Sidebar';
import { SyncBanner } from './SyncBanner';

export function Shell() {
  const syncBroken = useSyncStore((s) => s.status === 'broken');

  return (
    <div
      data-ed-app
      style={{
        width: '100vw',
        height: '100vh',
        background: 'var(--ed-bg-0)',
        color: 'var(--ed-fg)',
        fontFamily: "'DM Sans', system-ui, sans-serif",
        fontSize: 14,
        lineHeight: 1.5,
        display: 'grid',
        gridTemplateColumns: '252px 1fr',
        overflow: 'hidden',
      }}
    >
      {/* Fixed sidebar column */}
      <Sidebar />

      {/* Scrolling main content */}
      <main
        style={{
          overflow: 'auto',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {syncBroken && <SyncBanner />}
        <div className="ed-page" style={{ flex: 1 }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
