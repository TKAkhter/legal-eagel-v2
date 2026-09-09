import { Box, Typography, Chip } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { auditLogApi } from '@/lib/audit-log/audit-log-api'
import { AdvancedDataGrid } from '@/components/data-grid/AdvancedDataGrid'
import type { ColumnDef } from '@/components/data-grid/types'
import type { AuditLogEntry, AuditAction } from '@/lib/audit-log/types'
import { useLocaleDate } from '@/lib/i18n/use-locale-date'

const actionColor: Record<AuditAction, 'success' | 'info' | 'error' | 'default' | 'warning'> = {
  create: 'success',
  update: 'info',
  delete: 'error',
  login: 'default',
  permission_change: 'warning',
}

export function AuditLogPage() {
  const { t } = useTranslation()
  const { formatDateTime } = useLocaleDate()

  const actionOptions = [
    { value: 'create', label: t('auditLogPage.actions.create') },
    { value: 'update', label: t('auditLogPage.actions.update') },
    { value: 'delete', label: t('auditLogPage.actions.delete') },
    { value: 'login', label: t('auditLogPage.actions.login') },
    { value: 'permission_change', label: t('auditLogPage.actions.permissionChange') },
  ]

  const columns: ColumnDef<AuditLogEntry>[] = [
    {
      field: 'createdAt',
      headerName: t('auditLogPage.columns.when'),
      sortable: true,
      renderCell: (row) => formatDateTime(row.createdAt),
    },
    { field: 'actorName', headerName: t('auditLogPage.columns.actor'), sortable: true },
    {
      field: 'action',
      headerName: t('auditLogPage.columns.action'),
      sortable: true,
      renderCell: (row) => <Chip size="small" label={row.action.replace('_', ' ')} color={actionColor[row.action]} />,
    },
    { field: 'module', headerName: t('auditLogPage.columns.module') },
    { field: 'description', headerName: t('auditLogPage.columns.description') },
  ]

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        {t('auditLogPage.title')}
      </Typography>

      <AdvancedDataGrid<AuditLogEntry>
        queryKey="audit-log"
        fetchFn={auditLogApi.list}
        columns={columns}
        sorting={{ mode: 'server', defaultSort: { field: 'createdAt', direction: 'desc' } }}
        pagination={{ mode: 'server', defaultPageSize: 25, pageSizeOptions: [25, 50, 100] }}
        filters={{
          fields: [
            { name: 'actorName', label: t('auditLogPage.columns.actor'), type: 'text' },
            { name: 'action', label: t('auditLogPage.columns.action'), type: 'select', options: actionOptions },
          ],
        }}
        toolbar={{ showRefresh: true, exportFn: () => {} }}
      />
    </Box>
  )
}
