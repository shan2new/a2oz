// Tier ladder ported from reference/variations/editorial.jsx (TIERS const, line 32).
// 7 tiers in ascending order of rating. `toneVar` is the CSS custom property name
// (no var() wrapper) so callers can compose styles either inline or as `var(--…)`.

export type Tier = {
  key: 'newbie' | 'pupil' | 'specialist' | 'expert' | 'cm' | 'master' | 'gm';
  label: string;
  min: number;
  max: number;
  toneVar: `--ed-r-${'gray' | 'sage' | 'teal' | 'indigo' | 'plum' | 'amber' | 'red'}`;
};

export const TIERS: Tier[] = [
  { key: 'newbie',     label: 'Newbie',           min: 0,    max: 1199, toneVar: '--ed-r-gray'   },
  { key: 'pupil',      label: 'Pupil',            min: 1200, max: 1399, toneVar: '--ed-r-sage'   },
  { key: 'specialist', label: 'Specialist',       min: 1400, max: 1599, toneVar: '--ed-r-teal'   },
  { key: 'expert',     label: 'Expert',           min: 1600, max: 1899, toneVar: '--ed-r-indigo' },
  { key: 'cm',         label: 'Candidate Master', min: 1900, max: 2099, toneVar: '--ed-r-plum'   },
  { key: 'master',     label: 'Master',           min: 2100, max: 2299, toneVar: '--ed-r-amber'  },
  { key: 'gm',         label: 'Grandmaster',      min: 2300, max: 9999, toneVar: '--ed-r-red'    },
];

export function tierIndexForRating(r: number): number {
  const i = TIERS.findIndex((t) => r >= t.min && r <= t.max);
  return i === -1 ? 0 : i;
}

export function tierForRating(r: number): Tier {
  return TIERS[tierIndexForRating(r)];
}

// `var(--ed-r-…)` for a tier index. Clamps out-of-range to the top tier.
export function tierToneVar(tier: number): string {
  const t = TIERS[Math.min(Math.max(tier, 0), TIERS.length - 1)];
  return `var(${t.toneVar})`;
}
