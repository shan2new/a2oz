import { useUserStore } from '@/store/userStore';
import { ratingTone } from '@/lib/ratingTone';
import { tierForRating } from '@/lib/tiers';

const GEIST = "'Geist', system-ui, sans-serif";
const GMONO = "'Geist Mono', ui-monospace, monospace";

export function UserCard() {
  const user = useUserStore((s) => s.user)!;
  const tone = ratingTone(user.rating);
  const tierLabel = tierForRating(user.rating).label;

  return (
    <div
      style={{
        padding: '0 4px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.handle}
          width={40}
          height={40}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            objectFit: 'cover',
            border: `1.5px solid ${tone}`,
            background: 'var(--ed-bg-2)',
            flexShrink: 0,
          }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'var(--ed-bg-2)',
            border: `1.5px solid ${tone}`,
            display: 'grid',
            placeItems: 'center',
            color: tone,
            fontFamily: GEIST,
            fontWeight: 600,
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          {user.handle[0]?.toUpperCase()}
        </div>
      )}

      <div style={{ minWidth: 0, flex: 1 }}>
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

        <div
          style={{
            fontFamily: GMONO,
            fontWeight: 400,
            fontSize: 11,
            color: 'var(--ed-fg-mute)',
            letterSpacing: 0,
          }}
        >
          {tierLabel.toLowerCase()}
        </div>
      </div>
    </div>
  );
}
