import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Role } from "@prisma/client"
import { appErrors } from "@/lib/errors"

export interface TenantContext {
  agencyId: string
  userId: string
  role: Role
  agency: {
    id: string
    name: string
    slug: string
    plan: string
  }
}

/**
 * Obtém o contexto do tenant atual baseado na sessão
 */
export async function getTenantContext(): Promise<TenantContext | null> {
  const session = await auth()
  
  if (!session?.user?.id || !session.user.agencyId) {
    return null
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      agency: true,
      ownedAgency: true,
    },
  })

  if (!user || !user.agencyId) {
    return null
  }

  const agency = user.agency || user.ownedAgency
  if (!agency) {
    return null
  }

  return {
    agencyId: agency.id,
    userId: user.id,
    role: user.role,
    agency: {
      id: agency.id,
      name: agency.name,
      slug: agency.slug,
      plan: agency.plan,
    },
  }
}

/**
 * Verifica se o usuário tem permissão para uma ação específica
 */
export function hasPermission(
  userRole: Role,
  requiredRole: Role
): boolean {
  const roleHierarchy = {
    [Role.MEMBER]: 1,
    [Role.ADMIN]: 2,
    [Role.OWNER]: 3,
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

/**
 * Verifica se o usuário pode acessar um recurso específico
 */
export async function canAccessResource(
  resourceAgencyId: string,
  requiredRole: Role = Role.MEMBER
): Promise<boolean> {
  const context = await getTenantContext()
  
  if (!context) {
    return false
  }

  // Verifica se pertence à mesma agência
  if (context.agencyId !== resourceAgencyId) {
    return false
  }

  // Verifica se tem a permissão necessária
  return hasPermission(context.role, requiredRole)
}

/**
 * Middleware para garantir que o usuário está autenticado e tem acesso ao tenant
 */
export async function requireTenant(): Promise<TenantContext> {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw appErrors.UNAUTHENTICATED
  }

  if (!session.user.agencyId) {
    throw appErrors.TENANT_NOT_FOUND
  }

  const context = await getTenantContext()
  
  if (!context) {
    throw appErrors.TENANT_ACCESS_DENIED
  }

  return context
}

/**
 * Middleware para garantir uma permissão específica
 */
export async function requirePermission(requiredRole: Role): Promise<TenantContext> {
  const context = await requireTenant()
  
  if (!hasPermission(context.role, requiredRole)) {
    throw appErrors.UNAUTHORIZED
  }

  return context
}

/**
 * Obtém o contexto do tenant e retorna o cliente Prisma normal
 * Use este helper para garantir que você tem o contexto antes de fazer queries
 */
export async function getTenantDb() {
  const context = await requireTenant()
  
  return {
    db,
    context,
  }
}
