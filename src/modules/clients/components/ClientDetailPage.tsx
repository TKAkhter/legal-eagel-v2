import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Box, Typography, Chip, Skeleton, Grid, IconButton, Tooltip } from '@mui/material'
import { ArrowLeft, Printer } from 'lucide-react'
import { clientsApi } from '../api/clients-api'
import { useBreadcrumbLabel } from '@/components/layout/breadcrumb-context'
import { DetailWidget } from '@/components/layout/DetailWidget'
import { Timeline } from '@/components/layout/Timeline'
import { NotFoundPage } from '@/app/routes/NotFoundPage'
import { useTrackRecentlyViewed, FavoriteToggle } from '@/components/layout/FavoriteToggle'
import { CommentThread } from '@/components/layout/CommentThread'
import type { ClientTier } from '../types/client'

const tierColor: Record<ClientTier, 'default' | 'info' | 'warning'> = {
  standard: 'default',
  priority: 'info',
  vip: 'warning',
}

const demoTimeline = (name: string) => [
  { id: '1', label: `${name} was added as a client`, actor: 'System', timestamp: new Date(Date.now() - 20 * 86_400_000).toISOString() },
  { id: '2', label: 'Onboarding call completed', actor: 'Amina Haddad', timestamp: new Date(Date.now() - 12 * 86_400_000).toISOString() },
  { id: '3', label: 'Contract signed', actor: 'Omar Siddiqui', timestamp: new Date(Date.now() - 4 * 86_400_000).toISOString() },
]

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: client, isLoading, isError } = useQuery({
    queryKey: ['clients', id],
    queryFn: () => clientsApi.getById(id!),
    enabled: !!id,
    retry: false,
  })

  useBreadcrumbLabel(client?.name)

  const activityRecord = useMemo(
    () => (client ? { module: 'clients', id: client.id, label: client.name, path: `/clients/${client.id}` } : null),
    [client],
  )
  useTrackRecentlyViewed(activityRecord)

  if (isError) {
    return <NotFoundPage message="We couldn't find this client." />
  }

  return (
    <Box className="print-page">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton size="small" onClick={() => navigate('/clients')} className="no-print" aria-label="Back to clients">
          <ArrowLeft size={18} />
        </IconButton>
        {isLoading ? (
          <Skeleton variant="text" width={220} height={36} />
        ) : (
          <Typography variant="h5" sx={{ fontWeight: 700, flexGrow: 1 }}>
            {client?.name}
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
                <Row label="Organization" value={client?.organization} />
                <Row label="Email" value={client?.email} />
                <Row label="Phone" value={client?.phone} />
                <Row
                  label="Tier"
                  value={client && <Chip size="small" label={client.tier} color={tierColor[client.tier]} />}
                />
                <Row label="Client since" value={client && new Date(client.createdAt).toLocaleDateString()} />
              </Box>
            )}
          </DetailWidget>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <DetailWidget title="Activity">
            {isLoading ? (
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            ) : (
              <Timeline entries={demoTimeline(client?.name ?? 'This client')} />
            )}
          </DetailWidget>
        </Grid>

        <Grid size={12}>
          <DetailWidget title="Notes">
            {isLoading || !client ? (
              <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
            ) : (
              <CommentThread module="clients" entityId={client.id} />
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
