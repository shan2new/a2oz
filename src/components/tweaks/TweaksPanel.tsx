// TweaksPanel — Theme + density controls in a shadcn Sheet.
//
// WAVE 3 NOTE: This component is exported but NOT yet mounted in the React tree.
// Wave 3 must add <TweaksPanel /> inside Shell.tsx (next to <Outlet />) so the
// Sheet portal can attach. The sidebar trigger (Wave 1A) calls
// useUiStore.getState().setTweaksOpen(true) — the Sheet reads the same store.

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { useUiStore } from '@/store/uiStore';
import { useSettingsStore } from '@/store/settingsStore';
import type { Theme, Density } from '@/store/settingsStore';

// ── Pill button used for Theme and Density choices ──────────────────────────

type PillProps = {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

function Pill({ active, onClick, children }: PillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '6px 16px',
        borderRadius: 999,
        border: '1px solid var(--ed-line)',
        background: active ? 'var(--ed-bg-3)' : 'transparent',
        color: active ? 'var(--ed-fg)' : 'var(--ed-fg-dim)',
        fontFamily: "'DM Mono', ui-monospace, monospace",
        fontSize: 12,
        fontWeight: active ? 500 : 400,
        letterSpacing: 0.2,
        cursor: 'pointer',
        transition: 'background 0.15s ease, color 0.15s ease, border-color 0.15s ease',
        outline: 'none',
        whiteSpace: 'nowrap' as const,
      }}
      onMouseEnter={(e) => {
        if (!active) {
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--ed-fg-faint)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--ed-line)';
        }
      }}
    >
      {children}
    </button>
  );
}

// ── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "'DM Mono', ui-monospace, monospace",
        fontSize: 10,
        fontWeight: 600,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.14em',
        color: 'var(--ed-fg-mute)',
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

// ── TweaksPanel ─────────────────────────────────────────────────────────────

export function TweaksPanel() {
  const open = useUiStore((s) => s.tweaksOpen);
  const setOpen = useUiStore((s) => s.setTweaksOpen);

  const theme = useSettingsStore((s) => s.theme);
  const density = useSettingsStore((s) => s.density);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const setDensity = useSettingsStore((s) => s.setDensity);

  const resetDefaults = () => {
    setTheme('dark');
    setDensity('comfortable');
  };

  const themeOptions: { value: Theme; label: string }[] = [
    { value: 'dark', label: 'Dark' },
    { value: 'light', label: 'Light' },
  ];

  const densityOptions: { value: Density; label: string }[] = [
    { value: 'compact', label: 'Compact' },
    { value: 'comfortable', label: 'Comfortable' },
    { value: 'roomy', label: 'Roomy' },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        showCloseButton
        style={{
          width: 360,
          maxWidth: '90vw',
          background: 'var(--ed-bg-1)',
          borderLeft: '1px solid var(--ed-line)',
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          padding: 0,
        }}
      >
        {/* Header */}
        <SheetHeader
          style={{
            padding: '28px 28px 20px',
            borderBottom: '1px solid var(--ed-line)',
          }}
        >
          <SheetTitle
            style={{
              fontFamily: "'Geist', system-ui, sans-serif",
              fontSize: 26,
              fontWeight: 500,
              letterSpacing: -0.8,
              color: 'var(--ed-fg)',
              lineHeight: 1.1,
            }}
          >
            Tweaks
          </SheetTitle>
          <SheetDescription
            style={{
              fontFamily: "'DM Mono', ui-monospace, monospace",
              fontSize: 11,
              color: 'var(--ed-fg-mute)',
              letterSpacing: 0.2,
              marginTop: 6,
            }}
          >
            Theme + density. Persists locally.
          </SheetDescription>
        </SheetHeader>

        {/* Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: 28,
          }}
        >
          {/* Theme section */}
          <div>
            <SectionLabel>Theme</SectionLabel>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
              {themeOptions.map((opt) => (
                <Pill
                  key={opt.value}
                  active={theme === opt.value}
                  onClick={() => setTheme(opt.value)}
                >
                  {opt.label}
                </Pill>
              ))}
            </div>
          </div>

          {/* Density section */}
          <div>
            <SectionLabel>Density</SectionLabel>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
              {densityOptions.map((opt) => (
                <Pill
                  key={opt.value}
                  active={density === opt.value}
                  onClick={() => setDensity(opt.value)}
                >
                  {opt.label}
                </Pill>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--ed-line)' }} aria-hidden="true" />

          {/* Info note */}
          <div
            style={{
              fontFamily: "'DM Mono', ui-monospace, monospace",
              fontSize: 10.5,
              color: 'var(--ed-fg-faint)',
              letterSpacing: 0.2,
              lineHeight: 1.6,
            }}
          >
            Settings are saved to localStorage under{' '}
            <span style={{ color: 'var(--ed-fg-mute)' }}>a2oj-settings</span> and
            applied instantly via{' '}
            <span style={{ color: 'var(--ed-fg-mute)' }}>data-ed-theme</span> /{' '}
            <span style={{ color: 'var(--ed-fg-mute)' }}>data-ed-density</span> on{' '}
            <span style={{ color: 'var(--ed-fg-mute)' }}>&lt;html&gt;</span>.
          </div>
        </div>

        {/* Footer — Reset */}
        <div
          style={{
            padding: '16px 28px 24px',
            borderTop: '1px solid var(--ed-line)',
          }}
        >
          <button
            type="button"
            onClick={resetDefaults}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              fontFamily: "'DM Mono', ui-monospace, monospace",
              fontSize: 11.5,
              color: 'var(--ed-fg-mute)',
              letterSpacing: 0.2,
              cursor: 'pointer',
              textDecoration: 'underline',
              textDecorationColor: 'var(--ed-line)',
              textUnderlineOffset: 3,
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--ed-fg-dim)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--ed-fg-mute)';
            }}
          >
            Reset to defaults
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default TweaksPanel;
