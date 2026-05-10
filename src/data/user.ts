// Ported verbatim from design_handoff_a2oj/reference/data/problems.js (window.USER).
// `recent` has 5 entries; `activity` is a 90-day LCG-seeded array.

import type { User } from '@/types';

const ACTIVITY: number[] = Array.from({ length: 90 }, (_, i) => {
  const r = (i * 1103515245 + 12345) >>> 0;
  return (r % 7) - (i % 11 === 0 ? 0 : 1);
}).map((n) => Math.max(0, n));

export const USER: User = {
  handle: 'tourist_apprentice',
  rating: 1547,
  maxRating: 1602,
  rank: 'specialist',
  solvedTotal: 412,
  contests: 47,
  streak: 13,
  joinedAgo: '2y 4mo',
  recent: [
    { date: '2d ago', problem: '1850D - Balanced Round',           verdict: 'AC', rating: 1500 },
    { date: '2d ago', problem: '1850C - Word on the Paper',        verdict: 'AC', rating: 800  },
    { date: '3d ago', problem: '1846E1 - Rudolph and Mimics',      verdict: 'WA', rating: 1500 },
    { date: '4d ago', problem: '1846D - Rudolph and Christmas Tree', verdict: 'AC', rating: 1100 },
    { date: '5d ago', problem: '1840C - Ski Resort',               verdict: 'AC', rating: 1300 },
  ],
  activity: ACTIVITY,
};
