'use client'

import { usePermissions } from '@/hooks/use-tenant'
import { Role } from '@/generated/prisma'
import { ReactNode } from 'react'

interface PermissionGuardProps {
  children: ReactNode
  requiredRole?: Role
  fallback?: ReactNode
  allowedRoles?: Role[]
}

/**
 * Componente para proteger conteúdo baseado em permissões
 */
export function PermissionGuard({
  children,
  requiredRole,
  allowedRoles,
  fallback = null,
}: PermissionGuardProps) {
  const { hasPermission, role } = usePermissions()

  // Se especificou roles permitidos, verifica se o usuário tem um deles
  if (allowedRoles && role) {
    const hasAllowedRole = allowedRoles.includes(role)
    if (!hasAllowedRole) {
      return <>{fallback}</>
    }
  }

  // Se especificou role mínimo, verifica hierarquia
  if (requiredRole && !hasPermission(requiredRole)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * Componente específico para conteúdo apenas de admins
 */
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard requiredRole={Role.ADMIN} fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

/**
 * Componente específico para conteúdo apenas de owners
 */
export function OwnerOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard requiredRole={Role.OWNER} fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

/**
 * Componente para mostrar diferentes conteúdos baseado no role
 */
interface RoleBasedContentProps {
  owner?: ReactNode
  admin?: ReactNode
  member?: ReactNode
  fallback?: ReactNode
}

export function RoleBasedContent({ owner, admin, member, fallback }: RoleBasedContentProps) {
  const { role } = usePermissions()

  switch (role) {
    case Role.OWNER:
      return <>{owner || admin || member || fallback}</>
    case Role.ADMIN:
      return <>{admin || member || fallback}</>
    case Role.MEMBER:
      return <>{member || fallback}</>
    default:
      return <>{fallback}</>
  }
} 