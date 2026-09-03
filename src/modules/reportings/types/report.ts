export type ReportType = 'financial' | 'operational' | 'client'

export interface Report {
  id: string
  name: string
  type: ReportType
  generatedBy: string
  generatedAt: string
}

export interface ReportRaw {
  id: string
  report_name: string
  report_type: ReportType
  generated_by: string
  generated_on: string
}
