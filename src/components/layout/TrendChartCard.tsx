import { Paper, Typography, useTheme } from '@mui/material'
import Chart from 'react-apexcharts'

interface TrendChartCardProps {
  title: string
  categories: string[]
  series: { name: string; data: number[] }[]
}

export function TrendChartCard({ title, categories, series }: TrendChartCardProps) {
  const theme = useTheme()

  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
        {title}
      </Typography>
      <Chart
        type="area"
        height={260}
        series={series}
        options={{
          chart: { toolbar: { show: false }, fontFamily: theme.typography.fontFamily },
          colors: [theme.palette.primary.main, theme.palette.secondary.main],
          dataLabels: { enabled: false },
          stroke: { curve: 'smooth', width: 2 },
          fill: { type: 'gradient', gradient: { opacityFrom: 0.35, opacityTo: 0 } },
          xaxis: { categories, labels: { style: { colors: theme.palette.text.secondary } } },
          yaxis: { labels: { style: { colors: theme.palette.text.secondary } } },
          grid: { borderColor: theme.palette.divider },
          legend: { labels: { colors: theme.palette.text.secondary } },
          theme: { mode: theme.palette.mode },
        }}
      />
    </Paper>
  )
}
