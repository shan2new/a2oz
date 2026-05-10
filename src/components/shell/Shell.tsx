// Shell — top-level layout: 252px sidebar + scrolling main area.
// SyncBanner mounts conditionally at the top of main when sync is broken.
// AnimatePresence wraps the Outlet for fade+lift route transitions.

import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { SyncBanner } from './SyncBanner';
import { TweaksPanel } from '@/components/tweaks/TweaksPanel';

export function Shell() {
  const location = useLocation();

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
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.26, ease: [0.2, 0.7, 0.2, 1] }}
            style={{ flex: 1 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <TweaksPanel />
    </div>
  );
}
