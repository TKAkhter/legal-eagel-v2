import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

interface BreadcrumbExtra {
  pathname: string
  label: string
}

interface BreadcrumbContextValue {
  extra: BreadcrumbExtra | null
  setExtra: (extra: BreadcrumbExtra) => void
}

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null)

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [extra, setExtra] = useState<BreadcrumbExtra | null>(null)
  return <BreadcrumbContext.Provider value={{ extra, setExtra }}>{children}</BreadcrumbContext.Provider>
}

function useBreadcrumbContext() {
  const ctx = useContext(BreadcrumbContext)
  if (!ctx) throw new Error('useBreadcrumbContext must be used within BreadcrumbProvider')
  return ctx
}

/**
 * Call from a detail page to add a trailing breadcrumb beyond the
 * section name — e.g. `useBreadcrumbLabel(lead?.name)` on a Lead
 * detail page. Pass `undefined`/`null` (e.g. while loading) and
 * nothing extra renders yet. Keyed to the pathname it was set for, so
 * navigating away automatically stops showing a stale label — no
 * manual cleanup needed.
 */
export function useBreadcrumbLabel(label: string | null | undefined) {
  const { setExtra } = useBreadcrumbContext()
  const location = useLocation()

  useEffect(() => {
    if (label) setExtra({ pathname: location.pathname, label })
  }, [label, location.pathname, setExtra])
}

/** Read by `AppBreadcrumbs` — not meant for direct use elsewhere. */
export function useBreadcrumbExtraForCurrentPath(): string | null {
  const { extra } = useBreadcrumbContext()
  const location = useLocation()
  return extra && extra.pathname === location.pathname ? extra.label : null
}
