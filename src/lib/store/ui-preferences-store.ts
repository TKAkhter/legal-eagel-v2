import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ThemeMode, ThemeDirection, AccentPreset } from '@/theme'

export type LayoutMode = 'sidebar' | 'horizontal'

interface UiPreferencesState {
  mode: ThemeMode
  direction: ThemeDirection
  accent: AccentPreset
  layoutMode: LayoutMode
  setMode: (mode: ThemeMode) => void
  toggleMode: () => void
  setDirection: (direction: ThemeDirection) => void
  setAccent: (accent: AccentPreset) => void
  setLayoutMode: (layoutMode: LayoutMode) => void
}

/**
 * Kept separate from `navStore` (below) on purpose: this slice is
 * user-preference state that would map to Next.js cookies/local storage
 * the same way after a migration, while nav/layout state is more
 * session/viewport driven.
 */
export const useUiPreferences = create<UiPreferencesState>()(
  persist(
    (set) => ({
      mode: 'light',
      direction: 'ltr',
      accent: 'teal',
      layoutMode: 'sidebar',
      setMode: (mode) => set({ mode }),
      toggleMode: () => set((s) => ({ mode: s.mode === 'light' ? 'dark' : 'light' })),
      setDirection: (direction) => set({ direction }),
      setAccent: (accent) => set({ accent }),
      setLayoutMode: (layoutMode) => set({ layoutMode }),
    }),
    { name: 'ui-preferences' },
  ),
)
