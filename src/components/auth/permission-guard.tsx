"use client"

import { ReactNode } from "react"
import { useTenant } from "@/hooks/use-tenant"
import { Role } from "@prisma/client"

interface PermissionGuardProps {
  children: ReactNode
  requiredRole?: Role
  requiredPermissions?: string[]
  fallback?: ReactNode
  showFallback?: boolean
}

/**
 * Componente para proteger conteúdo baseado em permissões
 */
export function PermissionGuard({
  children,
  requiredRole = Role.MEMBER,
  fallback = null,
  showFallback = true,
}: PermissionGuardProps) {
  const { tenant, hasPermission, isLoading } = useTenant()

  // Mostrar loading enquanto carrega
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Se não tem tenant, não mostrar nada
  if (!tenant) {
    return showFallback ? fallback : null
  }

  // Verificar permissão de role
  if (!hasPermission(requiredRole)) {
    return showFallback ? fallback : null
  }

  // TODO: Implementar verificação de permissões específicas quando necessário
  // if (requiredPermissions.length > 0) {
  //   const hasRequiredPermissions = requiredPermissions.every(permission =>
  //     tenant.permissions?.includes(permission)
  //   )
  //   if (!hasRequiredPermissions) {
  //     return showFallback ? fallback : null
  //   }
  // }

  return <>{children}</>
}

/**
 * Hook para verificar permissões programaticamente
 */
export function usePermissions() {
  const { tenant, hasPermission, isOwner, isAdmin, isMember } = useTenant()

  const can = (action: string, resource?: string): boolean => {
    if (!tenant) return false

    // Lógica de permissões baseada em roles
    switch (action) {
      case 'create':
        if (resource === 'agency') return isOwner
        if (resource === 'user') return isAdmin
        return isMember

      case 'read':
        return isMember

      case 'update':
        if (resource === 'agency') return isOwner
        if (resource === 'user') return isAdmin
        return isMember

      case 'delete':
        if (resource === 'agency') return isOwner
        if (resource === 'user') return isAdmin
        return isAdmin

      case 'manage':
        if (resource === 'agency') return isOwner
        if (resource === 'users') return isAdmin
        if (resource === 'projects') return isAdmin
        return false

      default:
        return false
    }
  }

  const canManage = (resource: string): boolean => {
    return can('manage', resource)
  }

  const canCreate = (resource: string): boolean => {
    return can('create', resource)
  }

  const canUpdate = (resource: string): boolean => {
    return can('update', resource)
  }

  const canDelete = (resource: string): boolean => {
    return can('delete', resource)
  }

  return {
    tenant,
    hasPermission,
    isOwner,
    isAdmin,
    isMember,
    can,
    canManage,
    canCreate,
    canUpdate,
    canDelete,
  }
}

/**
 * Componente para mostrar conteúdo apenas para owners
 */
export function OwnerOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard requiredRole={Role.OWNER} fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

/**
 * Componente para mostrar conteúdo apenas para admins e owners
 */
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard requiredRole={Role.ADMIN} fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

/**
 * Componente para mostrar conteúdo para qualquer membro autenticado
 */
export function MemberOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard requiredRole={Role.MEMBER} fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

/**
 * Componente para mostrar mensagem de acesso negado
 */
export function AccessDenied({ message = "Você não tem permissão para acessar este conteúdo." }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="rounded-full bg-red-100 p-3 mb-4">
        <svg
          className="h-6 w-6 text-red-600"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Acesso Negado</h3>
      <p className="text-gray-600 max-w-md">{message}</p>
    </div>
  )
}
