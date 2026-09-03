import { Box, Paper, Typography, List, ListItemButton, ListItemText, Tabs, Tab } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useActivityStore } from '@/lib/store/activity-store'

export function FavoritesWidget() {
  const [tab, setTab] = useState(0)
  const navigate = useNavigate()
  const favorites = useActivityStore((s) => s.favorites)
  const recentlyViewed = useActivityStore((s) => s.recentlyViewed)

  const items = tab === 0 ? favorites : recentlyViewed

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: 2 }}>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ minHeight: 36, mb: 1 }}>
        <Tab label="Favorites" sx={{ minHeight: 36 }} />
        <Tab label="Recently viewed" sx={{ minHeight: 36 }} />
      </Tabs>

      {items.length === 0 ? (
        <Box sx={{ py: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {tab === 0 ? 'Star a record to pin it here.' : 'Records you open will show up here.'}
          </Typography>
        </Box>
      ) : (
        <List disablePadding dense>
          {items.map((item) => (
            <ListItemButton key={`${item.module}-${item.id}`} onClick={() => navigate(item.path)} sx={{ borderRadius: 1.5 }}>
              <ListItemText primary={item.label} secondary={item.module} />
            </ListItemButton>
          ))}
        </List>
      )}
    </Paper>
  )
}
