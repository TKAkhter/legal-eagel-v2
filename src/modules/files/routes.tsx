import type { RouteObject } from 'react-router-dom'

export const filesRoutes: RouteObject[] = [
  {
    path: 'files',
    lazy: async () => {
      const { FileManagerPage } = await import('./components/FileManagerPage')
      return { Component: FileManagerPage }
    },
  },
]
