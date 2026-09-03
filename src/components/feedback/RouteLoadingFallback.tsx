import { Box, CircularProgress } from '@mui/material'

export function RouteLoadingFallback() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' }}>
      <CircularProgress size={28} />
    </Box>
  )
}
