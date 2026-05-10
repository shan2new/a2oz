// Cross-component UI signals (no persistence).
//
// `tweaksOpen` lets the sidebar footer trigger (Wave 1A) and the TweaksPanel
// content (Wave 2E) coordinate without a parent prop bridge.

import { create } from 'zustand';

type UiState = {
  tweaksOpen: boolean;
  setTweaksOpen: (v: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
  tweaksOpen: false,
  setTweaksOpen: (tweaksOpen) => set({ tweaksOpen }),
}));
