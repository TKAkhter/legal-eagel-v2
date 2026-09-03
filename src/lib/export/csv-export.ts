import Papa from 'papaparse'
import type { QueryParams, PagedResult } from '@/lib/api-client/types'

export interface ExportColumn<T> {
  header: string
  /** Maps a row to the cell value for this column — keep it plain strings/numbers, not JSX. */
  value: (row: T) => string | number
}

/**
 * Generic CSV export: re-fetches every row matching the grid's current
 * filters/sort (not just the visible page) with a large page size, then
 * downloads a CSV built from `columns`. Works against the same
 * `fetchFn` every `AdvancedDataGrid` already uses — mock or real, this
 * doesn't care which.
 */
export async function exportToCsv<T>(
  fetchFn: (params: QueryParams) => Promise<PagedResult<T>>,
  params: QueryParams,
  columns: ExportColumn<T>[],
  filename: string,
): Promise<number> {
  const { items } = await fetchFn({ ...params, page: 1, pageSize: 10_000 })

  const csv = Papa.unparse({
    fields: columns.map((c) => c.header),
    data: items.map((row) => columns.map((c) => c.value(row))),
  })

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  return items.length
}
