import { useEffect } from 'react'
import { useBlocker } from 'react-router-dom'

/**
 * `useUnsavedChangesGuard(isDirty)` — drop into any page with an
 * editable form/checklist. Blocks React Router navigation with a
 * native confirm (swap for a themed dialog later if desired) and also
 * warns on browser tab close/refresh via `beforeunload`.
 */
export function useUnsavedChangesGuard(isDirty: boolean) {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => isDirty && currentLocation.pathname !== nextLocation.pathname,
  )

  useEffect(() => {
    if (blocker.state !== 'blocked') return
    const proceed = window.confirm('You have unsaved changes. Leave without saving?')
    if (proceed) blocker.proceed()
    else blocker.reset()
  }, [blocker])

  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])
}
