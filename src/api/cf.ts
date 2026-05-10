// Codeforces API client.
//
// All public endpoints — no auth, CORS-enabled. Calls are funnelled through a
// single global queue with a minimum 600 ms gap (CF asks for ≤ 2 req/s).
// Throws typed errors so callers can surface the right UX.

import type { CfUser, CfRatingPoint, CfProblem, CfSubmission } from '@/types';

const BASE = 'https://codeforces.com/api';
const MIN_GAP_MS = 600;

export class CfHandleNotFound extends Error {
  constructor(handle: string) {
    super(`Codeforces handle "${handle}" not found`);
    this.name = 'CfHandleNotFound';
  }
}
export class CfRateLimited extends Error {
  constructor() {
    super('Codeforces rate limit hit — please wait a moment.');
    this.name = 'CfRateLimited';
  }
}
export class CfNetworkError extends Error {
  constructor(detail: string) {
    super(`Codeforces request failed: ${detail}`);
    this.name = 'CfNetworkError';
  }
}

// Single-flight queue: each call waits on the previous one's gap.
let nextSlot = 0;
async function gate(): Promise<void> {
  const now = Date.now();
  const wait = Math.max(0, nextSlot - now);
  nextSlot = Math.max(nextSlot, now) + MIN_GAP_MS;
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
}

type CfEnvelope<T> = { status: 'OK'; result: T } | { status: 'FAILED'; comment: string };

async function call<T>(path: string): Promise<T> {
  await gate();
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`);
  } catch (e) {
    throw new CfNetworkError(String(e));
  }
  if (res.status === 429 || res.status === 503) throw new CfRateLimited();
  if (!res.ok) throw new CfNetworkError(`HTTP ${res.status}`);
  let body: CfEnvelope<T>;
  try {
    body = (await res.json()) as CfEnvelope<T>;
  } catch (e) {
    throw new CfNetworkError(`bad JSON: ${String(e)}`);
  }
  if (body.status !== 'OK') {
    if (/handle/i.test(body.comment) && /not found|invalid/i.test(body.comment)) {
      const m = body.comment.match(/handle\s+([A-Za-z0-9_-]+)/i);
      throw new CfHandleNotFound(m?.[1] ?? '');
    }
    throw new CfNetworkError(body.comment);
  }
  return body.result;
}

// ── Endpoints ───────────────────────────────────────────────────────────────

export async function getUser(handle: string): Promise<CfUser> {
  const arr = await call<CfUser[]>(`/user.info?handles=${encodeURIComponent(handle)}`);
  if (!arr[0]) throw new CfHandleNotFound(handle);
  return arr[0];
}

export async function getUserRatingHistory(handle: string): Promise<CfRatingPoint[]> {
  return call<CfRatingPoint[]>(`/user.rating?handle=${encodeURIComponent(handle)}`);
}

export async function getUserSubmissions(
  handle: string,
  onProgress?: (loaded: number) => void,
  cap = 10000,
): Promise<CfSubmission[]> {
  const PAGE = 1000;
  const out: CfSubmission[] = [];
  let from = 1;
  for (;;) {
    const page = await call<CfSubmission[]>(
      `/user.status?handle=${encodeURIComponent(handle)}&from=${from}&count=${PAGE}`,
    );
    out.push(...page);
    onProgress?.(out.length);
    if (page.length < PAGE) break;
    if (out.length >= cap) break;
    from += PAGE;
  }
  return out;
}

export async function getProblemCatalog(): Promise<CfProblem[]> {
  const r = await call<{ problems: CfProblem[] }>(`/problemset.problems`);
  return r.problems;
}
