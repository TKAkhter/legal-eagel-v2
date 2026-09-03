import { Box, Typography, Chip } from '@mui/material'
import { auditLogApi } from '@/lib/audit-log/audit-log-api'
import { AdvancedDataGrid } from '@/components/data-grid/AdvancedDataGrid'
import type { ColumnDef } from '@/components/data-grid/types'
import type { AuditLogEntry, AuditAction } from '@/lib/audit-log/types'

const actionColor: Record<AuditAction, 'success' | 'info' | 'error' | 'default' | 'warning'> = {
  create: 'success',
  update: 'info',
  delete: 'error',
  login: 'default',
  permission_change: 'warning',
}

const actionOptions = [
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
  { value: 'login', label: 'Login' },
  { value: 'permission_change', label: 'Permission change' },
]

export function AuditLogPage() {
  const columns: ColumnDef<AuditLogEntry>[] = [
    { field: 'createdAt', headerName: 'When', sortable: true, renderCell: (row) => new Date(row.createdAt).toLocaleString() },
    { field: 'actorName', headerName: 'Actor', sortable: true },
    {
      field: 'action',
      headerName: 'Action',
      sortable: true,
      renderCell: (row) => <Chip size="small" label={row.action.replace('_', ' ')} color={actionColor[row.action]} />,
    },
    { field: 'module', headerName: 'Module' },
    { field: 'description', headerName: 'Description' },
  ]

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Audit Log
      </Typography>

      <AdvancedDataGrid<AuditLogEntry>
        queryKey="audit-log"
        fetchFn={auditLogApi.list}
        columns={columns}
        sorting={{ mode: 'server', defaultSort: { field: 'createdAt', direction: 'desc' } }}
        pagination={{ mode: 'server', defaultPageSize: 25, pageSizeOptions: [25, 50, 100] }}
        filters={{
          fields: [
            { name: 'actorName', label: 'Actor', type: 'text' },
            { name: 'action', label: 'Action', type: 'select', options: actionOptions },
          ],
        }}
        toolbar={{ showRefresh: true, exportFn: () => {} }}
      />
    </Box>
  )
}
