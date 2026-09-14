import { Box, Typography, Chip, Button } from '@mui/material'
import { Eye, Upload, Trash2, Copy, Tag } from 'lucide-react'
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
import { mattersApi } from '../api/matters-api'
import type { Matter, MatterStatus } from '../types/matter'
import type { ColumnDef, RowMenuItem } from '@/components/data-grid/types'

const statusColor: Record<MatterStatus, 'default' | 'info' | 'warning' | 'success'> = {
  open: 'info',
  in_progress: 'warning',
  on_hold: 'default',
  closed: 'success',
}

const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'on_hold', label: 'On hold' },
  { value: 'closed', label: 'Closed' },
]

const csvFields: CsvImportField[] = [
  { key: 'title', label: 'Matter', required: true },
  { key: 'clientName', label: 'Client', required: true },
  { key: 'assignedTo', label: 'Assigned to' },
]

export function MattersListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const [importOpen, setImportOpen] = useState(false)
  const [bulkStatusRows, setBulkStatusRows] = useState<Matter[] | null>(null)
  const { deleteWithUndo, deleteManyWithUndo } = useUndoableDelete<Matter>({
    queryKeyPrefix: 'matters',
    removeFn: mattersApi.remove,
    getLabel: (matter) => matter.title,
  })
  const { updateManyOptimistic } = useOptimisticUpdate<Matter>({
    queryKeyPrefix: 'matters',
    updateFn: mattersApi.update,
  })

  const columns: ColumnDef<Matter>[] = [
    { field: 'title', headerName: 'Matter', sortable: true },
    { field: 'clientName', headerName: 'Client', sortable: true },
    { field: 'assignedTo', headerName: 'Assigned to' },
    {
      field: 'status',
      headerName: 'Status',
      sortable: true,
      renderCell: (row) => <Chip size="small" label={row.status.replace('_', ' ')} color={statusColor[row.status]} />,
    },
  ]

  const rowMenuItems: RowMenuItem<Matter>[] = [
    { label: t('common.viewDetails'), icon: <Eye size={16} />, onClick: (row) => navigate(`/matters/${row.id}`) },
    {
      label: t('common.duplicate'),
      icon: <Copy size={16} />,
      permission: 'matters:edit',
      onClick: async (row) => {
        await mattersApi.create({ title: `${row.title} (copy)`, clientName: row.clientName, assignedTo: row.assignedTo, status: 'open' })
        queryClient.invalidateQueries({ queryKey: ['matters'] })
        showToast('Matter duplicated', 'success')
      },
    },
    {
      label: 'Delete',
      icon: <Trash2 size={16} />,
      destructive: true,
      permission: 'matters:edit',
      onClick: (row) => deleteWithUndo(row),
    },
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {t('nav.matters')}
        </Typography>
        <RequirePermission permission="matters:edit">
          <Button size="small" variant="outlined" startIcon={<Upload size={16} />} onClick={() => setImportOpen(true)}>
            Import CSV
          </Button>
        </RequirePermission>
      </Box>

      <AdvancedDataGrid<Matter>
        queryKey="matters"
        fetchFn={mattersApi.list}
        columns={columns}
        filters={{
          fields: [
            { name: 'title', label: 'Matter', type: 'text' },
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
              permission: 'matters:edit',
              onClick: (rows) => setBulkStatusRows(rows),
            },
            {
              label: t('common.delete'),
              icon: <Trash2 size={16} />,
              permission: 'matters:edit',
              onClick: (rows) => deleteManyWithUndo(rows),
            },
          ],
        }}
        toolbar={{
          showRefresh: true,
          exportColumns: [
            { header: 'Matter', value: (r) => r.title },
            { header: 'Client', value: (r) => r.clientName },
            { header: 'Assigned to', value: (r) => r.assignedTo },
            { header: 'Status', value: (r) => r.status },
          ],
          exportFilename: 'matters',
          exportFormats: ['csv', 'xlsx'],
        }}
        onRowClick={(row) => navigate(`/matters/${row.id}`)}
      />

      <CsvImportWizard<Partial<Matter>>
        open={importOpen}
        onClose={() => setImportOpen(false)}
        fields={csvFields}
        onImport={async (rows) => {
          await Promise.all(rows.map((row) => mattersApi.create(row)))
          queryClient.invalidateQueries({ queryKey: ['matters'] })
          showToast(`${rows.length} matters imported`, 'success')
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
          updateManyOptimistic(ids, { status: newStatus as MatterStatus })
          showToast(`${bulkStatusRows.length} matters updated`, 'success')
        }}
      />
    </Box>
  )
}
