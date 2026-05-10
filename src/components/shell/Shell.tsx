// Shell — top-level layout: 252px sidebar + scrolling main area.
// SyncBanner mounts conditionally at the top of main.

import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { SyncBanner } from './SyncBanner';
import { TweaksPanel } from '@/components/tweaks/TweaksPanel';

export function Shell() {
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
      <Sidebar />

      <main
        style={{
          overflow: 'auto',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <SyncBanner />
        <div style={{ flex: 1 }}>
          <Outlet />
        </div>
      </main>

      <TweaksPanel />
    </div>
  );
}
