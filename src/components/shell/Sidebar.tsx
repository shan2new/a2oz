import type { CSSProperties } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/userStore';
import { useUiStore } from '@/store/uiStore';
import { ratingTone } from '@/lib/ratingTone';
import { tierForRating } from '@/lib/tiers';
import { relativeFromNow } from '@/lib/time';
import { resyncNow, signOut } from '@/lib/userActions';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const GEIST = "'Geist', system-ui, sans-serif";
const GMONO = "'Geist Mono', ui-monospace, monospace";

type SyncStatus = 'idle' | 'syncing' | 'error';

const STATUS_DOT: Record<SyncStatus, string> = {
  syncing: 'var(--ed-warn)',
  error: 'var(--ed-err)',
  idle: 'var(--ed-ok)',
};

const NAV_ITEMS = [
  { label: 'Overview',   to: '/',           k: '⌘1' },
  { label: 'Ladders',    to: '/ladders',    k: '⌘2' },
  { label: 'Categories', to: '/categories', k: '⌘3' },
  { label: 'Progress',   to: '/progress',   k: '⌘4' },
] as const;

export function Sidebar() {
  const user = useUserStore((s) => s.user);
  const handle = useUserStore((s) => s.handle);
  const status = useUserStore((s) => s.status);
  const lastSyncedAt = useUserStore((s) => s.lastSyncedAt);
  const setTweaksOpen = useUiStore((s) => s.setTweaksOpen);
  const navigate = useNavigate();

  const tone = user ? ratingTone(user.rating) : 'var(--ed-r-indigo)';
  const dotColor = STATUS_DOT[status as SyncStatus];
  const statusLabel =
    status === 'syncing' ? 'syncing…' :
    status === 'error'   ? 'sync failed' :
    lastSyncedAt          ? `live · synced ${relativeFromNow(lastSyncedAt)}` :
                            'idle';

  return (
    <aside
      style={{
        background: 'var(--ed-bg-0)',
        borderRight: '1px solid var(--ed-line)',
        display: 'flex',
        flexDirection: 'column',
        padding: '22px 18px 14px',
        position: 'relative',
        minHeight: 0,
        overflow: 'hidden auto',
      }}
    >
      {/* Wordmark */}
      <div
        style={{
          marginBottom: 28,
          paddingLeft: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <BrandMark size={24} />
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span
            style={{
              fontFamily: GEIST,
              fontSize: 18,
              fontWeight: 600,
              lineHeight: 1,
              color: 'var(--ed-fg)',
              letterSpacing: -0.6,
            }}
          >
            A2OZ
          </span>
          <span
            style={{
              fontFamily: GMONO,
              fontSize: 9,
              color: 'var(--ed-fg-faint)',
              letterSpacing: 1.2,
              textTransform: 'uppercase',
            }}
          >
            cf ladders
          </span>
        </div>
      </div>

      {/* Primary nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <div
          style={{
            fontFamily: GMONO,
            fontSize: 9.5,
            color: 'var(--ed-fg-faint)',
            letterSpacing: 1.8,
            textTransform: 'uppercase',
            padding: '0 10px 10px',
          }}
        >
          Navigate
        </div>

        {NAV_ITEMS.map(({ label, to, k }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              background: isActive
                ? `color-mix(in oklab, ${tone} 10%, transparent)`
                : 'transparent',
              border: 'none',
              textAlign: 'left',
              padding: '10px 12px',
              borderRadius: 8,
              color: isActive ? 'var(--ed-fg)' : 'var(--ed-fg-dim)',
              fontFamily: GEIST,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontWeight: isActive ? 500 : 400,
              letterSpacing: -0.1,
              position: 'relative',
              textDecoration: 'none',
              transition: 'background .14s ease, color .14s ease',
            })}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      left: -18,
                      top: '50%',
                      width: 2,
                      height: 16,
                      marginTop: -8,
                      background: tone,
                      borderRadius: '0 1px 1px 0',
                    }}
                  />
                )}
                <span>{label}</span>
                <span
                  style={{
                    fontFamily: GMONO,
                    fontSize: 10,
                    color: isActive ? 'var(--ed-fg-mute)' : 'var(--ed-fg-faint)',
                  }}
                >
                  {k}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div
        style={{
          marginTop: 'auto',
          paddingTop: 14,
          borderTop: '1px solid var(--ed-line)',
        }}
      >
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="ed-profile-trigger"
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                padding: 8,
                borderRadius: 10,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                transition: 'background .14s ease',
              }}
            >
              <ProfileAvatar
                avatar={user?.avatar}
                handle={handle ?? ''}
                tone={tone}
              />
              <div style={{ minWidth: 0, flex: 1, textAlign: 'left' }}>
                <div
                  style={{
                    fontFamily: GEIST,
                    fontWeight: 600,
                    fontSize: 13.5,
                    color: user ? tone : 'var(--ed-fg-mute)',
                    letterSpacing: -0.2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {handle ?? 'No handle'}
                </div>
                <div
                  style={{
                    fontFamily: GMONO,
                    fontSize: 10,
                    color: 'var(--ed-fg-mute)',
                  }}
                >
                  {user
                    ? tierForRating(user.rating).label.toLowerCase()
                    : 'not linked'}
                </div>
              </div>
              {/* Live status pip — visible at-a-glance even when popover closed */}
              <span
                className="ed-breathe"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: dotColor,
                  color: dotColor,
                  flexShrink: 0,
                  marginRight: 4,
                }}
                aria-label={statusLabel}
              />
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="start"
            sideOffset={8}
            style={{
              width: 240,
              padding: 6,
              background: 'var(--ed-bg-1)',
              border: '1px solid var(--ed-line)',
              borderRadius: 10,
              boxShadow: '0 8px 32px -12px rgba(0,0,0,0.5)',
            }}
          >
            <div
              style={{
                padding: '10px 10px 12px',
                borderBottom: '1px solid var(--ed-line)',
                marginBottom: 4,
                fontFamily: GMONO,
                fontSize: 10.5,
                color: 'var(--ed-fg-dim)',
                letterSpacing: 0.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {statusLabel}
            </div>

            {handle && (
              <PopoverItem
                onClick={resyncNow}
                disabled={status === 'syncing'}
                label={status === 'syncing' ? 'Syncing…' : 'Resync now'}
              />
            )}
            <PopoverItem onClick={() => setTweaksOpen(true)} label="Tweaks" />
            {handle && (
              <PopoverItem
                onClick={() => signOut(navigate)}
                label="Sign out"
                tone="var(--ed-err)"
              />
            )}
            {!handle && (
              <PopoverItem
                onClick={() => navigate('/onboarding')}
                label="Link a handle"
                tone="var(--ed-pri)"
              />
            )}
          </PopoverContent>
        </Popover>
      </div>
    </aside>
  );
}

function BrandMark({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden
      style={{ display: 'block', flexShrink: 0 }}
    >
      <rect width="64" height="64" rx="14" fill="#863bff" />
      <g transform="translate(8 9)">
        <path
          fill="#ffffff"
          d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"
        />
      </g>
    </svg>
  );
}

const AVATAR_BASE: CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: '50%',
  background: 'var(--ed-bg-2)',
  flexShrink: 0,
};

function ProfileAvatar({
  avatar,
  handle,
  tone,
}: {
  avatar?: string;
  handle: string;
  tone: string;
}) {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={handle}
        width={32}
        height={32}
        style={{
          ...AVATAR_BASE,
          objectFit: 'cover',
          border: `1.5px solid ${tone}`,
        }}
      />
    );
  }
  const accent = handle ? tone : 'var(--ed-fg-faint)';
  return (
    <div
      style={{
        ...AVATAR_BASE,
        border: `1.5px solid ${handle ? tone : 'var(--ed-line)'}`,
        display: 'grid',
        placeItems: 'center',
        color: accent,
        fontFamily: GEIST,
        fontWeight: 600,
        fontSize: 13,
      }}
    >
      {handle ? handle[0]?.toUpperCase() : '?'}
    </div>
  );
}

function PopoverItem({
  label,
  onClick,
  disabled,
  tone,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="ed-popover-item"
      style={{
        width: '100%',
        background: 'transparent',
        border: 'none',
        padding: '8px 10px',
        borderRadius: 6,
        textAlign: 'left',
        fontFamily: GEIST,
        fontSize: 13,
        color: tone ?? 'var(--ed-fg)',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.55 : 1,
      }}
    >
      {label}
    </button>
  );
}
