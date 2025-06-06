import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { applyRateLimit } from "@/lib/rate-limit"
import { Role } from "@prisma/client"

// Definir rotas que requerem permissões específicas
const routePermissions: Record<string, { role: Role; description: string }> = {
  // Rotas de administração - apenas admins e owners
  '/admin': { role: Role.ADMIN, description: 'Área administrativa' },
  '/users': { role: Role.ADMIN, description: 'Gerenciamento de usuários' },
  '/settings': { role: Role.ADMIN, description: 'Configurações da agência' },
  
  // Rotas de owner - apenas proprietários
  '/agency/settings': { role: Role.OWNER, description: 'Configurações da agência' },
  '/billing': { role: Role.OWNER, description: 'Faturamento e planos' },
  '/integrations': { role: Role.OWNER, description: 'Integrações e APIs' },
  
  // APIs que requerem permissões específicas
  '/api/users': { role: Role.ADMIN, description: 'API de usuários' },
  '/api/agency': { role: Role.OWNER, description: 'API da agência' },
}

export default auth(async (req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  const user = req.auth?.user

  // Aplicar rate limiting em rotas de API
  if (pathname.startsWith('/api/')) {
    try {
      // Determinar tipo de rate limiting baseado na rota
      let rateLimitType: 'auth' | 'api' | 'dashboard' | 'ai' = 'api'
      
      if (pathname.includes('/auth/')) {
        rateLimitType = 'auth'
      } else if (pathname.includes('/dashboard/')) {
        rateLimitType = 'dashboard'
      } else if (pathname.includes('/ai/')) {
        rateLimitType = 'ai'
      }

      // Aplicar rate limiting
      const rateLimitResult = await applyRateLimit(req, rateLimitType)
      if (!rateLimitResult.success && rateLimitResult.error) {
        return NextResponse.json(
          { 
            error: rateLimitResult.error.message,
            code: 'RATE_LIMIT_EXCEEDED'
          },
          { status: 429 }
        )
      }
    } catch (error) {
      // Em caso de erro no rate limiting, permitir a requisição (fail-open)
      console.warn('Erro no rate limiting:', error)
    }
  }

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ['/auth/signin', '/auth/signup', '/api/auth/register']
  const isPublicRoute = publicRoutes.includes(pathname)

  // Se está em uma rota pública
  if (isPublicRoute) {
    // Se já está logado, redirecionar para dashboard
    if (isLoggedIn && !pathname.startsWith('/api/')) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    return NextResponse.next()
  }

  // Se não está logado e tentando acessar rota protegida
  if (!isLoggedIn) {
    // Para rotas de API, retornar 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Acesso negado: usuário não autenticado' },
        { status: 401 }
      )
    }
    // Para rotas de página, redirecionar para login
    return NextResponse.redirect(new URL('/auth/signin', req.url))
  }

  // Verificar permissões específicas para rotas protegidas
  if (isLoggedIn && user) {
    // Verificar se a rota requer permissões específicas
    const requiredPermission = Object.entries(routePermissions).find(([route]) => 
      pathname.startsWith(route)
    )

    if (requiredPermission) {
      const [, { role: requiredRole, description }] = requiredPermission
      const userRole = user.role as Role

      // Hierarquia de roles: MEMBER < ADMIN < OWNER
      const roleHierarchy = {
        [Role.MEMBER]: 1,
        [Role.ADMIN]: 2,
        [Role.OWNER]: 3,
      }

      const hasPermission = roleHierarchy[userRole] >= roleHierarchy[requiredRole]

      if (!hasPermission) {
        // Para rotas de API, retornar 403
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { 
              error: `Acesso negado: ${description} requer permissão ${requiredRole}`,
              code: 'INSUFFICIENT_PERMISSIONS',
              requiredRole,
              userRole
            },
            { status: 403 }
          )
        }
        
        // Para rotas de página, redirecionar para página de acesso negado
        const accessDeniedUrl = new URL('/access-denied', req.url)
        accessDeniedUrl.searchParams.set('reason', 'insufficient_permissions')
        accessDeniedUrl.searchParams.set('required', requiredRole)
        accessDeniedUrl.searchParams.set('description', description)
        return NextResponse.redirect(accessDeniedUrl)
      }
    }

    // Verificar se usuário tem agência associada (exceto para rotas de setup)
    if (!user.agencyId && !pathname.startsWith('/setup') && !pathname.startsWith('/api/auth')) {
      // Para rotas de API, retornar 400
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { 
            error: 'Usuário não possui agência associada',
            code: 'NO_AGENCY'
          },
          { status: 400 }
        )
      }
      
      // Para rotas de página, redirecionar para setup
      return NextResponse.redirect(new URL('/setup', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
