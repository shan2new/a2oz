// A2OJ ladder loader.
//
// Reads the static JSON shipped at src/data/a2oj-ladders.json (output of
// scripts/scrape-a2oj.mjs) and adapts each entry to the runtime Ladder shape
// expected by the UI. Solved counts are layered on at call sites by joining
// against the user store's `solvedIds`.

import raw from '@/data/a2oj-ladders.json';
import type { A2ojLaddersFile, A2ojLadder, Ladder } from '@/types';

const FILE = raw as A2ojLaddersFile;

export const A2OJ_SCRAPED_AT = FILE.scrapedAt;
export const A2OJ_SOURCE = FILE.source;

export function getA2ojLadders(): A2ojLadder[] {
  return FILE.ladders;
}

export function getA2ojLadder(id: string): A2ojLadder | undefined {
  return FILE.ladders.find((l) => l.id === id);
}

// problemKey: matches the canonical CF display ID we use everywhere
//             (e.g. "1850A", "1234B1"). Submissions and the catalog share
//             this key.
export function problemKey(contestId: number, index: string): string {
  return `${contestId}${index}`;
}

// Adapt an A2ojLadder + a set of solved keys → the legacy `Ladder` shape used
// by the existing UI.
export function adaptLadder(l: A2ojLadder, solvedSet: Set<string>): Ladder {
  let solved = 0;
  for (const p of l.problems) {
    if (solvedSet.has(problemKey(p.contestId, p.index))) solved++;
  }
  return {
    id: l.id,
    tier: l.tier,
    label: l.label,
    range: l.range,
    solved,
    total: l.total,
    target: l.target,
    kind: l.kind,
  };
}

export function adaptAllLadders(solvedSet: Set<string>): Ladder[] {
  return FILE.ladders.map((l) => adaptLadder(l, solvedSet));
}
