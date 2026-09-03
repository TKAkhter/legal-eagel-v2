import { createResourceClient } from '@/lib/api-client/create-resource-client'
import { reportsMockData } from '../mock/reports.mock'
import type { Report, ReportRaw } from '../types/report'

export const reportsApi = createResourceClient<ReportRaw, Report>({
  resource: '/reportings',
  mockData: reportsMockData,
  transform: (raw) => ({
    id: raw.id,
    name: raw.report_name,
    type: raw.report_type,
    generatedBy: raw.generated_by,
    generatedAt: raw.generated_on,
  }),
  toRaw: (partial) => ({
    ...(partial.name !== undefined && { report_name: partial.name }),
    ...(partial.type !== undefined && { report_type: partial.type }),
    ...(partial.generatedBy !== undefined && { generated_by: partial.generatedBy }),
  }),
})
