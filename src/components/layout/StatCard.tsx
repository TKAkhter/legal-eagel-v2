import { Box, Paper, Typography } from '@mui/material'
import { ArrowUpRight, ArrowDownRight, type LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string
  icon: LucideIcon
  trend?: { value: string; direction: 'up' | 'down' }
}

export function StatCard({ label, value, icon: Icon, trend }: StatCardProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 2,
            bgcolor: 'action.hover',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={16} />
        </Box>
      </Box>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        {value}
      </Typography>
      {trend && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            mt: 0.5,
            color: trend.direction === 'up' ? 'success.main' : 'error.main',
          }}
        >
          {trend.direction === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            {trend.value}
          </Typography>
        </Box>
      )}
    </Paper>
  )
}
