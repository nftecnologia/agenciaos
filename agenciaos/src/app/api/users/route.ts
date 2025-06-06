import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/tenant'
import { db } from '@/lib/db'
import { Role } from '@prisma/client'

export const runtime = 'nodejs'

// GET /api/users - Listar usuários da agência
export async function GET() {
  try {
    const context = await requirePermission(Role.ADMIN)

    const users = await db.user.findMany({
      where: {
        agencyId: context.agencyId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Erro ao listar usuários:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: error instanceof Error && error.message.includes('Acesso negado') ? 403 : 500 }
    )
  }
}

// POST /api/users - Convidar novo usuário
export async function POST(request: NextRequest) {
  try {
    const context = await requirePermission(Role.ADMIN)
    const { email, name, role } = await request.json()

    // Validações
    if (!email || !name || !role) {
      return NextResponse.json(
        { error: 'Email, nome e role são obrigatórios' },
        { status: 400 }
      )
    }

    if (!Object.values(Role).includes(role)) {
      return NextResponse.json(
        { error: 'Role inválido' },
        { status: 400 }
      )
    }

    // Apenas owners podem criar outros owners
    if (role === Role.OWNER && context.role !== Role.OWNER) {
      return NextResponse.json(
        { error: 'Apenas owners podem criar outros owners' },
        { status: 403 }
      )
    }

    // Verificar se o email já existe
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email já está em uso' },
        { status: 400 }
      )
    }

    // Criar usuário (sem senha - será definida no primeiro login)
    const user = await db.user.create({
      data: {
        email,
        name,
        role,
        agencyId: context.agencyId,
        emailVerified: null, // Será verificado quando definir a senha
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    // TODO: Enviar email de convite com link para definir senha

    return NextResponse.json(
      {
        message: 'Usuário convidado com sucesso',
        user,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao convidar usuário:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: error instanceof Error && error.message.includes('Acesso negado') ? 403 : 500 }
    )
  }
}
