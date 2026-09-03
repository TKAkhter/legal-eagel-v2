export type UserStatus = 'active' | 'invited' | 'suspended'

export interface AppUser {
  id: string
  name: string
  email: string
  roleName: string
  status: UserStatus
  lastActiveAt: string
}

export interface AppUserRaw {
  id: string
  full_name: string
  email: string
  role_name: string
  status: UserStatus
  last_active_on: string
}
