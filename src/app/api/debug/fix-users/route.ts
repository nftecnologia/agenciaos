import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    // Buscar usuários sem agência
    const usersWithoutAgency = await db.user.findMany({
      where: {
        agencyId: null,
      },
    })

    const fixes = []

    for (const user of usersWithoutAgency) {
      // Verificar se o usuário é dono de alguma agência
      const ownedAgency = await db.agency.findFirst({
        where: {
          ownerId: user.id,
        },
      })

      if (ownedAgency) {
        // Associar o usuário à sua agência
        await db.user.update({
          where: { id: user.id },
          data: { agencyId: ownedAgency.id },
        })

        fixes.push({
          userId: user.id,
          userEmail: user.email,
          action: 'Associado à agência própria',
          agencyId: ownedAgency.id,
          agencyName: ownedAgency.name,
        })
      } else {
        // Criar uma nova agência para o usuário
        const newAgency = await db.agency.create({
          data: {
            name: `Agência de ${user.name || user.email}`,
            slug: `agencia-${user.id.slice(-8)}`,
            ownerId: user.id,
            plan: 'FREE',
          },
        })

        // Associar o usuário à nova agência
        await db.user.update({
          where: { id: user.id },
          data: { 
            agencyId: newAgency.id,
            role: 'OWNER',
          },
        })

        fixes.push({
          userId: user.id,
          userEmail: user.email,
          action: 'Nova agência criada',
          agencyId: newAgency.id,
          agencyName: newAgency.name,
        })
      }
    }

    return NextResponse.json({
      message: 'Correções aplicadas com sucesso',
      totalFixed: fixes.length,
      fixes,
    })
  } catch (error) {
    console.error('Erro ao corrigir usuários:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }, { status: 500 })
  }
} 