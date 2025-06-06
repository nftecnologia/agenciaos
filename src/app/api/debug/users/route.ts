import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Buscar todos os usuários com suas agências
    const users = await db.user.findMany({
      include: {
        agency: true,
        ownedAgency: true,
      },
    })

    // Buscar todas as agências
    const agencies = await db.agency.findMany({
      include: {
        owner: true,
        members: true,
      },
    })

    // Identificar problemas
    const usersWithoutAgency = users.filter(user => !user.agencyId)
    const usersWithInvalidAgency = users.filter(user => 
      user.agencyId && !user.agency && !user.ownedAgency
    )

    return NextResponse.json({
      summary: {
        totalUsers: users.length,
        totalAgencies: agencies.length,
        usersWithoutAgency: usersWithoutAgency.length,
        usersWithInvalidAgency: usersWithInvalidAgency.length,
      },
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        agencyId: user.agencyId,
        hasAgency: !!user.agency,
        hasOwnedAgency: !!user.ownedAgency,
        agencyName: user.agency?.name || user.ownedAgency?.name || null,
      })),
      agencies: agencies.map(agency => ({
        id: agency.id,
        name: agency.name,
        slug: agency.slug,
        plan: agency.plan,
        ownerId: agency.ownerId,
        ownerEmail: agency.owner.email,
        membersCount: agency.members.length,
      })),
      problems: {
        usersWithoutAgency: usersWithoutAgency.map(user => ({
          id: user.id,
          email: user.email,
          name: user.name,
        })),
        usersWithInvalidAgency: usersWithInvalidAgency.map(user => ({
          id: user.id,
          email: user.email,
          name: user.name,
          agencyId: user.agencyId,
        })),
      },
    })
  } catch (error) {
    console.error('Erro no debug de usuários:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }, { status: 500 })
  }
} 