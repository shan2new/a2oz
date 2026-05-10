// Sidebar — 252px fixed column.
// Wordmark → UserCard/UserEmpty → Nav → TierLadder → Footer.

import { NavLink } from 'react-router-dom';
import { useUserStore } from '@/store/userStore';
import { useUiStore } from '@/store/uiStore';
import { ratingTone } from '@/lib/ratingTone';
import { UserCard } from './UserCard';
import { UserEmpty } from './UserEmpty';
import { TierLadder } from './TierLadder';

const GEIST = "'Geist', system-ui, sans-serif";
const GMONO = "'Geist Mono', ui-monospace, monospace";

const NAV_ITEMS = [
  { label: 'Overview',   to: '/',           k: '⌘1' },
  { label: 'Ladders',    to: '/ladders',    k: '⌘2' },
  { label: 'Categories', to: '/categories', k: '⌘3' },
  { label: 'Progress',   to: '/progress',   k: '⌘4' },
] as const;

export function Sidebar() {
  const user = useUserStore((s) => s.user);
  const setTweaksOpen = useUiStore((s) => s.setTweaksOpen);

  // Tier tone for active nav indicator; default to indigo when no user
  const tone = user ? ratingTone(user.rating) : 'var(--ed-r-indigo)';

  return (
    <aside
      style={{
        background: 'var(--ed-bg-0)',
        borderRight: '1px solid var(--ed-line)',
        display: 'flex',
        flexDirection: 'column',
        padding: '22px 18px 18px',
        position: 'relative',
        // The sidebar is inside a grid column, so it naturally fills to full
        // viewport height. No extra height declarations needed.
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
          alignItems: 'baseline',
          gap: 8,
        }}
      >
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
          A2OJ
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

      {/* User card */}
      {user ? <UserCard /> : <UserEmpty />}

      {/* Primary nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 1, marginTop: 26 }}>
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
                {/* 2px tier-toned left bar — protrudes 18px out of the sidebar column */}
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

      {/* Tier ladder — only when user exists */}
      {user && <TierLadder rating={user.rating} />}

      {/* Footer */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: 16,
          borderTop: '1px solid var(--ed-line)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span
            className="ed-breathe"
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: 'var(--ed-ok)',
              color: 'var(--ed-ok)',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: GMONO,
              fontSize: 10,
              color: 'var(--ed-fg-mute)',
              letterSpacing: 0.2,
            }}
          >
            live · synced 2m ago
          </span>
        </div>

        {/* Tweaks button */}
        <button
          onClick={() => setTweaksOpen(true)}
          style={{
            background: 'transparent',
            border: '1px solid var(--ed-line)',
            borderRadius: 6,
            padding: '4px 10px',
            fontFamily: GMONO,
            fontSize: 10,
            color: 'var(--ed-fg-mute)',
            letterSpacing: 0.3,
            cursor: 'pointer',
            transition: 'border-color .14s ease, color .14s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--ed-fg-faint)';
            e.currentTarget.style.color = 'var(--ed-fg-dim)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--ed-line)';
            e.currentTarget.style.color = 'var(--ed-fg-mute)';
          }}
        >
          Tweaks
        </button>
      </div>
    </aside>
  );
}
