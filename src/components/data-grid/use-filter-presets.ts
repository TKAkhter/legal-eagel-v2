import { useState, useCallback } from 'react'

export interface FilterPreset {
  name: string
  filters: Record<string, unknown>
}

function storageKey(gridKey: string) {
  return `datagrid-filter-presets:${gridKey}`
}

/**
 * Local-only for now (per browser, not synced) — good enough for a
 * "remember my usual filters" convenience feature. If presets ever
 * need to be shared across a team, swap the localStorage read/write
 * below for an API call; the hook's return shape stays the same.
 */
export function useFilterPresets(gridKey: string) {
  const [presets, setPresets] = useState<FilterPreset[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey(gridKey))
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  const persist = useCallback(
    (next: FilterPreset[]) => {
      setPresets(next)
      try {
        localStorage.setItem(storageKey(gridKey), JSON.stringify(next))
      } catch {
        // localStorage unavailable (private browsing, quota) — presets just won't persist this session.
      }
    },
    [gridKey],
  )

  const savePreset = useCallback(
    (name: string, filters: Record<string, unknown>) => {
      persist([...presets.filter((p) => p.name !== name), { name, filters }])
    },
    [presets, persist],
  )

  const deletePreset = useCallback(
    (name: string) => {
      persist(presets.filter((p) => p.name !== name))
    },
    [presets, persist],
  )

  return { presets, savePreset, deletePreset }
}
