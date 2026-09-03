import type { ReactNode } from 'react'
import type { PagedResult, QueryParams, SortParam } from '@/lib/api-client/types'
import type { PermissionKey } from '@/lib/auth/types'

export interface ColumnDef<T> {
  field: string
  headerName: string
  /** Custom cell rendering — chips, avatars, formatted dates/currency, etc. Falls back to raw field value. */
  renderCell?: (row: T) => ReactNode
  sortable?: boolean
  width?: number
  /** Hide this column entirely for users without this permission (not just disable it). */
  permission?: PermissionKey
}

export interface FilterFieldOption {
  value: string
  label: string
}

export interface FilterFieldConfig {
  name: string
  label: string
  type: 'text' | 'select' | 'radio'
  /** Static options for select/radio, OR an async loader (e.g. hitting an API for dropdown values). */
  options?: FilterFieldOption[] | (() => Promise<FilterFieldOption[]>)
}

export interface RowMenuItem<T> {
  label: string
  icon?: ReactNode
  onClick: (row: T) => void
  permission?: PermissionKey
  destructive?: boolean
}

export interface BulkAction<T> {
  label: string
  icon?: ReactNode
  onClick: (rows: T[]) => void
  permission?: PermissionKey
}

export interface ExportColumnDef<T> {
  header: string
  value: (row: T) => string | number
}

export interface AdvancedDataGridConfig<T extends { id: string }> {
  columns: ColumnDef<T>[]
  fetchFn: (params: QueryParams) => Promise<PagedResult<T>>
  queryKey: string

  sorting?: { mode: 'client' | 'server'; defaultSort?: SortParam }
  pagination?: { mode: 'client' | 'server'; pageSizeOptions?: number[]; defaultPageSize?: number }
  filters?: { fields: FilterFieldConfig[] }

  rowActions?: { items: RowMenuItem<T>[] }
  toolbar?: {
    /**
     * Provide these two to get a real "export everything matching the
     * current filters/sort to CSV" button for free — see
     * `LeadsListPage` for the reference usage. Use `exportFn` instead
     * only when export needs custom behavior (a different format, a
     * server-generated file, etc.); the two are mutually exclusive,
     * `exportFn` wins if both are somehow set.
     */
    exportColumns?: ExportColumnDef<T>[]
    exportFilename?: string
    /** Which formats the real export offers when `exportColumns` is set. Defaults to `['csv']`; add 'xlsx' for an Excel option too. */
    exportFormats?: ('csv' | 'xlsx')[]
    exportFn?: (params: QueryParams) => void | Promise<void>
    sendMailFn?: (params: QueryParams) => void | Promise<void>
    showRefresh?: boolean
  }
  selection?: { enabled: boolean; bulkActions?: BulkAction<T>[] }

  /** Row click navigates to a detail page — omit for non-clickable rows. */
  onRowClick?: (row: T) => void

  /** Sync filters/sort/pagination to the URL query string. Defaults to true. */
  urlSync?: boolean
  emptyMessage?: string
}
