import { useQuery } from '@tanstack/react-query'
import { leadsApi } from './leads-api'
import type { QueryParams } from '@/lib/api-client/types'

export function useLeads(params: QueryParams) {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: () => leadsApi.list(params),
    placeholderData: (prev) => prev,
  })
}
