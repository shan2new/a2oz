import { Navigate } from 'react-router-dom';
import { useUserStore } from '@/store/userStore';
import type { ReactNode } from 'react';

// Gate on `handle` (sync-rehydrated by the persist middleware) rather than
// `user` (the adapted view, only populated after the async bootstrap+sync
// completes). Otherwise a refresh briefly sees user=null and bounces to
// /onboarding before bootstrap finishes.
export function RequireHandle({ children }: { children: ReactNode }) {
  const handle = useUserStore((s) => s.handle);
  if (!handle) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}
