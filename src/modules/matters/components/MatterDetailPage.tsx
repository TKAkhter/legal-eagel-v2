import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Box, Typography, Chip, Skeleton, Grid, IconButton, Tooltip } from '@mui/material'
import { ArrowLeft, Printer } from 'lucide-react'
import { mattersApi } from '../api/matters-api'
import { useBreadcrumbLabel } from '@/components/layout/breadcrumb-context'
import { DetailWidget } from '@/components/layout/DetailWidget'
import { Timeline } from '@/components/layout/Timeline'
import { NotFoundPage } from '@/app/routes/NotFoundPage'
import { useTrackRecentlyViewed, FavoriteToggle } from '@/components/layout/FavoriteToggle'
import { CommentThread } from '@/components/layout/CommentThread'
import type { MatterStatus } from '../types/matter'
import { useLocaleDate } from '@/lib/i18n/use-locale-date'

const statusColor: Record<MatterStatus, 'default' | 'info' | 'warning' | 'success'> = {
  open: 'info',
  in_progress: 'warning',
  on_hold: 'default',
  closed: 'success',
}

const demoTimeline = (title: string) => [
  { id: '1', label: `${title} was opened`, actor: 'System', timestamp: new Date(Date.now() - 15 * 86_400_000).toISOString() },
  { id: '2', label: 'Assigned to team member', actor: 'Amina Haddad', timestamp: new Date(Date.now() - 10 * 86_400_000).toISOString() },
  { id: '3', label: 'Status updated', actor: 'Omar Siddiqui', timestamp: new Date(Date.now() - 2 * 86_400_000).toISOString() },
]

export function MatterDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { formatDate } = useLocaleDate()
  const navigate = useNavigate()

  const { data: matter, isLoading, isError } = useQuery({
    queryKey: ['matters', id],
    queryFn: () => mattersApi.getById(id!),
    enabled: !!id,
    retry: false,
  })

  useBreadcrumbLabel(matter?.title)

  const activityRecord = useMemo(
    () => (matter ? { module: 'matters', id: matter.id, label: matter.title, path: `/matters/${matter.id}` } : null),
    [matter],
  )
  useTrackRecentlyViewed(activityRecord)

  if (isError) {
    return <NotFoundPage message="We couldn't find this matter." />
  }

  return (
    <Box className="print-page">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton size="small" onClick={() => navigate('/matters')} className="no-print" aria-label="Back to matters">
          <ArrowLeft size={18} />
        </IconButton>
        {isLoading ? (
          <Skeleton variant="text" width={220} height={36} />
        ) : (
          <Typography variant="h5" sx={{ fontWeight: 700, flexGrow: 1 }}>
            {matter?.title}
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
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Row label="Client" value={matter?.clientName} />
                <Row label="Assigned to" value={matter?.assignedTo} />
                <Row
                  label="Status"
                  value={matter && <Chip size="small" label={matter.status.replace('_', ' ')} color={statusColor[matter.status]} />}
                />
                <Row label="Opened" value={matter && formatDate(matter.openedAt)} />
              </Box>
            )}
          </DetailWidget>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <DetailWidget title="Activity">
            {isLoading ? (
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            ) : (
              <Timeline entries={demoTimeline(matter?.title ?? 'This matter')} />
            )}
          </DetailWidget>
        </Grid>

        <Grid size={12}>
          <DetailWidget title="Notes">
            {isLoading || !matter ? (
              <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
            ) : (
              <CommentThread module="matters" entityId={matter.id} />
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
