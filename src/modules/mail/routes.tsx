import type { RouteObject } from 'react-router-dom'

export const mailRoutes: RouteObject[] = [
  {
    path: 'mail',
    lazy: async () => {
      const { MailPage } = await import('./components/MailPage')
      return { Component: MailPage }
    },
  },
]
