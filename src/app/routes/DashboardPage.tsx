import { Box, Typography, Paper, Grid } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Users, Briefcase, Receipt, Target } from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth-store'
import { Calendar } from '@/components/calendar/Calendar'
import { StatCard } from '@/components/layout/StatCard'
import { TrendChartCard } from '@/components/layout/TrendChartCard'
import { DonutChartCard } from '@/components/layout/DonutChartCard'
import { FavoritesWidget } from '@/components/layout/FavoritesWidget'
import { mattersMockData } from '@/modules/matters/mock/matters.mock'
import { leadsMockData } from '@/modules/leads/mock/leads.mock'
import type { CalendarEntry } from '@/components/calendar/types'

// Demo mapping — a real dashboard would pull deadlines/KPIs from
// whichever modules expose that data via their own APIs rather than
// importing mock fixtures directly like this.
const deadlineEntries: CalendarEntry[] = mattersMockData.slice(0, 10).map((m) => ({
  id: m.id,
  title: m.matter_title,
  date: m.opened_on,
  meta: { Client: m.client_name, Status: m.status },
}))

const revenueMonths = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
const revenueSeries = [
  { name: 'Billed', data: [42000, 38000, 51000, 47000, 55000, 61000] },
  { name: 'Collected', data: [36000, 35000, 44000, 43000, 49000, 52000] },
]

const leadStatusLabels = ['New', 'Contacted', 'Qualified', 'Lost']
const leadStatusCounts = leadStatusLabels.map(
  (label) => leadsMockData.filter((l) => l.status === label.toLowerCase()).length,
)

export function DashboardPage() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        {t('nav.dashboard')}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Welcome back{user?.name ? `, ${user.name}` : ''}.
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Active leads" value="47" icon={Target} trend={{ value: '+12% this month', direction: 'up' }} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Clients" value="38" icon={Users} trend={{ value: '+3 this month', direction: 'up' }} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Open matters" value="19" icon={Briefcase} trend={{ value: '-2 this month', direction: 'down' }} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Overdue invoices" value="6" icon={Receipt} trend={{ value: '+1 this month', direction: 'down' }} />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <TrendChartCard title="Revenue — last 6 months" categories={revenueMonths} series={revenueSeries} />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Upcoming deadlines
            </Typography>
            <Calendar entries={deadlineEntries} />
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 5 }}>
          <DonutChartCard title="Leads by status" labels={leadStatusLabels} series={leadStatusCounts} />
        </Grid>
        <Grid size={{ xs: 12, lg: 7 }}>
          <FavoritesWidget />
        </Grid>
      </Grid>
    </Box>
  )
}
