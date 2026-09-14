import { Box, Typography, Chip, Button } from '@mui/material'
import { Eye, Trash2, Upload, Copy, Tag } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { AdvancedDataGrid } from '@/components/data-grid/AdvancedDataGrid'
import { CsvImportWizard, type CsvImportField } from '@/components/forms/CsvImportWizard'
import { BulkStatusUpdateDialog } from '@/components/data-grid/BulkStatusUpdateDialog'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useToast } from '@/components/feedback/ToastProvider'
import { useUndoableDelete } from '@/lib/undo/use-undoable-delete'
import { useOptimisticUpdate } from '@/lib/optimistic/use-optimistic-update'
import { leadsApi } from '../api/leads-api'
import type { Lead, LeadStatus } from '../types/lead'
import type { ColumnDef, RowMenuItem } from '@/components/data-grid/types'

const statusColor: Record<LeadStatus, 'default' | 'info' | 'success' | 'error'> = {
  new: 'info',
  contacted: 'default',
  qualified: 'success',
  lost: 'error',
}

const statusOptions = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'lost', label: 'Lost' },
]

const csvFields: CsvImportField[] = [
  { key: 'name', label: 'Name', required: true },
  { key: 'company', label: 'Company' },
  { key: 'email', label: 'Email', required: true },
]

export function LeadsListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const [importOpen, setImportOpen] = useState(false)
  const [bulkStatusRows, setBulkStatusRows] = useState<Lead[] | null>(null)
  const { deleteWithUndo, deleteManyWithUndo } = useUndoableDelete<Lead>({
    queryKeyPrefix: 'leads',
    removeFn: leadsApi.remove,
    getLabel: (lead) => lead.name,
  })
  const { updateManyOptimistic } = useOptimisticUpdate<Lead>({
    queryKeyPrefix: 'leads',
    updateFn: leadsApi.update,
  })

  const columns: ColumnDef<Lead>[] = [
    { field: 'name', headerName: 'Name', sortable: true },
    { field: 'company', headerName: 'Company', sortable: true },
    { field: 'email', headerName: 'Email' },
    {
      field: 'status',
      headerName: 'Status',
      sortable: true,
      renderCell: (row) => <Chip size="small" label={row.status} color={statusColor[row.status]} />,
    },
  ]

  const rowMenuItems: RowMenuItem<Lead>[] = [
    { label: t('common.viewDetails'), icon: <Eye size={16} />, onClick: (row) => navigate(`/leads/${row.id}`) },
    {
      label: t('common.duplicate'),
      icon: <Copy size={16} />,
      permission: 'leads:edit',
      onClick: async (row) => {
        await leadsApi.create({ name: `${row.name} (copy)`, company: row.company, email: row.email, status: 'new' })
        queryClient.invalidateQueries({ queryKey: ['leads'] })
        showToast('Lead duplicated', 'success')
      },
    },
    {
      label: 'Delete',
      icon: <Trash2 size={16} />,
      destructive: true,
      permission: 'leads:edit',
      onClick: (row) => deleteWithUndo(row),
    },
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {t('nav.leads')}
        </Typography>
        <RequirePermission permission="leads:edit">
          <Button size="small" variant="outlined" startIcon={<Upload size={16} />} onClick={() => setImportOpen(true)}>
            Import CSV
          </Button>
        </RequirePermission>
      </Box>

      <AdvancedDataGrid<Lead>
        queryKey="leads"
        fetchFn={leadsApi.list}
        columns={columns}
        sorting={{ mode: 'server' }}
        pagination={{ mode: 'server', defaultPageSize: 10, pageSizeOptions: [10, 25, 50] }}
        filters={{
          fields: [
            { name: 'name', label: 'Name', type: 'text' },
            { name: 'status', label: 'Status', type: 'select', options: statusOptions },
          ],
        }}
        rowActions={{ items: rowMenuItems }}
        selection={{
          enabled: true,
          bulkActions: [
            {
              label: t('common.updateStatus'),
              icon: <Tag size={16} />,
              permission: 'leads:edit',
              onClick: (rows) => setBulkStatusRows(rows),
            },
            {
              label: t('common.delete'),
              icon: <Trash2 size={16} />,
              permission: 'leads:edit',
              onClick: (rows) => deleteManyWithUndo(rows),
            },
          ],
        }}
        toolbar={{
          showRefresh: true,
          exportColumns: [
            { header: 'Name', value: (r) => r.name },
            { header: 'Company', value: (r) => r.company },
            { header: 'Email', value: (r) => r.email },
            { header: 'Status', value: (r) => r.status },
          ],
          exportFilename: 'leads',
          exportFormats: ['csv', 'xlsx'],
          sendMailFn: () => showToast('Mail composer opened (demo)', 'info'),
        }}
        onRowClick={(row) => navigate(`/leads/${row.id}`)}
      />

      <CsvImportWizard<Partial<Lead>>
        open={importOpen}
        onClose={() => setImportOpen(false)}
        fields={csvFields}
        onImport={async (rows) => {
          await Promise.all(rows.map((row) => leadsApi.create(row)))
          queryClient.invalidateQueries({ queryKey: ['leads'] })
          showToast(`${rows.length} leads imported`, 'success')
        }}
      />

      <BulkStatusUpdateDialog
        open={!!bulkStatusRows}
        onClose={() => setBulkStatusRows(null)}
        options={statusOptions}
        selectedCount={bulkStatusRows?.length ?? 0}
        onApply={(newStatus) => {
          if (!bulkStatusRows) return
          const ids = bulkStatusRows.map((row) => row.id)
          updateManyOptimistic(ids, { status: newStatus as LeadStatus })
          showToast(`${bulkStatusRows.length} leads updated`, 'success')
        }}
      />
    </Box>
  )
}
