import type { PagedResult, QueryParams } from './types'

/**
 * Applies filters/search/sort/pagination to an in-memory array the same
 * way a real backend query would. Used only by the mock layer — a real
 * API implements this logic server-side, and this function's contract
 * (`QueryParams` in, `PagedResult<T>` out) is exactly what
 * `httpClient.get(resource, { params })` is expected to return too.
 */
export function runInMemoryQuery<T extends { id: string }>(
  data: T[],
  params: QueryParams,
): PagedResult<T> {
  let rows = [...data]

  if (params.filters) {
    const exactFields = new Set(params.exactFilterFields ?? [])
    for (const [key, value] of Object.entries(params.filters)) {
      if (value === undefined || value === null || value === '') continue
      rows = rows.filter((row) => {
        const cell = (row as Record<string, unknown>)[key]
        if (cell == null) return false
        if (typeof value === 'string') {
          return exactFields.has(key)
            ? String(cell).toLowerCase() === value.toLowerCase()
            : String(cell).toLowerCase().includes(value.toLowerCase())
        }
        return cell === value
      })
    }
  }

  if (params.search) {
    const q = params.search.toLowerCase()
    rows = rows.filter((row) =>
      Object.values(row as Record<string, unknown>).some(
        (v) => v != null && String(v).toLowerCase().includes(q),
      ),
    )
  }

  if (params.sort) {
    const { field, direction } = params.sort
    rows.sort((a, b) => {
      const av = (a as Record<string, unknown>)[field] as string | number
      const bv = (b as Record<string, unknown>)[field] as string | number
      if (av == null || bv == null) return 0
      if (av < bv) return direction === 'asc' ? -1 : 1
      if (av > bv) return direction === 'asc' ? 1 : -1
      return 0
    })
  }

  const total = rows.length
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 10
  const start = (page - 1) * pageSize
  const items = rows.slice(start, start + pageSize)

  return { items, total, page, pageSize }
}
