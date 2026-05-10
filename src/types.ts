// Shared types for A2OJ Reimagined.

// ── Codeforces API response shapes ──────────────────────────────────────────
// Only the fields we actually use are typed. CF occasionally adds new fields;
// we ignore the rest.

export type CfUser = {
  handle: string;
  rating: number;
  maxRating: number;
  rank: string;
  maxRank: string;
  registrationTimeSeconds: number;
  avatar: string;
  titlePhoto: string;
};

export type CfRatingPoint = {
  contestId: number;
  contestName: string;
  rank: number;
  ratingUpdateTimeSeconds: number;
  oldRating: number;
  newRating: number;
};

export type CfProblem = {
  contestId: number;
  index: string;
  name: string;
  rating?: number;
  tags: string[];
  type?: 'PROGRAMMING' | 'QUESTION';
};

export type CfSubmission = {
  id: number;
  creationTimeSeconds: number;
  verdict?: string;
  problem: { contestId?: number; index: string; name: string; rating?: number; tags: string[] };
};

// ── A2OJ ladders (output of scripts/scrape-a2oj.mjs) ────────────────────────

export type A2ojProblemRef = {
  contestId: number;
  index: string;
  name: string;
};

export type A2ojLadder = {
  id: string;
  slug: string;
  kind: 'rating' | 'division';
  label: string;
  range: string;
  ratingLo: number | null;
  ratingHi: number | null;
  tier: number;
  target: string;
  total: number;
  problems: A2ojProblemRef[];
};

export type A2ojLaddersFile = {
  scrapedAt: string;
  source: string;
  ladders: A2ojLadder[];
};

// ── Existing UI types kept for backwards compatibility ──────────────────────
// `Ladder` and `Problem` are still consumed by the page components. The data
// layer adapts CF + A2OJ data into these shapes.

export type Ladder = {
  id: string;
  tier: number;
  label: string;
  range: string;
  solved: number;
  total: number;
  target: string;
  kind?: 'rating' | 'division';
  /** True for A2OJ "extra" decks (200 bonus problems for the same tier). */
  extra?: boolean;
  color?: string;
};

export type ProblemStatus = 'unsolved' | 'attempted' | 'solved';

export type Problem = {
  id: string; // `${contestId}${index}` — the canonical CF display ID
  contestId: number;
  letter: string; // CF index ("A", "B1", etc.)
  name: string;
  tags: string[];
  rating: number;
  solvers: number;
  status: ProblemStatus;
  href: string;
};

export type Category = {
  name: string;
  count: number;
  hot?: boolean;
};

export type RecentEntry = {
  problem: string;
  verdict: 'AC' | 'WA';
  date: string;
  rating?: number;
};

// Real, runtime user state (replaces the mock `User`).
export type User = {
  handle: string;
  rating: number;
  maxRating: number;
  rank?: string;
  avatar?: string;
  joinedAgo?: string;
  solvedTotal: number;
  contests: number;
  streak: number;
  activity: number[]; // 90-day daily AC count
  recent: RecentEntry[];
};
