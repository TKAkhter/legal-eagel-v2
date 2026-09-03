import type { RouteObject } from 'react-router-dom'

export const groupsRoutes: RouteObject[] = [
  {
    path: 'groups',
    lazy: async () => {
      const { GroupsListPage } = await import('./components/GroupsListPage')
      return { Component: GroupsListPage }
    },
  },
  {
    path: 'groups/:id',
    lazy: async () => {
      const { GroupDetailPage } = await import('./components/GroupDetailPage')
      return { Component: GroupDetailPage }
    },
  },
]
