import type { ReactNode } from 'react'
import { Paper, Box, Typography } from '@mui/material'

interface DetailWidgetProps {
  title: string
  action?: ReactNode
  children: ReactNode
}

/**
 * One card on a detail page (e.g. "Contact Info", "Recent Activity",
 * "Related Matters"). Detail pages are composed as a grid of these
 * rather than one monolithic form — makes each section independently
 * skeleton-loadable and easy for a junior dev to add a new section to
 * without touching the rest of the page.
 */
export function DetailWidget({ title, action, children }: DetailWidgetProps) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: 2.5, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {action}
      </Box>
      {children}
    </Paper>
  )
}
