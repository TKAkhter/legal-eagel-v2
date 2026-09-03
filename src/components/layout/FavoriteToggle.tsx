import { useEffect } from 'react'
import { IconButton, Tooltip } from '@mui/material'
import { Star } from 'lucide-react'
import { useActivityStore, type ActivityRecord } from '@/lib/store/activity-store'

/**
 * Call once from a detail page once its data has loaded — e.g.
 * `useTrackRecentlyViewed(lead && { module: 'leads', id: lead.id, label: lead.name, path: \`/leads/${lead.id}\` })`.
 * Pass `null`/`undefined` while loading; the effect only fires once a
 * real record is available.
 */
export function useTrackRecentlyViewed(record: ActivityRecord | null | undefined) {
  const trackViewed = useActivityStore((s) => s.trackViewed)

  useEffect(() => {
    if (record) trackViewed(record)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record?.module, record?.id])
}

/** Star icon button — toggles the record in/out of Favorites. Drop into a detail page header. */
export function FavoriteToggle({ record }: { record: ActivityRecord }) {
  const isFavorite = useActivityStore((s) => s.isFavorite(record.module, record.id))
  const toggleFavorite = useActivityStore((s) => s.toggleFavorite)

  return (
    <Tooltip title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
      <IconButton
        size="small"
        onClick={() => toggleFavorite(record)}
        className="no-print"
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Star size={18} fill={isFavorite ? 'currentColor' : 'none'} color={isFavorite ? '#E0A83B' : undefined} />
      </IconButton>
    </Tooltip>
  )
}
