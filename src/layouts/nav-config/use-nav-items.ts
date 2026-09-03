import { useQuery } from '@tanstack/react-query'
import { featureFlags } from '@/lib/feature-flags'
import { httpClient } from '@/lib/api-client/http-client'
import { useAuthStore } from '@/lib/store/auth-store'
import { staticNavItems, type NavItem } from './static-nav-items'

async function fetchNavFromBackend(): Promise<NavItem[]> {
  const { data } = await httpClient.get<NavItem[]>('/nav')
  return data
}

/** Resolves the nav source (static vs backend) and filters by the user's permissions. */
export function useNavItems() {
  const hasPermission = useAuthStore((s) => s.hasPermission)

  const { data: backendItems, isLoading } = useQuery({
    queryKey: ['nav'],
    queryFn: fetchNavFromBackend,
    enabled: featureFlags.backendDrivenNav,
    staleTime: 5 * 60_000,
  })

  const source = featureFlags.backendDrivenNav ? (backendItems ?? []) : staticNavItems
  const items = source.filter((item) => !item.permission || hasPermission(item.permission))

  return { items, isLoading: featureFlags.backendDrivenNav && isLoading }
}
