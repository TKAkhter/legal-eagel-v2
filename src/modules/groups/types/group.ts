export interface Group {
  id: string
  name: string
  memberCount: number
  createdAt: string
}

export interface GroupRaw {
  id: string
  group_name: string
  member_count: number
  created_on: string
}
