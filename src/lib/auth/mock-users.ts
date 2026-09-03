import type { AuthUser, Role } from './types'

const adminRole: Role = {
  id: 'role-admin',
  name: 'Administrator',
  permissions: [
    'leads:view', 'leads:edit',
    'clients:view', 'clients:edit',
    'matters:view', 'matters:edit',
    'billings:view', 'billings:edit',
    'reportings:view',
    'users:view', 'users:edit',
    'groups:view', 'groups:edit',
    'permissions:view', 'permissions:edit',
    'mail:view',
    'files:view', 'files:edit',
  ],
}

const staffRole: Role = {
  id: 'role-staff',
  name: 'Staff',
  permissions: [
    'leads:view', 'leads:edit',
    'clients:view', 'clients:edit',
    'matters:view', 'matters:edit',
    'reportings:view',
    'mail:view',
    'files:view',
  ],
}

export const mockUsers: (AuthUser & { password: string })[] = [
  {
    id: 'user-1',
    name: 'Amina Haddad',
    email: 'admin@example.com',
    password: 'password',
    roles: [adminRole],
  },
  {
    id: 'user-2',
    name: 'Omar Siddiqui',
    email: 'staff@example.com',
    password: 'password',
    roles: [staffRole],
  },
]

export const mockRoles: Role[] = [adminRole, staffRole]
