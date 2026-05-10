// Real-data user store. Drives everything from the Codeforces API
// (with IndexedDB caching) — no more mock data.
//
// Persistence split:
//   localStorage : handle + localUnsolved (small, must survive cold boot)
//   IndexedDB    : profile, submissions, ratingHistory, derived activity/recent
//
// Existing UI consumers use `useUserStore(s => s.user)`, which is kept as a
// derived adapter so they continue working without changes.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CfUser, CfRatingPoint, CfSubmission, User, RecentEntry } from '@/types';
import {
  getUser,
  getUserRatingHistory,
  getUserSubmissions,
  getProblemCatalog,
  CfHandleNotFound,
  CfRateLimited,
  CfNetworkError,
} from '@/api/cf';
import {
  ensureSchema,
  loadAccepted,
  saveAccepted,
  loadCatalog,
  saveCatalog,
  loadRating,
  saveRating,
  clearHandle as idbClearHandle,
  type RecentVerdict,
} from '@/storage/idb';
import { useCatalogStore } from './catalogStore';

// ── Derivation helpers ──────────────────────────────────────────────────────

function dayIndexFromUnix(secs: number, today: Date): number {
  // 0 = 89 days ago, 89 = today (UTC day boundaries to keep things stable)
  const d = new Date(secs * 1000);
  const dStart = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const tStart = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const diffDays = Math.round((tStart - dStart) / 86400000);
  return 89 - diffDays;
}

function computeActivity(submissions: CfSubmission[]): number[] {
  const out = new Array(90).fill(0);
  const today = new Date();
  for (const s of submissions) {
    if (s.verdict !== 'OK') continue;
    const i = dayIndexFromUnix(s.creationTimeSeconds, today);
    if (i >= 0 && i < 90) out[i] += 1;
  }
  return out;
}

function computeAcceptedIds(submissions: CfSubmission[]): string[] {
  const seen = new Set<string>();
  for (const s of submissions) {
    if (s.verdict !== 'OK') continue;
    const cid = s.problem.contestId;
    if (cid == null) continue;
    seen.add(`${cid}${s.problem.index}`);
  }
  return [...seen];
}

function computeRecent(submissions: CfSubmission[]): RecentVerdict[] {
  const sorted = [...submissions].sort((a, b) => b.creationTimeSeconds - a.creationTimeSeconds);
  const out: RecentVerdict[] = [];
  for (const s of sorted) {
    if (s.verdict !== 'OK' && s.verdict !== 'WRONG_ANSWER') continue;
    const cid = s.problem.contestId;
    if (cid == null) continue;
    out.push({
      problem: `${cid}${s.problem.index} – ${s.problem.name}`,
      verdict: s.verdict === 'OK' ? 'AC' : 'WA',
      date: relativeDate(s.creationTimeSeconds),
      rating: s.problem.rating,
    });
    if (out.length >= 6) break;
  }
  return out;
}

function relativeDate(secs: number): string {
  const diff = Math.max(0, Date.now() / 1000 - secs);
  const m = Math.floor(diff / 60);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
}

function computeStreak(activity: number[]): number {
  let s = 0;
  for (let i = activity.length - 1; i >= 0; i--) {
    if (activity[i] > 0) s++;
    else break;
  }
  return s;
}

function formatTenure(registrationTimeSeconds: number): string {
  const days = Math.max(0, Math.floor((Date.now() / 1000 - registrationTimeSeconds) / 86400));
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  if (years === 0 && months === 0) return `${days}d`;
  if (years === 0) return `${months}mo`;
  if (months === 0) return `${years}y`;
  return `${years}y ${months}mo`;
}

function adaptUser(
  profile: CfUser | null,
  activity: number[],
  recent: RecentVerdict[],
  solvedIds: string[],
  ratingHistory: CfRatingPoint[],
): User | null {
  if (!profile) return null;
  return {
    handle: profile.handle,
    rating: profile.rating ?? 0,
    maxRating: profile.maxRating ?? profile.rating ?? 0,
    rank: profile.rank,
    avatar: profile.titlePhoto || profile.avatar,
    joinedAgo: formatTenure(profile.registrationTimeSeconds),
    solvedTotal: solvedIds.length,
    contests: ratingHistory.length,
    streak: computeStreak(activity),
    activity,
    recent: recent as RecentEntry[],
  };
}

// ── State shape ─────────────────────────────────────────────────────────────

export type SyncPhase = 'profile' | 'rating' | 'submissions' | 'catalog' | 'computing' | 'done';
export type SyncProgress = { phase: SyncPhase; loaded: number; total?: number; message: string };

type State = {
  handle: string | null;
  localUnsolved: string[];

  profile: CfUser | null;
  solvedIds: string[];
  activity: number[];
  recent: RecentVerdict[];
  ratingHistory: CfRatingPoint[];
  lastSyncedAt: number | null;

  status: 'idle' | 'syncing' | 'error';
  syncProgress: SyncProgress | null;
  error: string | null;

  user: User | null;

  bootstrap: () => Promise<void>;
  setHandle: (h: string) => Promise<void>;
  syncNow: () => Promise<void>;
  markSolved: (id: string) => void;
  unmarkSolved: (id: string) => void;
  clearHandle: () => Promise<void>;
};

const EMPTY_ACTIVITY = new Array(90).fill(0);

// Persist only the small things; everything else is in IDB or refetched.
type PersistedSlice = { handle: string | null; localUnsolved: string[] };

export const useUserStore = create<State>()(
  persist(
    (set, get) => {
      function recomputeUser() {
        const s = get();
        // localUnsolved overrides accepted state, in either direction
        const set0 = new Set(s.solvedIds);
        for (const id of s.localUnsolved) set0.delete(id);
        const ids = [...set0];
        set({
          user: adaptUser(s.profile, s.activity, s.recent, ids, s.ratingHistory),
        });
      }

      async function runSync(handle: string) {
        const onProgress = (p: SyncProgress) => set({ syncProgress: p });
        set({ status: 'syncing', error: null, syncProgress: null });
        try {
          onProgress({ phase: 'profile', loaded: 0, message: `resolving codeforces.com/profile/${handle}…` });
          const profile = await getUser(handle);

          onProgress({ phase: 'rating', loaded: 0, message: 'fetching rating history' });
          const ratingHistory = await getUserRatingHistory(handle);
          await saveRating(handle, ratingHistory);

          onProgress({ phase: 'submissions', loaded: 0, message: 'pulling submissions' });
          const subs = await getUserSubmissions(handle, (loaded) => {
            onProgress({
              phase: 'submissions',
              loaded,
              message: `${loaded.toLocaleString()} submissions indexed`,
            });
          });

          // Catalog: reuse cache if fresh (< 7 days), else refetch.
          onProgress({ phase: 'catalog', loaded: 0, message: 'cross-referencing problem catalog' });
          const cached = await loadCatalog();
          const STALE = 7 * 24 * 60 * 60 * 1000;
          if (!cached || Date.now() - cached.fetchedAt > STALE) {
            const problems = await getProblemCatalog();
            await saveCatalog(problems);
            useCatalogStore.getState().set(problems);
          } else if (useCatalogStore.getState().list.length === 0) {
            useCatalogStore.getState().set(cached.problems);
          }

          onProgress({ phase: 'computing', loaded: 0, message: 'computing ladder progress' });
          const activity = computeActivity(subs);
          const acceptedIds = computeAcceptedIds(subs);
          const recent = computeRecent(subs);
          await saveAccepted(handle, acceptedIds, activity, recent);

          set({
            handle,
            profile,
            solvedIds: acceptedIds,
            activity,
            recent,
            ratingHistory,
            lastSyncedAt: Date.now(),
            status: 'idle',
            syncProgress: { phase: 'done', loaded: 0, message: 'ready.' },
          });
          recomputeUser();
        } catch (e) {
          let msg = 'Unknown error';
          if (e instanceof CfHandleNotFound) msg = `handle "${handle}" not found on Codeforces.`;
          else if (e instanceof CfRateLimited) msg = 'Rate-limited by Codeforces. Try again in a moment.';
          else if (e instanceof CfNetworkError) msg = e.message;
          else if (e instanceof Error) msg = e.message;
          set({ status: 'error', error: msg, syncProgress: null });
          throw e;
        }
      }

      return {
        handle: null,
        localUnsolved: [],
        profile: null,
        solvedIds: [],
        activity: EMPTY_ACTIVITY,
        recent: [],
        ratingHistory: [],
        lastSyncedAt: null,
        status: 'idle',
        syncProgress: null,
        error: null,
        user: null,

        bootstrap: async () => {
          await ensureSchema();
          // Drop legacy mock-tied state from the v1 store key.
          if (!localStorage.getItem('a2oj-migrated-v2')) {
            localStorage.removeItem('a2oj-user');
            localStorage.setItem('a2oj-migrated-v2', '1');
          }
          const handle = get().handle;
          if (!handle) return;
          // Try IDB cache first; if anything's missing, fall back to network.
          try {
            const acc = await loadAccepted(handle);
            const rh = await loadRating(handle);
            if (acc && rh) {
              // We don't cache the CfUser profile separately; refetch lightly.
              try {
                const profile = await getUser(handle);
                set({
                  profile,
                  solvedIds: acc.acceptedIds,
                  activity: acc.activity,
                  recent: acc.recent,
                  ratingHistory: rh,
                  lastSyncedAt: acc.fetchedAt,
                  status: 'idle',
                });
                recomputeUser();
                return;
              } catch {
                // network might be down; carry on with cached fields only
                set({
                  solvedIds: acc.acceptedIds,
                  activity: acc.activity,
                  recent: acc.recent,
                  ratingHistory: rh,
                  lastSyncedAt: acc.fetchedAt,
                });
                recomputeUser();
              }
            } else {
              // Cache miss — kick a full sync silently in the background.
              await runSync(handle).catch(() => {});
            }
          } catch (e) {
            console.warn('[userStore.bootstrap]', e);
          }
        },

        setHandle: async (h: string) => {
          const handle = h.trim();
          set({ handle });
          await runSync(handle);
        },

        syncNow: async () => {
          const h = get().handle;
          if (!h) return;
          await runSync(h);
        },

        markSolved: (id: string) => {
          // Remove from localUnsolved; if not in real solved, add to a local-solved overlay.
          // For now we treat marks as identical to a real solve in `user.solvedTotal`.
          const lu = get().localUnsolved.filter((x) => x !== id);
          let solvedIds = get().solvedIds;
          if (!solvedIds.includes(id)) solvedIds = [...solvedIds, id];
          set({ localUnsolved: lu, solvedIds });
          // recompute user with overrides applied
          const s = get();
          const set0 = new Set(s.solvedIds);
          for (const x of s.localUnsolved) set0.delete(x);
          set({ user: adaptUser(s.profile, s.activity, s.recent, [...set0], s.ratingHistory) });
        },
        unmarkSolved: (id: string) => {
          // Add to localUnsolved (overrides accepted) AND drop from local-solved overlay.
          const lu = get().localUnsolved;
          const next = lu.includes(id) ? lu : [...lu, id];
          const solvedIds = get().solvedIds.filter((x) => x !== id);
          set({ localUnsolved: next, solvedIds });
          const s = get();
          const set0 = new Set(s.solvedIds);
          for (const x of s.localUnsolved) set0.delete(x);
          set({ user: adaptUser(s.profile, s.activity, s.recent, [...set0], s.ratingHistory) });
        },

        clearHandle: async () => {
          const h = get().handle;
          if (h) await idbClearHandle(h).catch(() => {});
          set({
            handle: null,
            localUnsolved: [],
            profile: null,
            solvedIds: [],
            activity: EMPTY_ACTIVITY,
            recent: [],
            ratingHistory: [],
            lastSyncedAt: null,
            status: 'idle',
            syncProgress: null,
            error: null,
            user: null,
          });
        },
      };
    },
    {
      name: 'a2oj-user-v2',
      storage: createJSONStorage(() => localStorage),
      // Only persist handle + localUnsolved. Everything else is in IDB.
      partialize: (s) =>
        ({
          handle: s.handle,
          localUnsolved: s.localUnsolved,
        } as PersistedSlice as State),
    },
  ),
);
