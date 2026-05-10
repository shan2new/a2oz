// Wave 0 placeholder. Wave 1C will replace this with the real <Shell> +
// router setup. Until then it just proves tokens render correctly.

export default function App() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: 'var(--ed-bg-0)',
        color: 'var(--ed-fg)',
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontFamily: "'Geist', system-ui, sans-serif",
            fontSize: 40,
            fontWeight: 500,
            letterSpacing: -1.6,
          }}
        >
          A2OJ Reimagined
        </div>
        <div
          style={{
            marginTop: 8,
            fontFamily: "'DM Mono', ui-monospace, monospace",
            fontSize: 11,
            color: 'var(--ed-fg-mute)',
            letterSpacing: 1.5,
            textTransform: 'uppercase',
          }}
        >
          wave 0 · foundations laid
        </div>
      </div>
    </div>
  );
}
