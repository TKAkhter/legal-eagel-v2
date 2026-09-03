import { Box, Typography, Chip, Button } from '@mui/material'
import { Eye, Upload, Trash2, Copy } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { AdvancedDataGrid } from '@/components/data-grid/AdvancedDataGrid'
import { CsvImportWizard, type CsvImportField } from '@/components/forms/CsvImportWizard'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useToast } from '@/components/feedback/ToastProvider'
import { useUndoableDelete } from '@/lib/undo/use-undoable-delete'
import { clientsApi } from '../api/clients-api'
import type { Client, ClientTier } from '../types/client'
import type { ColumnDef, RowMenuItem } from '@/components/data-grid/types'

const tierColor: Record<ClientTier, 'default' | 'info' | 'warning'> = {
  standard: 'default',
  priority: 'info',
  vip: 'warning',
}

const tierOptions = [
  { value: 'standard', label: 'Standard' },
  { value: 'priority', label: 'Priority' },
  { value: 'vip', label: 'VIP' },
]

const csvFields: CsvImportField[] = [
  { key: 'name', label: 'Contact', required: true },
  { key: 'organization', label: 'Organization' },
  { key: 'email', label: 'Email', required: true },
  { key: 'phone', label: 'Phone' },
]

export function ClientsListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const [importOpen, setImportOpen] = useState(false)
  const { deleteWithUndo, deleteManyWithUndo } = useUndoableDelete<Client>({
    queryKeyPrefix: 'clients',
    removeFn: clientsApi.remove,
    getLabel: (client) => client.name,
  })

  const columns: ColumnDef<Client>[] = [
    { field: 'name', headerName: 'Contact', sortable: true },
    { field: 'organization', headerName: 'Organization', sortable: true },
    { field: 'email', headerName: 'Email' },
    { field: 'phone', headerName: 'Phone' },
    {
      field: 'tier',
      headerName: 'Tier',
      sortable: true,
      renderCell: (row) => <Chip size="small" label={row.tier} color={tierColor[row.tier]} />,
    },
  ]

  const rowMenuItems: RowMenuItem<Client>[] = [
    { label: t('common.viewDetails'), icon: <Eye size={16} />, onClick: (row) => navigate(`/clients/${row.id}`) },
    {
      label: t('common.duplicate'),
      icon: <Copy size={16} />,
      permission: 'clients:edit',
      onClick: async (row) => {
        await clientsApi.create({ name: `${row.name} (copy)`, organization: row.organization, email: row.email, phone: row.phone, tier: row.tier })
        queryClient.invalidateQueries({ queryKey: ['clients'] })
        showToast('Client duplicated', 'success')
      },
    },
    {
      label: 'Delete',
      icon: <Trash2 size={16} />,
      destructive: true,
      permission: 'clients:edit',
      onClick: (row) => deleteWithUndo(row),
    },
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {t('nav.clients')}
        </Typography>
        <RequirePermission permission="clients:edit">
          <Button size="small" variant="outlined" startIcon={<Upload size={16} />} onClick={() => setImportOpen(true)}>
            Import CSV
          </Button>
        </RequirePermission>
      </Box>

      <AdvancedDataGrid<Client>
        queryKey="clients"
        fetchFn={clientsApi.list}
        columns={columns}
        filters={{
          fields: [
            { name: 'name', label: 'Contact', type: 'text' },
            { name: 'tier', label: 'Tier', type: 'select', options: tierOptions },
          ],
        }}
        rowActions={{ items: rowMenuItems }}
        selection={{
          enabled: true,
          bulkActions: [
            {
              label: t('common.delete'),
              icon: <Trash2 size={16} />,
              permission: 'clients:edit',
              onClick: (rows) => deleteManyWithUndo(rows),
            },
          ],
        }}
        toolbar={{
          showRefresh: true,
          exportColumns: [
            { header: 'Contact', value: (r) => r.name },
            { header: 'Organization', value: (r) => r.organization },
            { header: 'Email', value: (r) => r.email },
            { header: 'Phone', value: (r) => r.phone },
            { header: 'Tier', value: (r) => r.tier },
          ],
          exportFilename: 'clients',
          exportFormats: ['csv', 'xlsx'],
        }}
        onRowClick={(row) => navigate(`/clients/${row.id}`)}
      />

      <CsvImportWizard<Partial<Client>>
        open={importOpen}
        onClose={() => setImportOpen(false)}
        fields={csvFields}
        onImport={async (rows) => {
          await Promise.all(rows.map((row) => clientsApi.create(row)))
          queryClient.invalidateQueries({ queryKey: ['clients'] })
          showToast(`${rows.length} clients imported`, 'success')
        }}
      />
    </Box>
  )
}
