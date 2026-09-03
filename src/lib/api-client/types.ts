export interface PagedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface SortParam {
  field: string
  direction: 'asc' | 'desc'
}

export interface QueryParams {
  page?: number
  pageSize?: number
  sort?: SortParam | null
  filters?: Record<string, unknown>
  search?: string
  /**
   * Field names that should be matched exactly rather than as a
   * substring — set automatically by `AdvancedDataGrid` for any
   * 'select'/'radio' filter field, since e.g. a "status" filter for
   * "active" shouldn't also match a row whose status is "inactive".
   * Only consumed by the mock in-memory query engine; a real backend
   * decides its own filter semantics and can ignore this.
   */
  exactFilterFields?: string[]
}
