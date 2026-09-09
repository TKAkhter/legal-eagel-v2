import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Box, Typography, Chip, Skeleton, Grid, IconButton, Avatar } from '@mui/material'
import { ArrowLeft } from 'lucide-react'
import { usersApi } from '../api/users-api'
import { useBreadcrumbLabel } from '@/components/layout/breadcrumb-context'
import { DetailWidget } from '@/components/layout/DetailWidget'
import { Timeline } from '@/components/layout/Timeline'
import { NotFoundPage } from '@/app/routes/NotFoundPage'
import { useTrackRecentlyViewed, FavoriteToggle } from '@/components/layout/FavoriteToggle'
import { CommentThread } from '@/components/layout/CommentThread'
import { useLocaleDate } from '@/lib/i18n/use-locale-date'
import type { UserStatus } from '../types/app-user'

const statusColor: Record<UserStatus, 'success' | 'info' | 'error'> = {
  active: 'success',
  invited: 'info',
  suspended: 'error',
}

const demoTimeline = (name: string) => [
  { id: '1', label: `${name} accepted their invite`, actor: 'System', timestamp: new Date(Date.now() - 30 * 86_400_000).toISOString() },
  { id: '2', label: 'Role changed', actor: 'Amina Haddad', timestamp: new Date(Date.now() - 8 * 86_400_000).toISOString() },
]

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { formatDateTime } = useLocaleDate()

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['users', id],
    queryFn: () => usersApi.getById(id!),
    enabled: !!id,
    retry: false,
  })

  useBreadcrumbLabel(user?.name)

  const activityRecord = useMemo(
    () => (user ? { module: 'users', id: user.id, label: user.name, path: `/users/${user.id}` } : null),
    [user],
  )
  useTrackRecentlyViewed(activityRecord)

  if (isError) {
    return <NotFoundPage message="We couldn't find this user." />
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton size="small" onClick={() => navigate('/users')} aria-label="Back to users">
          <ArrowLeft size={18} />
        </IconButton>
        {isLoading ? (
          <Skeleton variant="text" width={220} height={36} />
        ) : (
          <>
            <Avatar sx={{ width: 32, height: 32 }}>{user?.name?.[0]}</Avatar>
            <Typography variant="h5" sx={{ fontWeight: 700, flexGrow: 1 }}>
              {user?.name}
            </Typography>
          </>
        )}
        {activityRecord && <FavoriteToggle record={activityRecord} />}
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <DetailWidget title="Overview">
            {isLoading ? (
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Row label="Email" value={user?.email} />
                <Row label="Role" value={user?.roleName} />
                <Row
                  label="Status"
                  value={user && <Chip size="small" label={user.status} color={statusColor[user.status]} />}
                />
                <Row label="Last active" value={user && formatDateTime(user.lastActiveAt)} />
              </Box>
            )}
          </DetailWidget>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <DetailWidget title="Activity">
            {isLoading ? (
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            ) : (
              <Timeline entries={demoTimeline(user?.name ?? 'This user')} />
            )}
          </DetailWidget>
        </Grid>

        <Grid size={12}>
          <DetailWidget title="Notes">
            {isLoading || !user ? (
              <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
            ) : (
              <CommentThread module="users" entityId={user.id} />
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
