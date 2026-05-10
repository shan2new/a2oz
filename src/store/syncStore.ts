// Sync banner state. Default 'live' / '2m ago' — Wave 3 wires the SyncBanner
// component to read from this. No persistence (sync state is session-scoped).

import { create } from 'zustand';

export type SyncStatus = 'live' | 'syncing' | 'broken';

type SyncState = {
  status: SyncStatus;
  lastSyncedAgo: string;
  setStatus: (s: SyncStatus) => void;
};

export const useSyncStore = create<SyncState>((set) => ({
  status: 'live',
  lastSyncedAgo: '2m ago',
  setStatus: (status) => set({ status }),
}));
