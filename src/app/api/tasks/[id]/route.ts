import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireTenant } from '@/lib/tenant'
import { Priority } from '@prisma/client'

const updateTaskSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').optional(),
  description: z.string().optional(),
  priority: z.nativeEnum(Priority).optional(),
  assignedTo: z.string().cuid().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
})

// PUT /api/tasks/[id] - Atualizar tarefa
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireTenant()
    const { id: taskId } = await params
    const body = await request.json()
    const validatedData = updateTaskSchema.parse(body)

    // Verificar se a tarefa existe e pertence à agência
    const existingTask = await db.task.findFirst({
      where: {
        id: taskId,
        project: {
          agencyId: context.agencyId,
        },
      },
    })

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Tarefa não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se o usuário assignado pertence à agência (se fornecido)
    if (validatedData.assignedTo) {
      const assignee = await db.user.findFirst({
        where: {
          id: validatedData.assignedTo,
          agencyId: context.agencyId,
        },
      })

      if (!assignee) {
        return NextResponse.json(
          { error: 'Usuário não encontrado na agência' },
          { status: 404 }
        )
      }
    }

    const task = await db.task.update({
      where: { id: taskId },
      data: {
        ...validatedData,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao atualizar tarefa:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: error instanceof Error && error.message.includes('Acesso negado') ? 403 : 500 }
    )
  }
}

// DELETE /api/tasks/[id] - Deletar tarefa
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireTenant()
    const { id: taskId } = await params

    // Verificar se a tarefa existe e pertence à agência
    const existingTask = await db.task.findFirst({
      where: {
        id: taskId,
        project: {
          agencyId: context.agencyId,
        },
      },
    })

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Tarefa não encontrada' },
        { status: 404 }
      )
    }

    // Deletar a tarefa
    await db.task.delete({
      where: { id: taskId },
    })

    // Atualizar posições das tarefas restantes no board
    await db.task.updateMany({
      where: {
        boardId: existingTask.boardId,
        position: {
          gt: existingTask.position,
        },
      },
      data: {
        position: {
          decrement: 1,
        },
      },
    })

    return NextResponse.json({
      message: 'Tarefa deletada com sucesso',
    })
  } catch (error) {
    console.error('Erro ao deletar tarefa:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: error instanceof Error && error.message.includes('Acesso negado') ? 403 : 500 }
    )
  }
}
