import { useSearchParams } from 'react-router-dom'
import { useCallback, useMemo } from 'react'
import type { QueryParams, SortParam } from '@/lib/api-client/types'

/**
 * Keeps grid state shareable/bookmarkable and preserved across
 * "open detail page -> go back". Reads/writes a handful of query
 * params rather than the whole QueryParams object as JSON, so URLs
 * stay readable (e.g. ?page=2&sortField=name&sortDir=asc).
 */
export function useDataGridUrlState(defaultPageSize: number, defaultSort: SortParam | null = null) {
  const [searchParams, setSearchParams] = useSearchParams()

  const page = Number(searchParams.get('page') ?? '1')
  const pageSize = Number(searchParams.get('pageSize') ?? String(defaultPageSize))
  const sortField = searchParams.get('sortField')
  const sortDir = searchParams.get('sortDir') as SortParam['direction'] | null
  const sort: SortParam | null =
    sortField && sortDir ? { field: sortField, direction: sortDir } : defaultSort

  const filters: Record<string, string> = {}
  searchParams.forEach((value, key) => {
    if (key.startsWith('f_')) filters[key.slice(2)] = value
  })

  const params: QueryParams = useMemo(
    () => ({ page, pageSize, sort, filters }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [page, pageSize, sortField, sortDir, JSON.stringify(filters)],
  )

  const setPage = useCallback(
    (newPage: number) => {
      setSearchParams((prev) => {
        prev.set('page', String(newPage))
        return prev
      })
    },
    [setSearchParams],
  )

  const setPageSize = useCallback(
    (newSize: number) => {
      setSearchParams((prev) => {
        prev.set('pageSize', String(newSize))
        prev.set('page', '1')
        return prev
      })
    },
    [setSearchParams],
  )

  const setSort = useCallback(
    (newSort: SortParam | null) => {
      setSearchParams((prev) => {
        if (newSort) {
          prev.set('sortField', newSort.field)
          prev.set('sortDir', newSort.direction)
        } else {
          prev.delete('sortField')
          prev.delete('sortDir')
        }
        return prev
      })
    },
    [setSearchParams],
  )

  const setFilters = useCallback(
    (newFilters: Record<string, unknown>) => {
      setSearchParams((prev) => {
        Array.from(prev.keys())
          .filter((k) => k.startsWith('f_'))
          .forEach((k) => prev.delete(k))
        Object.entries(newFilters).forEach(([k, v]) => {
          if (v !== '' && v != null) prev.set(`f_${k}`, String(v))
        })
        prev.set('page', '1')
        return prev
      })
    },
    [setSearchParams],
  )

  return { params, setPage, setPageSize, setSort, setFilters }
}
