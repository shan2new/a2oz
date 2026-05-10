// Ported verbatim from design_handoff_a2oj/reference/data/problems.js (window.LADDERS).
// 10 entries — do not reorder, ids are referenced by routes.

import type { Ladder } from '@/types';

export const LADDERS: Ladder[] = [
  { id: 'l1',  range: '< 1300',     label: 'Newcomer',             total: 100, solved: 87, target: 'Pupil',            color: 'slate',   tier: 0 },
  { id: 'l2',  range: '1300–1399',  label: 'Pupil',                total: 100, solved: 64, target: 'Specialist',       color: 'sage',    tier: 1 },
  { id: 'l3',  range: '1400–1499',  label: 'Specialist I',         total: 100, solved: 41, target: 'Specialist+',      color: 'sage',    tier: 1 },
  { id: 'l4',  range: '1500–1599',  label: 'Specialist II',        total: 100, solved: 28, target: 'Expert',           color: 'teal',    tier: 2 },
  { id: 'l5',  range: '1600–1699',  label: 'Expert I',             total: 100, solved: 12, target: 'Expert+',          color: 'teal',    tier: 2 },
  { id: 'l6',  range: '1700–1799',  label: 'Expert II',            total: 100, solved: 4,  target: 'Candidate Master', color: 'indigo',  tier: 3 },
  { id: 'l7',  range: '1800–1899',  label: 'Candidate Master',     total: 100, solved: 0,  target: 'Master',           color: 'indigo',  tier: 3 },
  { id: 'l8',  range: '1900–2099',  label: 'Master',               total: 100, solved: 0,  target: 'IM',               color: 'plum',    tier: 4 },
  { id: 'l9',  range: '2100–2399',  label: 'International Master', total: 100, solved: 0,  target: 'Grandmaster',      color: 'amber',   tier: 5 },
  { id: 'l10', range: '2400+',      label: 'Grandmaster',          total: 100, solved: 0,  target: 'LGM',              color: 'crimson', tier: 6 },
];
