import { Navigate } from 'react-router-dom';
import { useUserStore } from '@/store/userStore';
import type { ReactNode } from 'react';

export function RequireHandle({ children }: { children: ReactNode }) {
  const user = useUserStore((s) => s.user);
  if (!user) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}
