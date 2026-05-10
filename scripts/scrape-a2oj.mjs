// Scrape A2OJ Netlify static pages → src/data/a2oj-ladders.json
//
// The Netlify mirror at https://a2oj.netlify.app/ ships every ladder as a
// fully-rendered static HTML page (no client-side rendering, no JSON API).
// Each ladder page has a single problem <table> where each <tr> contains an
// <a href="http://codeforces.com/problemset/problem/{contestId}/{index}">name</a>.
//
// Output: src/data/a2oj-ladders.json — committed to the repo. Rerun manually
// if A2OJ updates: `node scripts/scrape-a2oj.mjs`.

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'src/data/a2oj-ladders.json');
const BASE = 'https://a2oj.netlify.app';

// Tier index for our existing TIERS palette (newbie..gm). Used by the UI to
// pick the rating colour for each ladder card.
function tierFromRange(lo, hi) {
  if (hi < 1200) return 0; // newbie
  if (hi < 1400) return 1; // pupil
  if (hi < 1600) return 2; // specialist
  if (hi < 1900) return 3; // expert
  if (hi < 2100) return 4; // candidate master
  if (hi < 2400) return 5; // master
  return 6;                // grandmaster+
}

function tierLabel(idx) {
  return ['Newbie', 'Pupil', 'Specialist', 'Expert', 'Candidate Master', 'Master', 'Grandmaster'][idx];
}

function nextTierLabel(idx) {
  return tierLabel(Math.min(idx + 1, 6));
}

// 22 rating-tier ladders (11 standard + 11 "extra"). Source of truth: the
// /ladders index page on the netlify mirror.
const RATING_LADDERS = [
  { slug: 'ladder11', lo: 0,    hi: 1299, label: 'Rating < 1300',     extra: false },
  { slug: 'ladder12', lo: 1300, hi: 1399, label: '1300 – 1399',       extra: false },
  { slug: 'ladder13', lo: 1400, hi: 1499, label: '1400 – 1499',       extra: false },
  { slug: 'ladder14', lo: 1500, hi: 1599, label: '1500 – 1599',       extra: false },
  { slug: 'ladder15', lo: 1600, hi: 1699, label: '1600 – 1699',       extra: false },
  { slug: 'ladder16', lo: 1700, hi: 1799, label: '1700 – 1799',       extra: false },
  { slug: 'ladder17', lo: 1800, hi: 1899, label: '1800 – 1899',       extra: false },
  { slug: 'ladder18', lo: 1900, hi: 1999, label: '1900 – 1999',       extra: false },
  { slug: 'ladder19', lo: 2000, hi: 2099, label: '2000 – 2099',       extra: false },
  { slug: 'ladder20', lo: 2100, hi: 2199, label: '2100 – 2199',       extra: false },
  { slug: 'ladder21', lo: 2200, hi: 9999, label: 'Rating ≥ 2200',     extra: false },
  { slug: 'ladder22', lo: 0,    hi: 1299, label: 'Rating < 1300',     extra: true  },
  { slug: 'ladder23', lo: 1300, hi: 1399, label: '1300 – 1399',       extra: true  },
  { slug: 'ladder24', lo: 1400, hi: 1499, label: '1400 – 1499',       extra: true  },
  { slug: 'ladder25', lo: 1500, hi: 1599, label: '1500 – 1599',       extra: true  },
  { slug: 'ladder26', lo: 1600, hi: 1699, label: '1600 – 1699',       extra: true  },
  { slug: 'ladder27', lo: 1700, hi: 1799, label: '1700 – 1799',       extra: true  },
  { slug: 'ladder28', lo: 1800, hi: 1899, label: '1800 – 1899',       extra: true  },
  { slug: 'ladder29', lo: 1900, hi: 1999, label: '1900 – 1999',       extra: true  },
  { slug: 'ladder30', lo: 2000, hi: 2099, label: '2000 – 2099',       extra: true  },
  { slug: 'ladder31', lo: 2100, hi: 2199, label: '2100 – 2199',       extra: true  },
  { slug: 'ladder32', lo: 2200, hi: 9999, label: 'Rating ≥ 2200',     extra: true  },
];

const DIV_LADDERS = [
  { slug: 'div2a',     letter: 'A', old: false },
  { slug: 'div2b',     letter: 'B', old: false },
  { slug: 'div2c',     letter: 'C', old: false },
  { slug: 'div2d',     letter: 'D', old: false },
  { slug: 'div2e',     letter: 'E', old: false },
  { slug: 'div2a_old', letter: 'A', old: true  },
  { slug: 'div2b_old', letter: 'B', old: true  },
  { slug: 'div2c_old', letter: 'C', old: true  },
  { slug: 'div2d_old', letter: 'D', old: true  },
  { slug: 'div2e_old', letter: 'E', old: true  },
];

// Match: <a [...attrs in any order...] href="http://codeforces.com/problemset/problem/{id}/{idx}" [...]>name</a>
// Tolerate http/https, optional "www.", and any preceding attributes (e.g. target="_blank").
const PROBLEM_LINK_RE =
  /<a\b[^>]*\bhref=["']https?:\/\/(?:www\.)?codeforces\.com\/problemset\/problem\/(\d+)\/([A-Za-z0-9]+)["'][^>]*>([^<]+)<\/a>/gi;

function decodeHtml(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

async function fetchLadder(slug) {
  const url = `${BASE}/${slug}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${slug}: HTTP ${res.status}`);
  const html = await res.text();
  const problems = [];
  const seen = new Set();
  for (const m of html.matchAll(PROBLEM_LINK_RE)) {
    const contestId = Number(m[1]);
    const index = m[2].toUpperCase();
    const name = decodeHtml(m[3]).trim();
    const key = `${contestId}${index}`;
    if (seen.has(key)) continue;
    seen.add(key);
    problems.push({ contestId, index, name });
  }
  return problems;
}

async function main() {
  const ladders = [];

  for (const r of RATING_LADDERS) {
    process.stdout.write(`  ${r.slug.padEnd(10)} ${r.label}${r.extra ? ' (extra)' : ''}…  `);
    const problems = await fetchLadder(r.slug);
    process.stdout.write(`${problems.length} problems\n`);
    const tier = tierFromRange(r.lo, r.hi);
    ladders.push({
      id: r.extra ? `${r.slug}` : `rating-${r.lo}-${r.hi === 9999 ? 'plus' : r.hi}`,
      slug: r.slug,
      kind: 'rating',
      label: r.label + (r.extra ? ' (Extra)' : ''),
      range: r.hi === 9999 ? `${r.lo}+` : `${r.lo}–${r.hi}`,
      ratingLo: r.lo,
      ratingHi: r.hi,
      tier,
      target: nextTierLabel(tier),
      total: problems.length,
      problems,
    });
  }

  for (const d of DIV_LADDERS) {
    process.stdout.write(`  ${d.slug.padEnd(10)} Div 2 ${d.letter}${d.old ? ' (older)' : ''}…  `);
    const problems = await fetchLadder(d.slug);
    process.stdout.write(`${problems.length} problems\n`);
    ladders.push({
      id: d.slug,
      slug: d.slug,
      kind: 'division',
      label: `Codeforces Div. 2 ${d.letter}${d.old ? ' (Older)' : ''}`,
      range: `Div 2 · ${d.letter}`,
      ratingLo: null,
      ratingHi: null,
      tier: ({ A: 0, B: 1, C: 2, D: 3, E: 4 })[d.letter],
      target: '',
      total: problems.length,
      problems,
    });
  }

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(
    OUT,
    JSON.stringify(
      {
        scrapedAt: new Date().toISOString(),
        source: BASE,
        ladders,
      },
      null,
      2,
    ),
  );

  const totalProblems = ladders.reduce((n, l) => n + l.total, 0);
  console.log(`\n✓ wrote ${ladders.length} ladders, ${totalProblems} problems → ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
