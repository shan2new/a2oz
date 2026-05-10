// UserCard — the marquee element in the sidebar.
// Renders handle, tier/tenure, hero rating (count-up), sparkline,
// delta, and a hairline progress bar to the next tier.

import { useUserStore } from '@/store/userStore';
import { ratingTone } from '@/lib/ratingTone';
import { tierForRating, TIERS, tierIndexForRating } from '@/lib/tiers';
import { useCountUp } from '@/lib/useCountUp';
import { Sparkline } from './Sparkline';

const GEIST = "'Geist', system-ui, sans-serif";
const GMONO = "'Geist Mono', ui-monospace, monospace";

export function UserCard() {
  const user = useUserStore((s) => s.user)!;
  const tone = ratingTone(user.rating);

  // Count-up animation over 1100ms
  const ratingShown = useCountUp(user.rating, 1100);

  // Current tier bounds for progress bar
  const tierIdx = tierIndexForRating(user.rating);
  const currentTier = TIERS[tierIdx];
  const nextTier = TIERS[Math.min(tierIdx + 1, TIERS.length - 1)];
  const tierMin = currentTier.min;
  const tierMax = currentTier.max === 9999 ? currentTier.min + 300 : currentTier.max;
  const pct = Math.max(0, Math.min(1, (user.rating - tierMin) / (tierMax - tierMin)));
  const nextTierGap = Math.max(0, nextTier.min - user.rating);

  // Sparkline — last 7 activity entries (fall back to some points if activity is short)
  const raw = user.activity ?? [];
  const sparkPoints =
    raw.length >= 7
      ? raw.slice(-7)
      : raw.length > 0
      ? [...Array(7 - raw.length).fill(raw[0] ?? 0), ...raw]
      : [0, 0, 0, 0, 0, 0, 0];

  // Delta — sum of last 7 days vs previous 7
  const last7 = raw.slice(-7).reduce((a, b) => a + b, 0);
  const prev7 = raw.slice(-14, -7).reduce((a, b) => a + b, 0);
  const delta = last7 - prev7;

  const tierLabel = tierForRating(user.rating).label;
  const joinedAgo = user.joinedAgo ?? '';

  return (
    <div style={{ padding: '0 4px' }}>
      {/* Handle */}
      <div
        style={{
          fontFamily: GEIST,
          fontWeight: 600,
          fontSize: 15,
          color: tone,
          letterSpacing: -0.3,
          lineHeight: 1.1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          marginBottom: 4,
        }}
      >
        {user.handle}
      </div>

      {/* Tier · tenure */}
      <div
        style={{
          fontFamily: GMONO,
          fontWeight: 400,
          fontSize: 11,
          color: 'var(--ed-fg-mute)',
          letterSpacing: 0,
          marginBottom: 30,
        }}
      >
        {tierLabel.toLowerCase()}
        {joinedAgo && (
          <>
            {' '}
            <span style={{ opacity: 0.4, margin: '0 4px' }}>/</span>
            {joinedAgo}
          </>
        )}
      </div>

      {/* Hero rating numeral */}
      <div
        className="ed-tick"
        style={{
          fontFamily: GMONO,
          fontWeight: 300,
          fontSize: 56,
          lineHeight: 0.9,
          color: tone,
          letterSpacing: -3,
          fontFeatureSettings: '"tnum", "zero"',
          marginBottom: 16,
        }}
      >
        {ratingShown}
      </div>

      {/* Sparkline + delta + 7d label */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 22,
        }}
      >
        <Sparkline points={sparkPoints} tone={tone} />
        <span
          style={{
            fontFamily: GMONO,
            fontWeight: 400,
            fontSize: 11,
            color: delta >= 0 ? 'var(--ed-ok)' : 'var(--ed-err)',
          }}
        >
          {delta >= 0 ? '+' : ''}
          {delta}
        </span>
        <span
          style={{
            fontFamily: GMONO,
            fontWeight: 400,
            fontSize: 10.5,
            color: 'var(--ed-fg-faint)',
            marginLeft: 'auto',
          }}
        >
          7d
        </span>
      </div>

      {/* Hairline progress bar to next tier */}
      <div
        className="ed-fill"
        style={{
          height: 1,
          background: 'var(--ed-line)',
          overflow: 'hidden',
          marginBottom: 8,
        }}
      >
        <i
          style={{
            display: 'block',
            height: '100%',
            width: `${pct * 100}%`,
            background: tone,
            opacity: 0.85,
            transformOrigin: 'left',
          }}
        />
      </div>

      {/* Next tier info */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: GMONO,
          fontSize: 10.5,
          color: 'var(--ed-fg-faint)',
        }}
      >
        <span>
          {nextTierGap > 0 ? `${nextTierGap} to ${nextTier.label.toLowerCase()}` : `${currentTier.label.toLowerCase()} max`}
        </span>
        <span style={{ opacity: 0.55 }}>{Math.round(pct * 100)}%</span>
      </div>
    </div>
  );
}
