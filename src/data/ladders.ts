// Real A2OJ ladders. The static JSON is loaded synchronously from
// src/data/a2oj-ladders.json (output of scripts/scrape-a2oj.mjs); solved
// counts are derived live from the user store.

import { useMemo } from 'react';
import { getA2ojLadders, problemKey } from '@/api/a2oj';
import type { A2ojLadder, Ladder } from '@/types';
import { useUserStore } from '@/store/userStore';

// A2OJ "extra" ladders use slug-based ids (e.g. ladder24); the standard
// rating ladders use the prefixed `rating-{lo}-{hi}` shape.
function isExtra(l: A2ojLadder): boolean {
  return l.kind === 'rating' && !l.id.startsWith('rating-');
}

function adapt(l: A2ojLadder, solved: number): Ladder {
  return {
    id: l.id,
    tier: l.tier,
    label: l.label,
    range: l.range,
    solved,
    total: l.total,
    target: l.target,
    kind: l.kind,
    extra: isExtra(l),
  };
}

// Synchronous list of ladders WITHOUT solved counts (always 0). Useful
// for places that need just the metadata.
export const LADDERS: Ladder[] = getA2ojLadders().map((l) => adapt(l, 0));

// The full A2OJ shape (with `problems[]`) for callers that need to render
// per-ladder problem lists.
export function getRawLadders(): A2ojLadder[] {
  return getA2ojLadders();
}

export function getRawLadder(id: string): A2ojLadder | undefined {
  return getA2ojLadders().find((l) => l.id === id);
}

// Hook returning ladders with live `solved` counts. Memoized; recomputes
// when solvedIds / localUnsolved change.
export function useLadders(): Ladder[] {
  const solvedIds = useUserStore((s) => s.solvedIds);
  const localUnsolved = useUserStore((s) => s.localUnsolved);
  return useMemo(() => {
    const set0 = new Set(solvedIds);
    for (const id of localUnsolved) set0.delete(id);
    return getA2ojLadders().map((l) => {
      let solved = 0;
      for (const p of l.problems) {
        if (set0.has(problemKey(p.contestId, p.index))) solved++;
      }
      return adapt(l, solved);
    });
  }, [solvedIds, localUnsolved]);
}

export function useLadder(id: string | undefined): Ladder | null {
  const list = useLadders();
  return id ? list.find((l) => l.id === id) ?? null : null;
}
