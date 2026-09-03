import * as XLSX from 'xlsx'
import type { QueryParams, PagedResult } from '@/lib/api-client/types'
import type { ExportColumn } from './csv-export'

/**
 * Mirrors `exportToCsv`'s contract exactly (same `fetchFn`/`params`/
 * `columns` shape) — the only difference is the output format, so
 * callers can offer both without writing two integrations.
 */
export async function exportToXlsx<T>(
  fetchFn: (params: QueryParams) => Promise<PagedResult<T>>,
  params: QueryParams,
  columns: ExportColumn<T>[],
  filename: string,
): Promise<number> {
  const { items } = await fetchFn({ ...params, page: 1, pageSize: 10_000 })

  const rows = [columns.map((c) => c.header), ...items.map((row) => columns.map((c) => c.value(row)))]

  const worksheet = XLSX.utils.aoa_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Export')

  const name = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`
  XLSX.writeFile(workbook, name)

  return items.length
}
