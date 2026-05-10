// Cross-component user actions. Both the Sidebar profile dock and the
// TweaksPanel surface "Resync" + "Sign out"; this keeps the bodies in one place.

import type { NavigateFunction } from 'react-router-dom';
import { useUserStore } from '@/store/userStore';

export const resyncNow = (): Promise<void> =>
  useUserStore.getState().syncNow().catch(() => {});

export const signOut = async (navigate: NavigateFunction): Promise<void> => {
  await useUserStore.getState().clearHandle();
  navigate('/onboarding');
};
