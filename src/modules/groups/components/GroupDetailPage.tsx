import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Box, Typography, Skeleton, Grid, IconButton, Avatar, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material'
import { ArrowLeft } from 'lucide-react'
import { groupsApi } from '../api/groups-api'
import { useBreadcrumbLabel } from '@/components/layout/breadcrumb-context'
import { DetailWidget } from '@/components/layout/DetailWidget'
import { NotFoundPage } from '@/app/routes/NotFoundPage'
import { useTrackRecentlyViewed, FavoriteToggle } from '@/components/layout/FavoriteToggle'
import { CommentThread } from '@/components/layout/CommentThread'
import { mockUsers } from '@/lib/auth/mock-users'

export function GroupDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: group, isLoading, isError } = useQuery({
    queryKey: ['groups', id],
    queryFn: () => groupsApi.getById(id!),
    enabled: !!id,
    retry: false,
  })

  useBreadcrumbLabel(group?.name)

  const activityRecord = useMemo(
    () => (group ? { module: 'groups', id: group.id, label: group.name, path: `/groups/${group.id}` } : null),
    [group],
  )
  useTrackRecentlyViewed(activityRecord)

  if (isError) {
    return <NotFoundPage message="We couldn't find this group." />
  }

  // Demo membership — a real build would fetch members scoped to this group id.
  const demoMembers = mockUsers.slice(0, Math.min(mockUsers.length, group?.memberCount ?? 0))

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton size="small" onClick={() => navigate('/groups')} aria-label="Back to groups">
          <ArrowLeft size={18} />
        </IconButton>
        {isLoading ? (
          <Skeleton variant="text" width={220} height={36} />
        ) : (
          <Typography variant="h5" sx={{ fontWeight: 700, flexGrow: 1 }}>
            {group?.name}
          </Typography>
        )}
        {activityRecord && <FavoriteToggle record={activityRecord} />}
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <DetailWidget title="Overview">
            {isLoading ? (
              <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Row label="Members" value={group?.memberCount} />
                <Row label="Created" value={group && new Date(group.createdAt).toLocaleDateString()} />
              </Box>
            )}
          </DetailWidget>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <DetailWidget title="Members">
            <List dense disablePadding>
              {demoMembers.map((m) => (
                <ListItem key={m.id} disableGutters>
                  <ListItemAvatar>
                    <Avatar sx={{ width: 28, height: 28, fontSize: 13 }}>{m.name[0]}</Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={m.name} secondary={m.email} />
                </ListItem>
              ))}
            </List>
          </DetailWidget>
        </Grid>

        <Grid size={12}>
          <DetailWidget title="Notes">
            {isLoading || !group ? (
              <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
            ) : (
              <CommentThread module="groups" entityId={group.id} />
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
