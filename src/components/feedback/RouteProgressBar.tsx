import { useIsFetching, useIsMutating } from '@tanstack/react-query'
import { LinearProgress, Box } from '@mui/material'

/**
 * Rather than wiring progress manually per-route, this reads TanStack
 * Query's global fetching/mutating counters — any query or mutation
 * anywhere in the app lights this up automatically.
 */
export function RouteProgressBar() {
  const isFetching = useIsFetching()
  const isMutating = useIsMutating()
  const active = isFetching + isMutating > 0

  if (!active) return null

  return (
    <Box sx={{ position: 'fixed', top: 0, insetInline: 0, zIndex: (t) => t.zIndex.tooltip + 1 }}>
      <LinearProgress />
    </Box>
  )
}
