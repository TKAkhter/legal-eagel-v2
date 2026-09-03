import { Paper, Typography, useTheme } from '@mui/material'
import Chart from 'react-apexcharts'

interface DonutChartCardProps {
  title: string
  labels: string[]
  series: number[]
  colors?: string[]
}

export function DonutChartCard({ title, labels, series, colors }: DonutChartCardProps) {
  const theme = useTheme()

  const defaultColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
  ]

  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
        {title}
      </Typography>
      <Chart
        type="donut"
        height={260}
        series={series}
        options={{
          labels,
          colors: colors ?? defaultColors,
          chart: { fontFamily: theme.typography.fontFamily },
          legend: { position: 'bottom', labels: { colors: theme.palette.text.secondary } },
          dataLabels: { enabled: false },
          stroke: { colors: [theme.palette.background.paper] },
          theme: { mode: theme.palette.mode },
        }}
      />
    </Paper>
  )
}
