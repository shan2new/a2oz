import { useEffect, useRef, useState } from 'react';
import { useUserStore, type SyncPhase } from '@/store/userStore';

type LineEntry = { phase: SyncPhase | 'error'; message: string };

type ConnectingLogProps = {
  handle: string;
  error: string | null;
  onRetry: () => void;
};

export function ConnectingLog({ handle, error, onRetry }: ConnectingLogProps) {
  const progress = useUserStore((s) => s.syncProgress);
  const status = useUserStore((s) => s.status);
  const [lines, setLines] = useState<LineEntry[]>([
    { phase: 'profile', message: `resolving codeforces.com/profile/${handle}…` },
  ]);
  const lastPhase = useRef<SyncPhase | null>('profile');

  useEffect(() => {
    if (!progress) return;
    setLines((prev) => {
      const last = prev[prev.length - 1];
      // Same phase, just an updated counter — replace the last line in place.
      if (last && last.phase === progress.phase) {
        return [...prev.slice(0, -1), { phase: progress.phase, message: progress.message }];
      }
      lastPhase.current = progress.phase;
      return [...prev, { phase: progress.phase, message: progress.message }];
    });
  }, [progress]);

  useEffect(() => {
    if (error) {
      setLines((prev) => [...prev, { phase: 'error', message: error }]);
    }
  }, [error]);

  const isDone = status === 'idle' && lines.some((l) => l.message === 'ready.');
  const isError = status === 'error';

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 540,
        background: 'var(--ed-bg-1)',
        border: `1px solid ${isError ? 'var(--ed-err)' : 'var(--ed-line)'}`,
        borderRadius: 10,
        padding: '14px 18px',
        fontFamily: "'DM Mono', ui-monospace, monospace",
        fontSize: 12,
        minHeight: 158,
        boxShadow: 'var(--ed-glow)',
      }}
    >
      {lines.map((l, i) => {
        const isLast = i === lines.length - 1;
        const isActive = isLast && !isDone && !isError && l.phase !== 'error';
        const isErrorLine = l.phase === 'error';
        return (
          <div
            key={i}
            className="ed-blur-in"
            style={{
              padding: '3px 0',
              display: 'flex',
              gap: 10,
              alignItems: 'baseline',
            }}
          >
            <span
              style={{
                color: isErrorLine
                  ? 'var(--ed-err)'
                  : isActive
                  ? 'var(--ed-pri)'
                  : 'var(--ed-ok)',
                width: 10,
                flexShrink: 0,
              }}
            >
              {isErrorLine ? '×' : isActive ? '◦' : '✓'}
            </span>
            <span
              style={{
                color: isErrorLine
                  ? 'var(--ed-err)'
                  : isLast
                  ? 'var(--ed-fg)'
                  : 'var(--ed-fg-dim)',
              }}
            >
              {l.message}
            </span>
          </div>
        );
      })}

      {!isDone && !isError && (
        <div
          style={{
            padding: '3px 0',
            paddingLeft: 20,
            color: 'var(--ed-fg-mute)',
          }}
        >
          <span className="ed-dot-blink">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </div>
      )}

      {isError && (
        <button
          onClick={onRetry}
          style={{
            marginTop: 14,
            background: 'transparent',
            border: '1px solid var(--ed-err)',
            color: 'var(--ed-err)',
            borderRadius: 6,
            padding: '6px 12px',
            fontSize: 11,
            fontFamily: "'DM Mono', ui-monospace, monospace",
            cursor: 'pointer',
            letterSpacing: '0.04em',
          }}
        >
          ← try a different handle
        </button>
      )}
    </div>
  );
}
