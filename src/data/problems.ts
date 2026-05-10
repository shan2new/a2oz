// Problem accessors. Joins A2OJ ladder problem refs with the cached CF
// catalog (for tags/rating) and the user's solved set.

import { useMemo } from 'react';
import { getA2ojLadders, problemKey } from '@/api/a2oj';
import type { A2ojLadder, CfProblem, Problem } from '@/types';
import { useUserStore } from '@/store/userStore';
import { useCatalogStore } from '@/store/catalogStore';

function adapt(
  contestId: number,
  index: string,
  name: string,
  cf: CfProblem | undefined,
  isSolved: boolean,
): Problem {
  return {
    id: problemKey(contestId, index),
    contestId,
    letter: index,
    name,
    tags: cf?.tags ?? [],
    rating: cf?.rating ?? 0,
    solvers: 0,
    status: isSolved ? 'solved' : 'unsolved',
    href: `https://codeforces.com/problemset/problem/${contestId}/${index}`,
  };
}

export function useProblemsForLadder(ladder: A2ojLadder | null): Problem[] {
  const byId = useCatalogStore((s) => s.byId);
  const solvedIds = useUserStore((s) => s.solvedIds);
  const localUnsolved = useUserStore((s) => s.localUnsolved);
  return useMemo(() => {
    if (!ladder) return [];
    const set0 = new Set(solvedIds);
    for (const id of localUnsolved) set0.delete(id);
    return ladder.problems.map((p) =>
      adapt(p.contestId, p.index, p.name, byId.get(problemKey(p.contestId, p.index)), set0.has(problemKey(p.contestId, p.index))),
    );
  }, [ladder, byId, solvedIds, localUnsolved]);
}

// All problems across all ladders (deduplicated). Useful for Home "next up"
// and global filters.
export function useAllProblems(): Problem[] {
  const byId = useCatalogStore((s) => s.byId);
  const solvedIds = useUserStore((s) => s.solvedIds);
  const localUnsolved = useUserStore((s) => s.localUnsolved);
  return useMemo(() => {
    const set0 = new Set(solvedIds);
    for (const id of localUnsolved) set0.delete(id);
    const seen = new Set<string>();
    const out: Problem[] = [];
    for (const l of getA2ojLadders()) {
      for (const p of l.problems) {
        const k = problemKey(p.contestId, p.index);
        if (seen.has(k)) continue;
        seen.add(k);
        out.push(adapt(p.contestId, p.index, p.name, byId.get(k), set0.has(k)));
      }
    }
    return out;
  }, [byId, solvedIds, localUnsolved]);
}
