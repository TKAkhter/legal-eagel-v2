import { useState } from 'react'
import { Fab, Drawer, Box, Typography, Chip, Divider, Tooltip } from '@mui/material'
import { Flag } from 'lucide-react'
import { featureFlags } from '@/lib/feature-flags'
import { appVersion, buildTime } from '@/lib/version'

/**
 * Only rendered in dev builds (see the `import.meta.env.DEV` check at
 * the bottom) — a quick way for a junior dev to confirm which feature
 * flags are actually active without digging through `.env.local` or
 * adding a temporary `console.log`. Never ships in a production build.
 */
function FlagDebugPanelInner() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Tooltip title="Feature flags (dev only)">
        <Fab
          size="small"
          onClick={() => setOpen(true)}
          aria-label="Feature flags"
          sx={{ position: 'fixed', insetInlineEnd: 16, bottom: 16, zIndex: (t) => t.zIndex.speedDial }}
        >
          <Flag size={18} />
        </Fab>
      </Tooltip>

      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 280, p: 2.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
            Feature flags
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            Dev-only panel — never shown in production builds.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {Object.entries(featureFlags).map(([key, value]) => (
              <Box key={key} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2">{key}</Typography>
                <Chip size="small" label={String(value)} color={value ? 'success' : 'default'} />
              </Box>
            ))}
          </Box>

          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            v{appVersion} · built {new Date(buildTime).toLocaleString()}
          </Typography>
        </Box>
      </Drawer>
    </>
  )
}

export function FlagDebugPanel() {
  if (!import.meta.env.DEV) return null
  return <FlagDebugPanelInner />
}
