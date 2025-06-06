'use client'

import { useSession } from 'next-auth/react'
import { Role } from '@/generated/prisma'

export interface TenantInfo {
  agencyId: string | null
  userId: string | null
  role: Role | null
  agencyName: string | null
  isOwner: boolean
  isAdmin: boolean
  isMember: boolean
}

/**
 * Hook para acessar informações do tenant atual
 */
export function useTenant(): TenantInfo {
  const { data: session } = useSession()

  const agencyId = session?.user?.agencyId || null
  const userId = session?.user?.id || null
  const role = session?.user?.role || null

  return {
    agencyId,
    userId,
    role,
    agencyName: null, // TODO: Buscar nome da agência se necessário
    isOwner: role === Role.OWNER,
    isAdmin: role === Role.ADMIN || role === Role.OWNER,
    isMember: role === Role.MEMBER || role === Role.ADMIN || role === Role.OWNER,
  }
}

/**
 * Hook para verificar permissões
 */
export function usePermissions() {
  const tenant = useTenant()

  const hasPermission = (requiredRole: Role): boolean => {
    if (!tenant.role) return false

    const roleHierarchy = {
      [Role.MEMBER]: 1,
      [Role.ADMIN]: 2,
      [Role.OWNER]: 3,
    }

    return roleHierarchy[tenant.role] >= roleHierarchy[requiredRole]
  }

  const canManageUsers = () => hasPermission(Role.ADMIN)
  const canManageAgency = () => hasPermission(Role.OWNER)
  const canAccessProjects = () => hasPermission(Role.MEMBER)

  return {
    hasPermission,
    canManageUsers,
    canManageAgency,
    canAccessProjects,
    ...tenant,
  }
} 