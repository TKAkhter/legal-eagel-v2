import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ActivityRecord {
  /** e.g. "leads", "clients" — matches the module's route prefix. */
  module: string
  id: string
  label: string
  path: string
}

interface ActivityState {
  favorites: ActivityRecord[]
  recentlyViewed: ActivityRecord[]
  toggleFavorite: (record: ActivityRecord) => void
  isFavorite: (module: string, id: string) => boolean
  trackViewed: (record: ActivityRecord) => void
}

const RECENTLY_VIEWED_LIMIT = 8

/**
 * One store for both, since they're both "list of records the user
 * has touched" and typically shown together on the Dashboard. Detail
 * pages call `trackViewed` once (see `useTrackRecentlyViewed`); the
 * star toggle on a detail page or row menu calls `toggleFavorite`.
 */
export const useActivityStore = create<ActivityState>()(
  persist(
    (set, get) => ({
      favorites: [],
      recentlyViewed: [],

      toggleFavorite: (record) => {
        set((s) => {
          const exists = s.favorites.some((f) => f.module === record.module && f.id === record.id)
          return {
            favorites: exists
              ? s.favorites.filter((f) => !(f.module === record.module && f.id === record.id))
              : [record, ...s.favorites],
          }
        })
      },

      isFavorite: (module, id) => get().favorites.some((f) => f.module === module && f.id === id),

      trackViewed: (record) => {
        set((s) => {
          const withoutDupe = s.recentlyViewed.filter((r) => !(r.module === record.module && r.id === record.id))
          return { recentlyViewed: [record, ...withoutDupe].slice(0, RECENTLY_VIEWED_LIMIT) }
        })
      },
    }),
    { name: 'activity' },
  ),
)
