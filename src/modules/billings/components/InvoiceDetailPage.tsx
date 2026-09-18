import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Box, Typography, Chip, Skeleton, Grid, IconButton, Tooltip,
  Table, TableHead, TableRow, TableCell, TableBody,
} from '@mui/material'
import { ArrowLeft, Printer, FileDown } from 'lucide-react'
import { invoicesApi } from '../api/invoices-api'
import { useBreadcrumbLabel } from '@/components/layout/breadcrumb-context'
import { DetailWidget } from '@/components/layout/DetailWidget'
import { NotFoundPage } from '@/app/routes/NotFoundPage'
import { useTrackRecentlyViewed, FavoriteToggle } from '@/components/layout/FavoriteToggle'
import { CommentThread } from '@/components/layout/CommentThread'
import type { InvoiceStatus } from '../types/invoice'
import { useLocaleDate } from '@/lib/i18n/use-locale-date'

const statusColor: Record<InvoiceStatus, 'default' | 'info' | 'success' | 'error'> = {
  draft: 'default',
  sent: 'info',
  paid: 'success',
  overdue: 'error',
}

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

// Demo-only line items — a real build would come from the invoice API itself.
const demoLineItems = [
  { description: 'Legal consultation — 3 hrs', amount: 450 },
  { description: 'Document review', amount: 220 },
  { description: 'Filing fees', amount: 90 },
]

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { formatDate } = useLocaleDate()
  const navigate = useNavigate()

  const { data: invoice, isLoading, isError } = useQuery({
    queryKey: ['billings', id],
    queryFn: () => invoicesApi.getById(id!),
    enabled: !!id,
    retry: false,
  })

  useBreadcrumbLabel(invoice?.invoiceNumber)

  const activityRecord = useMemo(
    () => (invoice ? { module: 'billings', id: invoice.id, label: invoice.invoiceNumber, path: `/billings/${invoice.id}` } : null),
    [invoice],
  )
  useTrackRecentlyViewed(activityRecord)

  if (isError) {
    return <NotFoundPage message="We couldn't find this invoice." />
  }

  const handleDownloadPdf = async () => {
    if (!invoice) return
    const { exportToPdf } = await import('@/lib/export/pdf-export')
    exportToPdf({
      title: invoice.invoiceNumber,
      details: [
        { label: 'Client', value: invoice.clientName },
        { label: 'Amount', value: currencyFormatter.format(invoice.amount) },
        { label: 'Status', value: invoice.status },
        { label: 'Due date', value: formatDate(invoice.dueDate) },
      ],
      lineItems: {
        columns: [{ header: 'Description' }, { header: 'Amount', align: 'right' }],
        rows: demoLineItems.map((item) => [item.description, currencyFormatter.format(item.amount)]),
      },
      filename: invoice.invoiceNumber,
    })
  }

  return (
    <Box className="print-page">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton size="small" onClick={() => navigate('/billings')} className="no-print" aria-label="Back to billings">
          <ArrowLeft size={18} />
        </IconButton>
        {isLoading ? (
          <Skeleton variant="text" width={220} height={36} />
        ) : (
          <Typography variant="h5" sx={{ fontWeight: 700, flexGrow: 1 }}>
            {invoice?.invoiceNumber}
          </Typography>
        )}
        {activityRecord && <FavoriteToggle record={activityRecord} />}
        <Tooltip title="Download PDF">
          <IconButton size="small" onClick={handleDownloadPdf} className="no-print" aria-label="Download PDF" disabled={!invoice}>
            <FileDown size={18} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Print">
          <IconButton size="small" onClick={() => window.print()} className="no-print" aria-label="Print">
            <Printer size={18} />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 5 }}>
          <DetailWidget title="Overview">
            {isLoading ? (
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Row label="Client" value={invoice?.clientName} />
                <Row label="Amount" value={invoice && currencyFormatter.format(invoice.amount)} />
                <Row
                  label="Status"
                  value={invoice && <Chip size="small" label={invoice.status} color={statusColor[invoice.status]} />}
                />
                <Row label="Due date" value={invoice && formatDate(invoice.dueDate)} />
              </Box>
            )}
          </DetailWidget>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <DetailWidget title="Line items">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {demoLineItems.map((item) => (
                  <TableRow key={item.description}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell align="right">{currencyFormatter.format(item.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DetailWidget>
        </Grid>

        <Grid size={12}>
          <DetailWidget title="Notes">
            {isLoading || !invoice ? (
              <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
            ) : (
              <CommentThread module="billings" entityId={invoice.id} />
            )}
          </DetailWidget>
        </Grid>
      </Grid>
    </Box>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2">{value ?? '—'}</Typography>
    </Box>
  )
}
