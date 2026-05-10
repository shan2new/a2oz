// IndexedDB cache (via idb-keyval). Three logical "stores", all in one
// keyval namespace because idb-keyval is a single object store under the hood.

import { createStore, get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval';
import type { CfProblem, CfRatingPoint } from '@/types';

const DB = 'a2oj';
const STORE = 'kv';
const store = createStore(DB, STORE);

const SCHEMA_VERSION = 1;
const KEY_SCHEMA = 'meta:schemaVersion';
const KEY_CATALOG = 'catalog:problems';
const KEY_CATALOG_AT = 'catalog:fetchedAt';
const keyAcc = (handle: string) => `submissions:${handle.toLowerCase()}:accepted`;
const keyAccAt = (handle: string) => `submissions:${handle.toLowerCase()}:fetchedAt`;
const keyActivity = (handle: string) => `submissions:${handle.toLowerCase()}:activity`;
const keyRecent = (handle: string) => `submissions:${handle.toLowerCase()}:recent`;
const keyRating = (handle: string) => `rating:${handle.toLowerCase()}`;

export type RecentVerdict = { problem: string; verdict: 'AC' | 'WA'; date: string; rating?: number };

export async function ensureSchema(): Promise<void> {
  const v = (await idbGet<number>(KEY_SCHEMA, store)) ?? 0;
  if (v !== SCHEMA_VERSION) {
    // Future migrations live here. For v0 → v1 we just stamp the version;
    // there's no data to migrate.
    await idbSet(KEY_SCHEMA, SCHEMA_VERSION, store);
  }
}

// ── Problem catalog ─────────────────────────────────────────────────────────

export async function loadCatalog(): Promise<{ problems: CfProblem[]; fetchedAt: number } | null> {
  const problems = await idbGet<CfProblem[]>(KEY_CATALOG, store);
  const fetchedAt = await idbGet<number>(KEY_CATALOG_AT, store);
  if (!problems || !fetchedAt) return null;
  return { problems, fetchedAt };
}

export async function saveCatalog(problems: CfProblem[]): Promise<void> {
  await idbSet(KEY_CATALOG, problems, store);
  await idbSet(KEY_CATALOG_AT, Date.now(), store);
}

// ── Per-handle submission cache ─────────────────────────────────────────────

export async function loadAccepted(handle: string): Promise<{
  acceptedIds: string[];
  activity: number[];
  recent: RecentVerdict[];
  fetchedAt: number;
} | null> {
  const acceptedIds = await idbGet<string[]>(keyAcc(handle), store);
  const fetchedAt = await idbGet<number>(keyAccAt(handle), store);
  const activity = await idbGet<number[]>(keyActivity(handle), store);
  const recent = await idbGet<RecentVerdict[]>(keyRecent(handle), store);
  if (!acceptedIds || !fetchedAt || !activity || !recent) return null;
  return { acceptedIds, activity, recent, fetchedAt };
}

export async function saveAccepted(
  handle: string,
  acceptedIds: string[],
  activity: number[],
  recent: RecentVerdict[],
): Promise<void> {
  await idbSet(keyAcc(handle), acceptedIds, store);
  await idbSet(keyActivity(handle), activity, store);
  await idbSet(keyRecent(handle), recent, store);
  await idbSet(keyAccAt(handle), Date.now(), store);
}

export async function clearHandle(handle: string): Promise<void> {
  await idbDel(keyAcc(handle), store);
  await idbDel(keyAccAt(handle), store);
  await idbDel(keyActivity(handle), store);
  await idbDel(keyRecent(handle), store);
  await idbDel(keyRating(handle), store);
}

// ── Rating history ──────────────────────────────────────────────────────────

export async function loadRating(handle: string): Promise<CfRatingPoint[] | null> {
  return (await idbGet<CfRatingPoint[]>(keyRating(handle), store)) ?? null;
}

export async function saveRating(handle: string, hist: CfRatingPoint[]): Promise<void> {
  await idbSet(keyRating(handle), hist, store);
}
