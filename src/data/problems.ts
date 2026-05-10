// Ported verbatim from design_handoff_a2oj/reference/data/problems.js (window.PROBLEMS).
// 100 entries with deterministic LCG-seeded status & solver counts. Do NOT change
// any of the magic numbers (2654435761, CONTEST_BASE 1700, multipliers 7/13/100/14000)
// — Wave 1+ pages assume the byte-for-byte same dataset as the prototype.

import type { Problem, ProblemStatus } from '@/types';

const TAGS: string[][] = [
  ['dp', 'greedy'],
  ['math', 'number theory'],
  ['implementation', 'brute force'],
  ['graphs', 'dfs and similar'],
  ['strings', 'hashing'],
  ['data structures', 'segment tree'],
  ['binary search', 'sortings'],
  ['constructive algorithms'],
  ['two pointers', 'sortings'],
  ['combinatorics', 'math'],
  ['bitmasks', 'dp'],
  ['trees', 'dp'],
  ['shortest paths', 'dijkstra'],
  ['greedy', 'sortings'],
  ['math', 'probabilities'],
];

const NAMES: string[] = [
  'Two Permutations', 'Median Knot', 'Walking on a Graph', 'Sorting by Subsequences', 'Brave Forest',
  'String Reduction', 'Mike and Foam', 'Bear and Square Grid', 'Tournament Construction', 'Tree Generator',
  'Count The Blocks', 'Yet Another Tournament', 'Magic Stones', 'Ancient Berland Roads', 'Multiset',
  'Game with Strings', 'Gerald and Path', 'Chemistry in Berland', 'Inversion Counting', 'Maximum Submatrix',
  'Subset Mex', 'Cards Partition', 'Polycarp Recovers a Sequence', 'Anya and 1100', 'Two Large Bags',
  'Determine Winning Islands', 'Khayyam and the Seven Tomes', 'Meaning Mean', 'Shape Perimeter', 'Permutation',
  'Make a Palindrome', 'Range = √Sum', 'Slimes', 'Numbers on a Board', 'Photographer Mishka',
  'Replacement Operations', 'Restoration of String', 'Even Path', 'Bus to Udayland', 'Mike and Distribution',
  'Berland Crossword', 'Maximize the Intersections', 'Equalize the Array', 'Erase and Extend', 'Mocha and Diana',
  'Card Constructions', 'Equidistant Vertices', 'Coloring Trees', 'Frog Jumps', 'Yet Another Walking Robot',
  'Berserk Robot', 'Sereja and Two Sequences', 'Plus and Square Root', 'Bear and Bowling 4', 'Kuroni and Antiunfairness',
  'Restore Modulo', 'Petya and Construction', 'Nezzar and Tournaments', 'Multiplication Table', 'Valera and Tubes',
  'Anya and Smartphone', 'Ralph and Dirty Paper', 'Catowice City', 'Fox and Card Game', 'Bus Game',
  'Boboniu Walks on Graph', 'New Year Tree', 'Doe Graphs', 'Make a Power of Two', 'GCD Length',
  'Prefix Enlightenment', 'Permutation Restoration', 'Round Marriage', 'Tree Painting', 'Binary Cards',
  'Replicating Processes', 'XOR Construction', 'Counting Triangles', 'Fox and Names', 'Misha and XOR',
  'Mike and Geometry', 'Trains and Statistic', 'Phoenix and Distribution', 'Vasya and Book', 'Pizza Reordered',
  'Pleasant Pairs', 'Rotate Columns', 'Two Sets', 'Watering Flowers', 'XOR-pyramid',
  'Yet Another Sorting', 'Zero Sequences', 'Almost Identity Permutations', 'Berries Distribution', 'Cellular Network',
  'Dexterina', 'Easy Equation', 'Free Choice', 'Game of Life', "Hilbert's Hotel",
];

const CONTEST_BASE = 1700;

export const PROBLEMS: Problem[] = NAMES.map((name, i) => {
  const cid = CONTEST_BASE + (i * 7) % 380;
  const letter = ['A', 'B', 'C', 'D', 'E', 'F'][i % 6];
  const rating = 1500 + (((i * 13) % 10) * 10);
  const tags = TAGS[i % TAGS.length];
  // Deterministic Knuth-multiplicative hash → realistic spread of statuses.
  const r = (i * 2654435761) >>> 0;
  const status: ProblemStatus =
    r % 100 < 28 ? 'solved' : r % 100 < 36 ? 'attempted' : 'unsolved';
  const solvers = 800 + ((r >>> 7) % 14000);
  return {
    id: `${cid}${letter}`,
    contestId: cid,
    letter,
    name,
    rating,
    tags,
    status,
    solvers,
    href: `https://codeforces.com/problemset/problem/${cid}/${letter}`,
  };
});
