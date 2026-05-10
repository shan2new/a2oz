// Persisted theme + density.
//
// IMPORTANT: import this module from main.tsx BEFORE the first React render
// (just `import './store/settingsStore'` is enough). The module's top-level
// applySettingsToDOM() call writes data-ed-theme / data-ed-density onto
// <html> synchronously, so first paint never flashes the wrong theme.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'dark' | 'light';
export type Density = 'compact' | 'comfortable' | 'roomy';

type SettingsState = {
  theme: Theme;
  density: Density;
  setTheme: (t: Theme) => void;
  setDensity: (d: Density) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'dark',
      density: 'comfortable',
      setTheme: (theme) => set({ theme }),
      setDensity: (density) => set({ density }),
    }),
    { name: 'a2oj-settings' },
  ),
);

export function applySettingsToDOM(): void {
  if (typeof document === 'undefined') return;
  const { theme, density } = useSettingsStore.getState();
  document.documentElement.dataset.edTheme = theme;
  document.documentElement.dataset.edDensity = density;
}

// Apply once now so the first paint (and Wave 1 Sidebar mount) sees the right
// tokens. Then subscribe so future toggles propagate without ad-hoc effects.
applySettingsToDOM();
useSettingsStore.subscribe(() => applySettingsToDOM());
