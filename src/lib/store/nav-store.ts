import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface NavState {
  /** Persisted user preference: rail collapsed to icons-only on desktop. */
  isCollapsed: boolean
  /** Transient: rail is temporarily flown-out because the user is hovering it. Never persisted. */
  isHoverExpanded: boolean
  /** Transient: overlay drawer open on tablet/mobile. Never persisted. */
  isMobileOpen: boolean

  toggleCollapsed: () => void
  setHoverExpanded: (value: boolean) => void
  openMobile: () => void
  closeMobile: () => void
  /** Single entry point for the hamburger button — behavior differs by breakpoint. */
  handleHamburgerClick: (breakpoint: 'desktop' | 'tablet' | 'mobile') => void
}

export const useNavStore = create<NavState>()(
  persist(
    (set, get) => ({
      isCollapsed: false,
      isHoverExpanded: false,
      isMobileOpen: false,

      toggleCollapsed: () => set((s) => ({ isCollapsed: !s.isCollapsed })),
      setHoverExpanded: (value) => set({ isHoverExpanded: value }),
      openMobile: () => set({ isMobileOpen: true }),
      closeMobile: () => set({ isMobileOpen: false }),

      handleHamburgerClick: (breakpoint) => {
        if (breakpoint === 'desktop') {
          get().toggleCollapsed()
        } else {
          set((s) => ({ isMobileOpen: !s.isMobileOpen }))
        }
      },
    }),
    {
      name: 'nav-preferences',
      // Only the desktop collapsed preference survives a reload —
      // hover state and mobile-drawer-open state are always transient.
      partialize: (s) => ({ isCollapsed: s.isCollapsed }),
    },
  ),
)
