import { useEffect, useState } from 'react';

type ConnectingLogProps = {
  handle: string;
  onComplete: () => void;
};

export function ConnectingLog({ handle, onComplete }: ConnectingLogProps) {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);

  const LINES = [
    `resolving codeforces.com/profile/${handle}…`,
    'profile found · pulling submissions',
    '847 submissions indexed',
    'cross-referencing 8,148-problem catalog',
    'computing ladder progress',
    'ready.',
  ];

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Stream in each line: 220ms initial delay, 320ms between each
    LINES.forEach((line, i) => {
      const t = setTimeout(() => {
        setVisibleLines((prev) => [...prev, line]);
      }, 220 + i * 320);
      timers.push(t);
    });

    // After 6th line, wait ~400ms beat then call onComplete
    const completionDelay = 220 + (LINES.length - 1) * 320 + 400;
    const completionTimer = setTimeout(onComplete, completionDelay);
    timers.push(completionTimer);

    return () => {
      timers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDone = visibleLines.length >= LINES.length;

  return (
    <div style={{
      width: '100%',
      maxWidth: 540,
      margin: '0 24px',
      background: 'var(--ed-bg-1)',
      border: '1px solid var(--ed-line)',
      borderRadius: 10,
      padding: '14px 18px',
      fontFamily: "'DM Mono', ui-monospace, monospace",
      fontSize: 12,
      minHeight: 158,
      boxShadow: 'var(--ed-glow)',
    }}>
      {visibleLines.map((line, i) => {
        const isLast = i === visibleLines.length - 1;
        const isActiveLine = isLast && !isDone;
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
            <span style={{
              color: isActiveLine ? 'var(--ed-pri)' : 'var(--ed-ok)',
              width: 10,
              flexShrink: 0,
            }}>
              {isActiveLine ? '◦' : '✓'}
            </span>
            <span style={{
              color: isLast ? 'var(--ed-fg)' : 'var(--ed-fg-dim)',
            }}>
              {line}
            </span>
          </div>
        );
      })}

      {/* Trailing typewriter dots while still streaming */}
      {!isDone && visibleLines.length > 0 && (
        <div style={{
          padding: '3px 0',
          paddingLeft: 20,
          color: 'var(--ed-fg-mute)',
        }}>
          <span className="ed-dot-blink">
            <span>.</span><span>.</span><span>.</span>
          </span>
        </div>
      )}
    </div>
  );
}
