// Persisted user state. The mock USER profile is "linked" by setHandle();
// solvedIds is kept as string[] (not Set) so the persist middleware can
// serialize it cleanly to localStorage.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { USER as MOCK_USER } from '@/data/user';

type UserState = {
  user: User | null;
  solvedIds: string[];
  setHandle: (handle: string) => void;
  clearHandle: () => void;
  markSolved: (problemId: string) => void;
  unmarkSolved: (problemId: string) => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      solvedIds: [],
      setHandle: (handle: string) =>
        set({ user: { ...MOCK_USER, handle } }),
      clearHandle: () => set({ user: null, solvedIds: [] }),
      markSolved: (problemId: string) => {
        const ids = get().solvedIds;
        if (ids.includes(problemId)) return;
        set({ solvedIds: [...ids, problemId] });
      },
      unmarkSolved: (problemId: string) => {
        const ids = get().solvedIds;
        if (!ids.includes(problemId)) return;
        set({ solvedIds: ids.filter((id) => id !== problemId) });
      },
    }),
    { name: 'a2oj-user' },
  ),
);
