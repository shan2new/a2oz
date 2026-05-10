// In-memory mirror of the cached Codeforces problem catalog.
// Bootstrap loads from IndexedDB; userStore.runSync() also calls `set()`
// after a fresh catalog fetch.

import { create } from 'zustand';
import type { CfProblem } from '@/types';
import { loadCatalog } from '@/storage/idb';

type CatalogState = {
  byId: Map<string, CfProblem>;
  list: CfProblem[];
  fetchedAt: number | null;
  bootstrap: () => Promise<void>;
  set: (problems: CfProblem[]) => void;
};

function indexById(problems: CfProblem[]): Map<string, CfProblem> {
  const m = new Map<string, CfProblem>();
  for (const p of problems) m.set(`${p.contestId}${p.index}`, p);
  return m;
}

export const useCatalogStore = create<CatalogState>()((set) => ({
  byId: new Map(),
  list: [],
  fetchedAt: null,
  bootstrap: async () => {
    const cached = await loadCatalog().catch(() => null);
    if (!cached) return;
    set({ byId: indexById(cached.problems), list: cached.problems, fetchedAt: cached.fetchedAt });
  },
  set: (problems: CfProblem[]) =>
    set({ byId: indexById(problems), list: problems, fetchedAt: Date.now() }),
}));
