import { useState } from 'react'
import {
  Paper, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, TableSortLabel,
  Checkbox, TablePagination, Box, Typography, Button, Alert,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { FilterBar } from '@/components/filters/FilterBar'
import { DataGridToolbar } from './DataGridToolbar'
import { DataGridSkeletonRows } from './DataGridSkeletonRows'
import { DataGridViewControls } from './DataGridViewControls'
import { RowMenu } from './RowMenu'
import { useDataGridUrlState } from './use-data-grid-url-state'
import { useFilterPresets } from './use-filter-presets'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useToast } from '@/components/feedback/ToastProvider'
import { exportToCsv } from '@/lib/export/csv-export'
import type { AdvancedDataGridConfig } from './types'
import type { SortParam } from '@/lib/api-client/types'

/**
 * One config object drives filters, sorting (client or server), pagination
 * (client or server), row click navigation, row menu, bulk selection, and
 * the export/mail toolbar. See `modules/leads/components/LeadsListPage.tsx`
 * for the reference usage — new modules should copy that pattern rather
 * than reaching into this file.
 */
export function AdvancedDataGrid<T extends { id: string }>(config: AdvancedDataGridConfig<T>) {
  const { t } = useTranslation()
  const {
    columns, fetchFn, queryKey,
    sorting = { mode: 'server' as const },
    pagination = { mode: 'server' as const, pageSizeOptions: [10, 25, 50], defaultPageSize: 10 },
    filters, rowActions, toolbar, selection, onRowClick, urlSync = true, emptyMessage,
  } = config

  const defaultPageSize = pagination.defaultPageSize ?? 10
  const urlState = useDataGridUrlState(defaultPageSize, sorting.defaultSort ?? null)

  // Local (non-URL) fallback state — used when urlSync is turned off for a given grid instance.
  const [localParams, setLocalParams] = useState({
    page: 1,
    pageSize: defaultPageSize,
    sort: sorting.defaultSort ?? null,
    filters: {} as Record<string, unknown>,
  })

  const params = urlSync ? urlState.params : localParams
  const setPage = urlSync ? urlState.setPage : (p: number) => setLocalParams((s) => ({ ...s, page: p }))
  const setPageSize = urlSync
    ? urlState.setPageSize
    : (ps: number) => setLocalParams((s) => ({ ...s, pageSize: ps, page: 1 }))
  const setSort = urlSync
    ? urlState.setSort
    : (s: SortParam | null) => setLocalParams((st) => ({ ...st, sort: s }))
  const setFilters = urlSync
    ? urlState.setFilters
    : (f: Record<string, unknown>) => setLocalParams((s) => ({ ...s, filters: f, page: 1 }))

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [hiddenFields, setHiddenFields] = useState<Set<string>>(new Set())
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable')
  const { presets, savePreset, deletePreset } = useFilterPresets(queryKey)
  const { showToast } = useToast()
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (format: 'csv' | 'xlsx' = 'csv') => {
    if (toolbar?.exportFn) {
      await toolbar.exportFn(params)
      return
    }
    if (toolbar?.exportColumns) {
      setIsExporting(true)
      try {
        const exporter =
          format === 'xlsx' ? (await import('@/lib/export/xlsx-export')).exportToXlsx : exportToCsv
        const count = await exporter(fetchFn, params, toolbar.exportColumns, toolbar.exportFilename ?? queryKey)
        showToast(`Exported ${count} row${count === 1 ? '' : 's'}`, 'success')
      } catch {
        showToast('Export failed', 'error')
      } finally {
        setIsExporting(false)
      }
    }
  }

  const exactFilterFields = filters?.fields.filter((f) => f.type !== 'text').map((f) => f.name)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [queryKey, params],
    queryFn: () => fetchFn({ ...params, exactFilterFields }),
    placeholderData: (prev) => prev,
  })

  const rows = data?.items ?? []
  const visibleColumns = columns.filter((c) => !hiddenFields.has(c.field))

  const toggleColumnVisibility = (field: string) => {
    setHiddenFields((prev) => {
      const next = new Set(prev)
      if (next.has(field)) next.delete(field)
      else next.add(field)
      return next
    })
  }

  const handleSortClick = (field: string) => {
    if (params.sort?.field === field) {
      setSort(params.sort.direction === 'asc' ? { field, direction: 'desc' } : null)
    } else {
      setSort({ field, direction: 'asc' })
    }
  }

  const toggleSelectAll = () => {
    setSelectedIds((prev) => (prev.size === rows.length ? new Set() : new Set(rows.map((r) => r.id))))
  }
  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const selectedRows = rows.filter((r) => selectedIds.has(r.id))

  return (
    <Box>
      {filters && filters.fields.length > 0 && (
        <FilterBar
          fields={filters.fields}
          onApply={setFilters}
          onClear={() => setFilters({})}
          presets={presets}
          onSavePreset={savePreset}
          onDeletePreset={deletePreset}
        />
      )}

      {(toolbar?.exportFn || toolbar?.exportColumns || toolbar?.sendMailFn || toolbar?.showRefresh || selection?.bulkActions) && (
        <DataGridToolbar
          onExport={toolbar?.exportFn || toolbar?.exportColumns ? handleExport : undefined}
          exportFormats={toolbar?.exportFormats ?? ['csv']}
          isExporting={isExporting}
          onSendMail={toolbar?.sendMailFn ? () => toolbar.sendMailFn!(params) : undefined}
          onRefresh={() => refetch()}
          showRefresh={toolbar?.showRefresh}
          selectedRows={selectedRows}
          bulkActions={selection?.bulkActions}
        />
      )}

      <DataGridViewControls
        columns={columns}
        hiddenFields={hiddenFields}
        onToggleColumn={toggleColumnVisibility}
        density={density}
        onDensityChange={setDensity}
      />

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'min(70vh, 640px)' }}>
          <Table size={density === 'compact' ? 'small' : 'medium'} stickyHeader>
            <TableHead>
            <TableRow>
              {selection?.enabled && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedIds.size > 0 && selectedIds.size < rows.length}
                    checked={rows.length > 0 && selectedIds.size === rows.length}
                    onChange={toggleSelectAll}
                  />
                </TableCell>
              )}
              {visibleColumns.map((col) => {
                const headerCell = (
                  <TableCell key={col.field} width={col.width}>
                    {col.sortable ? (
                      <TableSortLabel
                        active={params.sort?.field === col.field}
                        direction={params.sort?.field === col.field ? params.sort.direction : 'asc'}
                        onClick={() => handleSortClick(col.field)}
                      >
                        {col.headerName}
                      </TableSortLabel>
                    ) : (
                      col.headerName
                    )}
                  </TableCell>
                )
                return col.permission ? (
                  <RequirePermission key={col.field} permission={col.permission}>
                    {headerCell}
                  </RequirePermission>
                ) : (
                  headerCell
                )
              })}
              {rowActions && <TableCell align="right" width={48} />}
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading && (
              <DataGridSkeletonRows
                rowCount={params.pageSize ?? defaultPageSize}
                columnCount={visibleColumns.length + (selection?.enabled ? 1 : 0) + (rowActions ? 1 : 0)}
              />
            )}

            {isError && !isLoading && (
              <TableRow>
                <TableCell colSpan={visibleColumns.length + 2}>
                  <Alert
                    severity="error"
                    action={
                      <Button size="small" onClick={() => refetch()}>
                        {t('common.retry')}
                      </Button>
                    }
                  >
                    {t('common.somethingWentWrong')}
                  </Alert>
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !isError && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={visibleColumns.length + 2}>
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    {emptyMessage ?? t('common.noResults')}
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              !isError &&
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  hover={!!onRowClick}
                  onClick={() => onRowClick?.(row)}
                  tabIndex={onRowClick ? 0 : undefined}
                  onKeyDown={
                    onRowClick
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            onRowClick(row)
                          }
                        }
                      : undefined
                  }
                  sx={{
                    cursor: onRowClick ? 'pointer' : 'default',
                    '&:focus-visible': onRowClick ? { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: -2 } : undefined,
                  }}
                >
                  {selection?.enabled && (
                    <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={selectedIds.has(row.id)} onChange={() => toggleSelectOne(row.id)} />
                    </TableCell>
                  )}
                  {visibleColumns.map((col) => {
                    const cell = (
                      <TableCell key={col.field}>
                        {col.renderCell ? col.renderCell(row) : String((row as Record<string, unknown>)[col.field] ?? '')}
                      </TableCell>
                    )
                    return col.permission ? (
                      <RequirePermission key={col.field} permission={col.permission}>
                        {cell}
                      </RequirePermission>
                    ) : (
                      cell
                    )
                  })}
                  {rowActions && (
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <RowMenu row={row} items={rowActions.items} />
                    </TableCell>
                  )}
                </TableRow>
              ))}
          </TableBody>
        </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={data?.total ?? 0}
          page={(params.page ?? 1) - 1}
          onPageChange={(_, newPage) => setPage(newPage + 1)}
          rowsPerPage={params.pageSize ?? defaultPageSize}
          rowsPerPageOptions={pagination.pageSizeOptions ?? [10, 25, 50]}
          onRowsPerPageChange={(e) => setPageSize(parseInt(e.target.value, 10))}
          labelRowsPerPage={t('common.rowsPerPage')}
        />
      </Paper>
    </Box>
  )
}
