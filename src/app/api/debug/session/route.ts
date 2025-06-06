import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({
        authenticated: false,
        message: 'Nenhuma sessão ativa'
      })
    }

    // Buscar dados completos do usuário
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        agency: true,
        ownedAgency: true,
      },
    })

    return NextResponse.json({
      authenticated: true,
      session: {
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          role: session.user.role,
          agencyId: session.user.agencyId,
        }
      },
      userFromDb: user ? {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        agencyId: user.agencyId,
        hasAgency: !!user.agency,
        hasOwnedAgency: !!user.ownedAgency,
        agency: user.agency ? {
          id: user.agency.id,
          name: user.agency.name,
          slug: user.agency.slug,
          plan: user.agency.plan,
        } : null,
        ownedAgency: user.ownedAgency ? {
          id: user.ownedAgency.id,
          name: user.ownedAgency.name,
          slug: user.ownedAgency.slug,
          plan: user.ownedAgency.plan,
        } : null,
      } : null,
    })
  } catch (error) {
    console.error('Erro no debug da sessão:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }, { status: 500 })
  }
} 