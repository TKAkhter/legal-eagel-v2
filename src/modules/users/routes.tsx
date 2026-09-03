import type { RouteObject } from 'react-router-dom'

export const usersRoutes: RouteObject[] = [
  {
    path: 'users',
    lazy: async () => {
      const { UsersListPage } = await import('./components/UsersListPage')
      return { Component: UsersListPage }
    },
  },
  {
    path: 'users/:id',
    lazy: async () => {
      const { UserDetailPage } = await import('./components/UserDetailPage')
      return { Component: UserDetailPage }
    },
  },
]
