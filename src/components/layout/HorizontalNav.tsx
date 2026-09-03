import { Box } from '@mui/material'
import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useNavItems } from '@/layouts/nav-config/use-nav-items'
import { NavIcon } from './NavIcon'

/**
 * Alternate to the persistent `Sidebar` rail — a horizontal bar of nav
 * items below the Topbar, in the style of Fuse's "horizontal
 * navigation" layout option. Selected via Settings → Appearance. Only
 * rendered on desktop (see `DashboardLayout`); smaller viewports
 * always fall back to the Sidebar's mobile drawer regardless of this
 * preference, since a horizontal bar doesn't fit a narrow screen.
 */
export function HorizontalNav() {
  const { t } = useTranslation()
  const { items } = useNavItems()
  const location = useLocation()

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        px: 2,
        borderBottom: 1,
        borderColor: 'divider',
        overflowX: 'auto',
        bgcolor: 'background.paper',
      }}
    >
      {items.map((item) => {
        const active = location.pathname === item.path
        return (
          <Box
            key={item.key}
            component={NavLink}
            to={item.path}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.5,
              py: 1.25,
              fontSize: 14,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              textDecoration: 'none',
              color: active ? 'primary.main' : 'text.secondary',
              borderBottom: 2,
              borderColor: active ? 'primary.main' : 'transparent',
            }}
          >
            <NavIcon name={item.icon} size={16} />
            {t(item.labelKey)}
          </Box>
        )
      })}
    </Box>
  )
}
