import { Breadcrumbs as MuiBreadcrumbs, Link as MuiLink, Typography } from '@mui/material'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { staticNavItems } from '@/layouts/nav-config/static-nav-items'
import { useBreadcrumbExtraForCurrentPath } from './breadcrumb-context'

/**
 * Renders "Dashboard / Section / <entity>" for any authenticated route.
 * The section crumb comes from `staticNavItems` (matched by path
 * prefix); the trailing entity crumb, if any, comes from
 * `useBreadcrumbLabel` — see `LeadDetailPage` for the pattern. Doesn't
 * render at all on the dashboard itself (nothing to show).
 */
export function AppBreadcrumbs() {
  const { t } = useTranslation()
  const location = useLocation()
  const extraLabel = useBreadcrumbExtraForCurrentPath()

  if (location.pathname === '/') return null

  const section = staticNavItems.find(
    (item) => item.path !== '/' && location.pathname.startsWith(item.path),
  )

  return (
    <MuiBreadcrumbs sx={{ mb: 2 }}>
      <MuiLink component={Link} to="/" underline="hover" color="text.secondary">
        {t('nav.dashboard')}
      </MuiLink>
      {section &&
        (extraLabel ? (
          <MuiLink component={Link} to={section.path} underline="hover" color="text.secondary">
            {t(section.labelKey)}
          </MuiLink>
        ) : (
          <Typography color="text.primary">{t(section.labelKey)}</Typography>
        ))}
      {extraLabel && <Typography color="text.primary">{extraLabel}</Typography>}
    </MuiBreadcrumbs>
  )
}
