import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Box, Typography, Chip, Skeleton, Grid, IconButton, Tooltip } from '@mui/material'
import { ArrowLeft, Printer } from 'lucide-react'
import { leadsApi } from '../api/leads-api'
import { DetailWidget } from '@/components/layout/DetailWidget'
import { Timeline } from '@/components/layout/Timeline'
import { NotFoundPage } from '@/app/routes/NotFoundPage'
import { useBreadcrumbLabel } from '@/components/layout/breadcrumb-context'
import { useTrackRecentlyViewed, FavoriteToggle } from '@/components/layout/FavoriteToggle'
import { CommentThread } from '@/components/layout/CommentThread'
import type { LeadStatus } from '../types/lead'

const statusColor: Record<LeadStatus, 'default' | 'info' | 'success' | 'error'> = {
  new: 'info',
  contacted: 'default',
  qualified: 'success',
  lost: 'error',
}

// Demo-only activity fixture, scoped to this page — a real build would
// pull this from an `activity`/`audit-log` API keyed by entity id.
const demoTimeline = (leadName: string) => [
  { id: '1', label: `${leadName} was created`, actor: 'System', timestamp: new Date(Date.now() - 5 * 86_400_000).toISOString() },
  { id: '2', label: 'Status changed to Contacted', actor: 'Amina Haddad', timestamp: new Date(Date.now() - 3 * 86_400_000).toISOString() },
  { id: '3', label: 'Follow-up email sent', actor: 'Omar Siddiqui', timestamp: new Date(Date.now() - 1 * 86_400_000).toISOString() },
]

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: lead, isLoading, isError } = useQuery({
    queryKey: ['leads', id],
    queryFn: () => leadsApi.getById(id!),
    enabled: !!id,
    retry: false,
  })

  useBreadcrumbLabel(lead?.name)

  const activityRecord = useMemo(
    () => (lead ? { module: 'leads', id: lead.id, label: lead.name, path: `/leads/${lead.id}` } : null),
    [lead],
  )
  useTrackRecentlyViewed(activityRecord)

  if (isError) {
    return <NotFoundPage message="We couldn't find this lead." />
  }

  return (
    <Box className="print-page">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton size="small" onClick={() => navigate('/leads')} className="no-print" aria-label="Back to leads">
          <ArrowLeft size={18} />
        </IconButton>
        {isLoading ? (
          <Skeleton variant="text" width={220} height={36} />
        ) : (
          <Typography variant="h5" sx={{ fontWeight: 700, flexGrow: 1 }}>
            {lead?.name}
          </Typography>
        )}
        {activityRecord && <FavoriteToggle record={activityRecord} />}
        <Tooltip title="Print">
          <IconButton size="small" onClick={() => window.print()} className="no-print" aria-label="Print">
            <Printer size={18} />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <DetailWidget title="Overview">
            {isLoading ? (
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Row label="Company" value={lead?.company} />
                <Row label="Email" value={lead?.email} />
                <Row
                  label="Status"
                  value={lead && <Chip size="small" label={lead.status} color={statusColor[lead.status]} />}
                />
                <Row label="Created" value={lead && new Date(lead.createdAt).toLocaleDateString()} />
              </Box>
            )}
          </DetailWidget>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <DetailWidget title="Activity">
            {isLoading ? (
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
            ) : (
              <Timeline entries={demoTimeline(lead?.name ?? 'This lead')} />
            )}
          </DetailWidget>
        </Grid>

        <Grid size={12}>
          <DetailWidget title="Notes">
            {isLoading || !lead ? (
              <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
            ) : (
              <CommentThread module="leads" entityId={lead.id} />
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
