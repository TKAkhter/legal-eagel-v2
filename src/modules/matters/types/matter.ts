export type MatterStatus = 'open' | 'in_progress' | 'on_hold' | 'closed'

export interface Matter {
  id: string
  title: string
  clientName: string
  status: MatterStatus
  assignedTo: string
  openedAt: string
}

export interface MatterRaw {
  id: string
  matter_title: string
  client_name: string
  status: MatterStatus
  assigned_to: string
  opened_on: string
}
