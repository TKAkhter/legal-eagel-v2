import { createBrowserRouter } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { RequireAuth, RequireRoutePermission } from '@/lib/auth/route-guards'
import { ForbiddenPage } from './ForbiddenPage'
import { NotFoundPage } from './NotFoundPage'
import { leadsRoutes } from '@/modules/leads/routes'
import { clientsRoutes } from '@/modules/clients/routes'
import { mattersRoutes } from '@/modules/matters/routes'
import { billingsRoutes } from '@/modules/billings/routes'
import { reportingsRoutes } from '@/modules/reportings/routes'
import { usersRoutes } from '@/modules/users/routes'
import { groupsRoutes } from '@/modules/groups/routes'
import { permissionsRoutes } from '@/modules/permissions/routes'
import { mailRoutes } from '@/modules/mail/routes'
import { filesRoutes } from '@/modules/files/routes'

/**
 * Route tree, deliberately flat and explicit rather than fully
 * file-system-magic — easy for a junior dev to scan top-to-bottom and
 * see exactly which guard wraps which page. Each module contributes its
 * own `routes.tsx` (see `modules/leads/routes.tsx`) which this file
 * just assembles.
 *
 * Every leaf route uses React Router's `lazy` route field so its page
 * component (and everything it imports — ApexCharts, FullCalendar,
 * etc.) only downloads when the user actually navigates there, instead
 * of bloating the initial bundle. `<Suspense>` around the routed
 * content in `DashboardLayout` shows `RouteLoadingFallback` while a
 * chunk loads.
 */
export const router = createBrowserRouter([
  {
    path: '/login',
    lazy: async () => {
      const { LoginPage } = await import('./LoginPage')
      return { Component: LoginPage }
    },
  },
  {
    path: '/register',
    lazy: async () => {
      const { RegisterPage } = await import('./RegisterPage')
      return { Component: RegisterPage }
    },
  },
  {
    // Standalone — reachable without auth (a maintenance window or a
    // failed backend shouldn't require a session to explain itself),
    // and not wrapped in DashboardLayout.
    path: '/maintenance',
    lazy: async () => {
      const { MaintenancePage } = await import('./MaintenancePage')
      return { Component: MaintenancePage }
    },
  },
  {
    path: '/500',
    lazy: async () => {
      const { ServerErrorPage } = await import('./ServerErrorPage')
      return { Component: ServerErrorPage }
    },
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            lazy: async () => {
              const { DashboardPage } = await import('./DashboardPage')
              return { Component: DashboardPage }
            },
          },
          {
            path: 'settings',
            lazy: async () => {
              const { SettingsPage } = await import('./settings/SettingsPage')
              return { Component: SettingsPage }
            },
          },
          {
            path: 'help',
            lazy: async () => {
              const { HelpCenterPage } = await import('./help/HelpCenterPage')
              return { Component: HelpCenterPage }
            },
          },
          {
            element: <RequireRoutePermission permission="leads:view" />,
            children: leadsRoutes,
          },
          {
            element: <RequireRoutePermission permission="clients:view" />,
            children: clientsRoutes,
          },
          {
            element: <RequireRoutePermission permission="matters:view" />,
            children: mattersRoutes,
          },
          {
            element: <RequireRoutePermission permission="billings:view" />,
            children: billingsRoutes,
          },
          {
            element: <RequireRoutePermission permission="reportings:view" />,
            children: reportingsRoutes,
          },
          {
            element: <RequireRoutePermission permission="users:view" />,
            children: usersRoutes,
          },
          {
            element: <RequireRoutePermission permission="groups:view" />,
            children: groupsRoutes,
          },
          {
            element: <RequireRoutePermission permission="permissions:view" />,
            children: [
              ...permissionsRoutes,
              {
                path: 'audit-log',
                lazy: async () => {
                  const { AuditLogPage } = await import('./audit-log/AuditLogPage')
                  return { Component: AuditLogPage }
                },
              },
            ],
          },
          {
            element: <RequireRoutePermission permission="mail:view" />,
            children: mailRoutes,
          },
          {
            element: <RequireRoutePermission permission="files:view" />,
            children: filesRoutes,
          },
          { path: '403', element: <ForbiddenPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
])
