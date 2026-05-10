// Maps a Codeforces rating to the corresponding CSS variable reference.
// Verbatim port from the README's "Rating tones" section.

export const ratingTone = (r: number): string => {
  if (r < 1200) return 'var(--ed-r-gray)';
  if (r < 1400) return 'var(--ed-r-sage)';
  if (r < 1600) return 'var(--ed-r-teal)';
  if (r < 1800) return 'var(--ed-r-indigo)';
  if (r < 2100) return 'var(--ed-r-plum)';
  if (r < 2400) return 'var(--ed-r-amber)';
  return 'var(--ed-r-red)';
};
