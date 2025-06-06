import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireTenant } from '@/lib/tenant'

const updateBoardSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  color: z.string().optional(),
  position: z.number().int().min(0).optional(),
})

// PUT /api/boards/[id] - Atualizar board
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireTenant()
    const { id: boardId } = await params
    const body = await request.json()
    const validatedData = updateBoardSchema.parse(body)

    // Verificar se o board existe e pertence à agência
    const existingBoard = await db.board.findFirst({
      where: {
        id: boardId,
        project: {
          agencyId: context.agencyId,
        },
      },
    })

    if (!existingBoard) {
      return NextResponse.json(
        { error: 'Board não encontrado' },
        { status: 404 }
      )
    }

    const board = await db.board.update({
      where: { id: boardId },
      data: validatedData,
      include: {
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            position: 'asc',
          },
        },
      },
    })

    return NextResponse.json(board)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao atualizar board:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: error instanceof Error && error.message.includes('Acesso negado') ? 403 : 500 }
    )
  }
}

// DELETE /api/boards/[id] - Deletar board
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireTenant()
    const { id: boardId } = await params

    // Verificar se o board existe e pertence à agência
    const existingBoard = await db.board.findFirst({
      where: {
        id: boardId,
        project: {
          agencyId: context.agencyId,
        },
      },
      include: {
        tasks: true,
      },
    })

    if (!existingBoard) {
      return NextResponse.json(
        { error: 'Board não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se há tarefas no board
    if (existingBoard.tasks.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível deletar um board que contém tarefas' },
        { status: 400 }
      )
    }

    await db.board.delete({
      where: { id: boardId },
    })

    return NextResponse.json({
      message: 'Board deletado com sucesso',
    })
  } catch (error) {
    console.error('Erro ao deletar board:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: error instanceof Error && error.message.includes('Acesso negado') ? 403 : 500 }
    )
  }
} 