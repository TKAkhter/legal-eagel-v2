import { Box, Typography, Chip } from '@mui/material'
import { Eye, Printer, Trash2, Copy, Tag } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { AdvancedDataGrid } from '@/components/data-grid/AdvancedDataGrid'
import { BulkStatusUpdateDialog } from '@/components/data-grid/BulkStatusUpdateDialog'
import { useToast } from '@/components/feedback/ToastProvider'
import { useUndoableDelete } from '@/lib/undo/use-undoable-delete'
import { invoicesApi } from '../api/invoices-api'
import type { Invoice, InvoiceStatus } from '../types/invoice'
import type { ColumnDef, RowMenuItem } from '@/components/data-grid/types'

const statusColor: Record<InvoiceStatus, 'default' | 'info' | 'success' | 'error'> = {
  draft: 'default',
  sent: 'info',
  paid: 'success',
  overdue: 'error',
}

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
]

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export function BillingsListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const [bulkStatusRows, setBulkStatusRows] = useState<Invoice[] | null>(null)
  const { deleteWithUndo, deleteManyWithUndo } = useUndoableDelete<Invoice>({
    queryKeyPrefix: 'billings',
    removeFn: invoicesApi.remove,
    getLabel: (invoice) => invoice.invoiceNumber,
  })

  const columns: ColumnDef<Invoice>[] = [
    { field: 'invoiceNumber', headerName: 'Invoice #', sortable: true },
    { field: 'clientName', headerName: 'Client', sortable: true },
    {
      field: 'amount',
      headerName: 'Amount',
      sortable: true,
      renderCell: (row) => currencyFormatter.format(row.amount),
    },
    {
      field: 'status',
      headerName: 'Status',
      sortable: true,
      renderCell: (row) => <Chip size="small" label={row.status} color={statusColor[row.status]} />,
      permission: 'billings:view',
    },
  ]

  const rowMenuItems: RowMenuItem<Invoice>[] = [
    { label: t('common.viewDetails'), icon: <Eye size={16} />, onClick: (row) => navigate(`/billings/${row.id}`) },
    { label: 'Print', icon: <Printer size={16} />, onClick: () => window.print() },
    {
      label: t('common.duplicate'),
      icon: <Copy size={16} />,
      permission: 'billings:edit',
      onClick: async (row) => {
        await invoicesApi.create({
          invoiceNumber: `${row.invoiceNumber}-copy-${Date.now().toString().slice(-4)}`,
          clientName: row.clientName,
          amount: row.amount,
          status: 'draft',
          dueDate: row.dueDate,
        })
        queryClient.invalidateQueries({ queryKey: ['billings'] })
        showToast('Invoice duplicated', 'success')
      },
    },
    {
      label: 'Delete',
      icon: <Trash2 size={16} />,
      destructive: true,
      permission: 'billings:edit',
      onClick: (row) => deleteWithUndo(row),
    },
  ]

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        {t('nav.billings')}
      </Typography>

      <AdvancedDataGrid<Invoice>
        queryKey="billings"
        fetchFn={invoicesApi.list}
        columns={columns}
        filters={{
          fields: [
            { name: 'invoiceNumber', label: 'Invoice #', type: 'text' },
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
              permission: 'billings:edit',
              onClick: (rows) => setBulkStatusRows(rows),
            },
            {
              label: t('common.delete'),
              icon: <Trash2 size={16} />,
              permission: 'billings:edit',
              onClick: (rows) => deleteManyWithUndo(rows),
            },
          ],
        }}
        toolbar={{
          showRefresh: true,
          exportColumns: [
            { header: 'Invoice #', value: (r) => r.invoiceNumber },
            { header: 'Client', value: (r) => r.clientName },
            { header: 'Amount', value: (r) => r.amount },
            { header: 'Status', value: (r) => r.status },
            { header: 'Due date', value: (r) => r.dueDate },
          ],
          exportFilename: 'invoices',
          exportFormats: ['csv', 'xlsx'],
          sendMailFn: () => {},
        }}
        onRowClick={(row) => navigate(`/billings/${row.id}`)}
      />

      <BulkStatusUpdateDialog
        open={!!bulkStatusRows}
        onClose={() => setBulkStatusRows(null)}
        options={statusOptions}
        selectedCount={bulkStatusRows?.length ?? 0}
        onApply={async (newStatus) => {
          if (!bulkStatusRows) return
          await Promise.all(bulkStatusRows.map((row) => invoicesApi.update(row.id, { status: newStatus as InvoiceStatus })))
          queryClient.invalidateQueries({ queryKey: ['billings'] })
          showToast(`${bulkStatusRows.length} invoices updated`, 'success')
        }}
      />
    </Box>
  )
}
