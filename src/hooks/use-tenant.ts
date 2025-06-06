"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import type { TenantContext } from "@/lib/tenant"

interface UseTenantReturn {
  tenant: TenantContext | null
  isLoading: boolean
  error: string | null
  hasPermission: (requiredRole: 'MEMBER' | 'ADMIN' | 'OWNER') => boolean
  isOwner: boolean
  isAdmin: boolean
  isMember: boolean
}

/**
 * Hook para acessar o contexto do tenant no frontend
 */
export function useTenant(): UseTenantReturn {
  const { data: session, status } = useSession()
  const [tenant, setTenant] = useState<TenantContext | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isLoading = status === "loading"

  useEffect(() => {
    if (status === "loading") return

    if (!session?.user) {
      setTenant(null)
      setError("Usuário não autenticado")
      return
    }

    if (!session.user.agencyId) {
      setTenant(null)
      setError("Usuário sem agência associada")
      return
    }

    // Construir contexto do tenant baseado na sessão
    const tenantContext: TenantContext = {
      agencyId: session.user.agencyId,
      userId: session.user.id,
      role: session.user.role,
      agency: {
        id: session.user.agencyId,
        name: "", // Será preenchido via API se necessário
        slug: "",
        plan: "",
      },
    }

    setTenant(tenantContext)
    setError(null)
  }, [session, status])

  // Função para verificar permissões
  const hasPermission = (requiredRole: 'MEMBER' | 'ADMIN' | 'OWNER'): boolean => {
    if (!tenant) return false

    const roleHierarchy = {
      MEMBER: 1,
      ADMIN: 2,
      OWNER: 3,
    }

    return roleHierarchy[tenant.role] >= roleHierarchy[requiredRole]
  }

  return {
    tenant,
    isLoading,
    error,
    hasPermission,
    isOwner: tenant?.role === 'OWNER',
    isAdmin: tenant?.role === 'ADMIN' || tenant?.role === 'OWNER',
    isMember: !!tenant, // Qualquer usuário autenticado é pelo menos member
  }
}

/**
 * Hook para obter informações detalhadas da agência
 */
export function useAgency() {
  const { tenant } = useTenant()
  const [agency, setAgency] = useState<TenantContext['agency'] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tenant?.agencyId) {
      setAgency(null)
      return
    }

    // Se já temos dados básicos da agência, usar eles
    if (tenant.agency.name) {
      setAgency(tenant.agency)
      return
    }

    // Caso contrário, buscar dados completos da agência
    const fetchAgency = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/agencies/${tenant.agencyId}`)
        
        if (!response.ok) {
          throw new Error('Falha ao carregar dados da agência')
        }

        const data = await response.json()
        setAgency(data.agency)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAgency()
  }, [tenant])

  return {
    agency,
    isLoading,
    error,
  }
}

/**
 * Hook para verificar se o usuário pode acessar um recurso específico
 */
export function useResourceAccess(
  resourceAgencyId?: string,
  requiredRole: 'MEMBER' | 'ADMIN' | 'OWNER' = 'MEMBER'
) {
  const { tenant, hasPermission } = useTenant()

  const canAccess = (): boolean => {
    if (!tenant || !resourceAgencyId) return false

    // Verifica se pertence à mesma agência
    if (tenant.agencyId !== resourceAgencyId) return false

    // Verifica se tem a permissão necessária
    return hasPermission(requiredRole)
  }

  return {
    canAccess: canAccess(),
    tenant,
    hasPermission,
  }
}

/**
 * Hook para filtrar dados por agência automaticamente
 */
export function useTenantFilter<T extends { agencyId: string }>(data: T[]): T[] {
  const { tenant } = useTenant()

  if (!tenant) return []

  return data.filter(item => item.agencyId === tenant.agencyId)
}

/**
 * Hook simplificado para verificar permissões
 */
export function usePermissions() {
  const { hasPermission, isOwner, isAdmin, isMember } = useTenant()

  return {
    hasPermission,
    isOwner,
    isAdmin,
    isMember,
  }
}
