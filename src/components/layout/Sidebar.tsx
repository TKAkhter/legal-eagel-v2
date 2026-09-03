import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography, useMediaQuery, useTheme, Tooltip } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { NavLink, useLocation } from 'react-router-dom'
import { useNavStore } from '@/lib/store/nav-store'
import { useUiPreferences } from '@/lib/store/ui-preferences-store'
import { useNavItems } from '@/layouts/nav-config/use-nav-items'
import { NavIcon } from './NavIcon'
import { appVersion } from '@/lib/version'

export const SIDEBAR_EXPANDED_WIDTH = 260
export const SIDEBAR_COLLAPSED_WIDTH = 76

function NavList({ collapsed }: { collapsed: boolean }) {
  const { t } = useTranslation()
  const { items } = useNavItems()
  const location = useLocation()
  const closeMobile = useNavStore((s) => s.closeMobile)

  return (
    <List sx={{ px: 1, flexGrow: 1, overflowY: 'auto' }}>
      {items.map((item) => {
        const active = location.pathname === item.path
        return (
          <ListItemButton
            key={item.key}
            component={NavLink}
            to={item.path}
            onClick={closeMobile}
            selected={active}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              minHeight: 44,
              justifyContent: collapsed ? 'center' : 'flex-start',
              px: collapsed ? 1.5 : 2,
            }}
          >
            <ListItemIcon sx={{ minWidth: collapsed ? 'auto' : 40, justifyContent: 'center' }}>
              <NavIcon name={item.icon} />
            </ListItemIcon>
            {!collapsed && <ListItemText primary={t(item.labelKey)} />}
          </ListItemButton>
        )
      })}
    </List>
  )
}

function SidebarHeader({ collapsed }: { collapsed: boolean }) {
  const { t } = useTranslation()
  return (
    <Box sx={{ height: 64, flexShrink: 0, display: 'flex', alignItems: 'center', px: collapsed ? 0 : 2.5, justifyContent: collapsed ? 'center' : 'flex-start' }}>
      <Typography variant="h6" noWrap sx={{ fontWeight: 700, opacity: collapsed ? 0 : 1, transition: 'opacity var(--transition-fast)' }}>
        {collapsed ? '' : t('app.name')}
      </Typography>
    </Box>
  )
}

function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  return (
    <Box sx={{ flexShrink: 0, px: collapsed ? 0 : 2.5, py: 1.5, textAlign: collapsed ? 'center' : 'left', borderTop: 1, borderColor: 'divider' }}>
      <Tooltip title={`Built ${new Date().getFullYear()}`}>
        <Typography variant="caption" color="text.disabled">
          {collapsed ? `v${appVersion.split('.')[0]}` : `v${appVersion}`}
        </Typography>
      </Tooltip>
    </Box>
  )
}

export function Sidebar() {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))

  const isCollapsed = useNavStore((s) => s.isCollapsed)
  const isHoverExpanded = useNavStore((s) => s.isHoverExpanded)
  const setHoverExpanded = useNavStore((s) => s.setHoverExpanded)
  const isMobileOpen = useNavStore((s) => s.isMobileOpen)
  const closeMobile = useNavStore((s) => s.closeMobile)
  const layoutMode = useUiPreferences((s) => s.layoutMode)

  if (!isDesktop) {
    // Tablet + mobile: same overlay drawer behavior.
    return (
      <Drawer
        variant="temporary"
        open={isMobileOpen}
        onClose={closeMobile}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: SIDEBAR_EXPANDED_WIDTH, boxSizing: 'border-box', display: 'flex', flexDirection: 'column' } }}
      >
        <SidebarHeader collapsed={false} />
        <NavList collapsed={false} />
        <SidebarFooter collapsed={false} />
      </Drawer>
    )
  }

  const flyoutOpen = isCollapsed && isHoverExpanded
  const currentWidth = isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH

  // Horizontal layout mode replaces the persistent rail with HorizontalNav
  // (see DashboardLayout) — but mobile always keeps the drawer above, since
  // a horizontal bar doesn't fit a narrow screen regardless of preference.
  if (layoutMode === 'horizontal') return null

  return (
    <Box
      component="nav"
      onMouseEnter={() => isCollapsed && setHoverExpanded(true)}
      onMouseLeave={() => setHoverExpanded(false)}
      sx={{
        position: 'relative',
        flexShrink: 0,
        width: currentWidth,
        transition: 'width var(--transition-base)',
      }}
    >
      <Box
        sx={{
          position: flyoutOpen ? 'absolute' : 'static',
          top: 0,
          insetInlineStart: 0,
          height: '100%',
          width: flyoutOpen ? SIDEBAR_EXPANDED_WIDTH : currentWidth,
          bgcolor: 'background.paper',
          borderInlineEnd: 1,
          borderColor: 'divider',
          zIndex: flyoutOpen ? theme.zIndex.drawer + 1 : 'auto',
          boxShadow: flyoutOpen ? 6 : 'none',
          transition: 'width var(--transition-base), box-shadow var(--transition-base)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <SidebarHeader collapsed={isCollapsed && !flyoutOpen} />
        <NavList collapsed={isCollapsed && !flyoutOpen} />
        <SidebarFooter collapsed={isCollapsed && !flyoutOpen} />
      </Box>
    </Box>
  )
}
