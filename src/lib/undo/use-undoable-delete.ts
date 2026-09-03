import { useCallback, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/components/feedback/ToastProvider'
import { env } from '@/lib/env'
import type { PagedResult } from '@/lib/api-client/types'

interface UseUndoableDeleteOptions<T extends { id: string }> {
  /** Must match the `queryKey` string passed to `AdvancedDataGrid` for this module (e.g. 'leads'). */
  queryKeyPrefix: string
  /** The module API's real delete call — only invoked once the undo window passes without an undo. */
  removeFn: (id: string) => Promise<void>
  /** Label shown in the toast, e.g. `(row) => row.name`. */
  getLabel: (row: T) => string
  /** Defaults to `VITE_UNDO_WINDOW_MS` (see `.env.example`) — override per-call mainly for tests. */
  undoWindowMs?: number
}

/**
 * `const { deleteWithUndo } = useUndoableDelete({ queryKeyPrefix: 'leads', removeFn: leadsApi.remove, getLabel: (l) => l.name })`
 * then `deleteWithUndo(row)` from a row-menu or bulk-action handler.
 *
 * The row disappears from the grid immediately (optimistic cache
 * update) and a toast offers "Undo" for a few seconds. The real
 * `removeFn` call is deferred until the window passes — so "undo" is
 * just "never actually call delete," not a restore-after-the-fact
 * hack. Works for single or bulk delete the same way — call it once
 * per row, or loop it for a bulk action.
 */
export function useUndoableDelete<T extends { id: string }>({
  queryKeyPrefix,
  removeFn,
  getLabel,
  undoWindowMs = env.VITE_UNDO_WINDOW_MS,
}: UseUndoableDeleteOptions<T>) {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const pendingTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  /**
   * Matches only `AdvancedDataGrid`'s list query key — `[prefix, params]`
   * where `params` is an object (`{ page, pageSize, ... }`). A detail
   * page caches a single record under `[prefix, id]`, where the second
   * element is a plain string — same prefix, different shape, and must
   * NOT be touched by the list-hiding/restore logic below (it isn't a
   * `PagedResult` and has no `.items`).
   */
  const isListQueryKey = (queryKey: readonly unknown[]) =>
    queryKey[0] === queryKeyPrefix &&
    queryKey.length === 2 &&
    typeof queryKey[1] === 'object' &&
    queryKey[1] !== null

  const hideOptimistically = useCallback(
    (id: string) => {
      queryClient.setQueriesData<PagedResult<T>>(
        { predicate: (query) => isListQueryKey(query.queryKey) },
        (old) => (old ? { ...old, items: old.items.filter((r) => r.id !== id), total: old.total - 1 } : old),
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queryClient, queryKeyPrefix],
  )

  const restore = useCallback(() => {
    queryClient.invalidateQueries({ predicate: (query) => isListQueryKey(query.queryKey) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient, queryKeyPrefix])

  const deleteWithUndo = useCallback(
    (row: T) => {
      hideOptimistically(row.id)

      const timer = setTimeout(async () => {
        pendingTimers.current.delete(row.id)
        try {
          await removeFn(row.id)
        } catch {
          // Real delete failed after the undo window closed — bring the row back and let the user know.
          restore()
          showToast(`Couldn't delete ${getLabel(row)}`, 'error')
        }
      }, undoWindowMs)

      pendingTimers.current.set(row.id, timer)

      showToast(`${getLabel(row)} deleted`, 'success', {
        action: {
          label: 'Undo',
          onClick: () => {
            const pending = pendingTimers.current.get(row.id)
            if (pending) {
              clearTimeout(pending)
              pendingTimers.current.delete(row.id)
              restore()
            }
          },
        },
        durationMs: undoWindowMs + 1000,
      })
    },
    [hideOptimistically, restore, removeFn, getLabel, showToast, undoWindowMs],
  )

  /** Same pattern as `deleteWithUndo`, but for a batch — one toast, one shared undo, one shared timer for the whole selection. */
  const deleteManyWithUndo = useCallback(
    (rows: T[]) => {
      if (rows.length === 0) return
      rows.forEach((row) => hideOptimistically(row.id))

      const batchKey = rows.map((r) => r.id).join(',')
      const timer = setTimeout(async () => {
        pendingTimers.current.delete(batchKey)
        try {
          await Promise.all(rows.map((row) => removeFn(row.id)))
        } catch {
          restore()
          showToast(`Couldn't delete ${rows.length} items`, 'error')
        }
      }, undoWindowMs)

      pendingTimers.current.set(batchKey, timer)

      showToast(`${rows.length} item${rows.length === 1 ? '' : 's'} deleted`, 'success', {
        action: {
          label: 'Undo',
          onClick: () => {
            const pending = pendingTimers.current.get(batchKey)
            if (pending) {
              clearTimeout(pending)
              pendingTimers.current.delete(batchKey)
              restore()
            }
          },
        },
        durationMs: undoWindowMs + 1000,
      })
    },
    [hideOptimistically, restore, removeFn, showToast, undoWindowMs],
  )

  return { deleteWithUndo, deleteManyWithUndo }
}
