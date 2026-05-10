// Shared types for A2OJ Reimagined.
// All later waves import from here so the data shape stays stable.

export type RecentEntry = {
  problem: string;
  verdict: 'AC' | 'WA';
  date: string;
  rating?: number;
};

export type User = {
  handle: string;
  rating: number;
  maxRating: number;
  rank?: string;
  solvedTotal: number;
  contests: number;
  streak: number;
  joinedAgo?: string;
  activity: number[]; // 90 entries, daily solve count
  recent: RecentEntry[];
};

export type Ladder = {
  id: string; // 'l1' .. 'l10'
  tier: number; // 0-indexed
  label: string; // 'Pupil', 'Specialist I', etc.
  range: string; // '1200–1299'
  solved: number;
  total: number; // typically 100
  target: string; // next tier label, e.g. 'Specialist'
  color?: string; // tone hint from the prototype dataset
};

export type ProblemStatus = 'unsolved' | 'attempted' | 'solved';

export type Problem = {
  id: string; // CF style: '1850A'
  contestId?: number;
  letter?: string;
  name: string;
  tags: string[];
  rating: number;
  solvers: number;
  status: ProblemStatus;
  href?: string;
};

export type Category = {
  name: string;
  count: number;
  hot?: boolean;
};
