import { createSafeActionClient } from "next-safe-action"
import { requireTenant } from "@/lib/tenant"

// Cliente base para actions públicas (sem autenticação)
export const publicAction = createSafeActionClient({
  handleServerError(e: Error) {
    // Log do erro para debugging
    console.error("Action error:", e)
    
    // Retornar mensagem genérica para o cliente
    return "Algo deu errado. Tente novamente."
  },
})

// Cliente para actions autenticadas
export const authenticatedAction = createSafeActionClient({
  handleServerError(e: Error) {
    console.error("Authenticated action error:", e)
    return "Algo deu errado. Tente novamente."
  },
}).use(async ({ next }) => {
  // Verificar autenticação e obter contexto do tenant
  const context = await requireTenant()
  
  // Passar contexto para a action
  return next({ ctx: context })
})

// Cliente para actions que requerem permissões específicas
export const adminAction = createSafeActionClient({
  handleServerError(e: Error) {
    console.error("Admin action error:", e)
    return "Algo deu errado. Tente novamente."
  },
}).use(async ({ next }) => {
  const context = await requireTenant()
  
  // Verificar se é admin ou owner
  if (context.role !== 'ADMIN' && context.role !== 'OWNER') {
    throw new Error('Acesso negado: permissões de administrador necessárias')
  }
  
  return next({ ctx: context })
})

// Cliente para actions que requerem ser owner
export const ownerAction = createSafeActionClient({
  handleServerError(e: Error) {
    console.error("Owner action error:", e)
    return "Algo deu errado. Tente novamente."
  },
}).use(async ({ next }) => {
  const context = await requireTenant()
  
  // Verificar se é owner
  if (context.role !== 'OWNER') {
    throw new Error('Acesso negado: apenas o proprietário da agência pode realizar esta ação')
  }
  
  return next({ ctx: context })
})

// Tipos para o contexto das actions
export type ActionContext = {
  agencyId: string
  userId: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
  agency: {
    id: string
    name: string
    slug: string
    plan: string
  }
}
