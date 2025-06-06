import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/tenant'
import { db } from '@/lib/db'
import { Role } from '@prisma/client'

export const runtime = 'nodejs'

// PUT /api/users/[id] - Atualizar usuário
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requirePermission(Role.ADMIN)
    const { name, role } = await request.json()
    const { id: userId } = await params

    // Buscar usuário para verificar se pertence à mesma agência
    const existingUser = await db.user.findUnique({
      where: { id: userId },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o usuário pertence à mesma agência
    if (existingUser.agencyId !== context.agencyId) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Validações de role
    if (role && !Object.values(Role).includes(role)) {
      return NextResponse.json(
        { error: 'Role inválido' },
        { status: 400 }
      )
    }

    // Apenas owners podem alterar roles para owner
    if (role === Role.OWNER && context.role !== Role.OWNER) {
      return NextResponse.json(
        { error: 'Apenas owners podem promover outros usuários a owner' },
        { status: 403 }
      )
    }

    // Não pode alterar o próprio role se for o único owner
    if (existingUser.id === context.userId && existingUser.role === Role.OWNER) {
      const ownerCount = await db.user.count({
        where: {
          agencyId: context.agencyId,
          role: Role.OWNER,
        },
      })

      if (ownerCount === 1 && role !== Role.OWNER) {
        return NextResponse.json(
          { error: 'Não é possível alterar o role do último owner da agência' },
          { status: 400 }
        )
      }
    }

    // Atualizar usuário
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(role && { role }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      message: 'Usuário atualizado com sucesso',
      user: updatedUser,
    })
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: error instanceof Error && error.message.includes('Acesso negado') ? 403 : 500 }
    )
  }
}

// DELETE /api/users/[id] - Remover usuário
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requirePermission(Role.ADMIN)
    const { id: userId } = await params

    // Buscar usuário para verificar se pertence à mesma agência
    const existingUser = await db.user.findUnique({
      where: { id: userId },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o usuário pertence à mesma agência
    if (existingUser.agencyId !== context.agencyId) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Não pode remover a si mesmo
    if (existingUser.id === context.userId) {
      return NextResponse.json(
        { error: 'Não é possível remover a si mesmo' },
        { status: 400 }
      )
    }

    // Não pode remover o último owner
    if (existingUser.role === Role.OWNER) {
      const ownerCount = await db.user.count({
        where: {
          agencyId: context.agencyId,
          role: Role.OWNER,
        },
      })

      if (ownerCount === 1) {
        return NextResponse.json(
          { error: 'Não é possível remover o último owner da agência' },
          { status: 400 }
        )
      }
    }

    // Remover usuário
    await db.user.delete({
      where: { id: userId },
    })

    return NextResponse.json({
      message: 'Usuário removido com sucesso',
    })
  } catch (error) {
    console.error('Erro ao remover usuário:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: error instanceof Error && error.message.includes('Acesso negado') ? 403 : 500 }
    )
  }
}
