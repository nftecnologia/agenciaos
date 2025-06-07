import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Sempre permitir rotas do NextAuth
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next()
  }

  // Sempre permitir arquivos estáticos
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.') // arquivos com extensão
  ) {
    return NextResponse.next()
  }

  // Rotas públicas
  const publicRoutes = ['/auth/signin', '/auth/signup']
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Para outras rotas, verificar autenticação via cookie
  const authCookie = request.cookies.get('authjs.session-token') || 
                     request.cookies.get('__Secure-authjs.session-token')

  // Se não tem cookie de sessão, redirecionar para login
  if (!authCookie) {
    // Para APIs, retornar 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Acesso negado: usuário não autenticado' },
        { status: 401 }
      )
    }
    // Para páginas, redirecionar para login
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
