import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/components/feedback/ToastProvider'
import type { PagedResult } from '@/lib/api-client/types'

interface UseOptimisticUpdateOptions<T extends { id: string }> {
  /** Must match the `queryKey` string passed to `AdvancedDataGrid` for this module (e.g. 'leads'). */
  queryKeyPrefix: string
  /** The module API's real update call. */
  updateFn: (id: string, patch: Partial<T>) => Promise<T>
  /** Shown when the real update fails and the optimistic change is rolled back. Defaults to a generic message. */
  errorMessage?: string
}

/**
 * Matches only `AdvancedDataGrid`'s list query key — `[prefix, params]`
 * where `params` is an object. A detail page caches a single record
 * under `[prefix, id]` (a plain string second element) and must never
 * be patched by this — same fix as `useUndoableDelete`'s query-key bug.
 */
function isListQueryKey(queryKey: readonly unknown[], prefix: string) {
  return queryKey[0] === prefix && queryKey.length === 2 && typeof queryKey[1] === 'object' && queryKey[1] !== null
}

/**
 * `const { updateOptimistic, updateManyOptimistic } = useOptimisticUpdate({ queryKeyPrefix: 'leads', updateFn: leadsApi.update })`
 *
 * Patches the grid's cached rows immediately — the UI reflects the
 * change without waiting for the network round-trip — then fires the
 * real update in the background. If it fails, the previous cache
 * state is restored and an error toast is shown. Use `updateOptimistic`
 * for a single row (e.g. a status toggle in a row menu) and
 * `updateManyOptimistic` for a bulk action on several rows at once.
 */
export function useOptimisticUpdate<T extends { id: string }>({
  queryKeyPrefix,
  updateFn,
  errorMessage,
}: UseOptimisticUpdateOptions<T>) {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  const snapshot = useCallback(
    () => queryClient.getQueriesData<PagedResult<T>>({ predicate: (q) => isListQueryKey(q.queryKey, queryKeyPrefix) }),
    [queryClient, queryKeyPrefix],
  )

  const patchCache = useCallback(
    (ids: Set<string>, patch: Partial<T>) => {
      queryClient.setQueriesData<PagedResult<T>>(
        { predicate: (q) => isListQueryKey(q.queryKey, queryKeyPrefix) },
        (old) =>
          old
            ? { ...old, items: old.items.map((row) => (ids.has(row.id) ? { ...row, ...patch } : row)) }
            : old,
      )
    },
    [queryClient, queryKeyPrefix],
  )

  const rollback = useCallback(
    (previous: ReturnType<typeof snapshot>) => {
      previous.forEach(([key, data]) => queryClient.setQueryData(key, data))
    },
    [queryClient],
  )

  const updateOptimistic = useCallback(
    async (id: string, patch: Partial<T>) => {
      const previous = snapshot()
      patchCache(new Set([id]), patch)
      try {
        await updateFn(id, patch)
      } catch {
        rollback(previous)
        showToast(errorMessage ?? "Couldn't save changes", 'error')
      }
    },
    [snapshot, patchCache, rollback, updateFn, errorMessage, showToast],
  )

  const updateManyOptimistic = useCallback(
    async (ids: string[], patch: Partial<T>) => {
      if (ids.length === 0) return
      const previous = snapshot()
      const idSet = new Set(ids)
      patchCache(idSet, patch)
      try {
        await Promise.all(ids.map((id) => updateFn(id, patch)))
      } catch {
        rollback(previous)
        showToast(errorMessage ?? "Couldn't save changes", 'error')
      }
    },
    [snapshot, patchCache, rollback, updateFn, errorMessage, showToast],
  )

  return { updateOptimistic, updateManyOptimistic }
}
