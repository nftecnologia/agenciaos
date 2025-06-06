import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireTenant } from '@/lib/tenant'
import { Priority } from '@prisma/client'

const createTaskSchema = z.object({
  projectId: z.string().cuid(),
  boardId: z.string().cuid(),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  assignedTo: z.string().cuid().optional(),
  dueDate: z.string().datetime().optional(),
})

const moveTaskSchema = z.object({
  taskId: z.string().cuid(),
  boardId: z.string().cuid(),
  position: z.number().int().min(0),
})

// POST /api/tasks - Criar nova tarefa
export async function POST(request: NextRequest) {
  try {
    const context = await requireTenant()
    const body = await request.json()
    const validatedData = createTaskSchema.parse(body)

    // Verificar se o projeto pertence à agência
    const project = await db.project.findFirst({
      where: {
        id: validatedData.projectId,
        agencyId: context.agencyId,
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o board pertence ao projeto
    const board = await db.board.findFirst({
      where: {
        id: validatedData.boardId,
        projectId: validatedData.projectId,
      },
    })

    if (!board) {
      return NextResponse.json(
        { error: 'Board não encontrado' },
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

    // Obter próxima posição no board
    const lastTask = await db.task.findFirst({
      where: {
        boardId: validatedData.boardId,
      },
      orderBy: {
        position: 'desc',
      },
    })

    const position = lastTask ? lastTask.position + 1 : 0

    const task = await db.task.create({
      data: {
        ...validatedData,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        position,
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

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao criar tarefa:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: error instanceof Error && error.message.includes('Acesso negado') ? 403 : 500 }
    )
  }
}

// PATCH /api/tasks - Mover tarefa (drag & drop)
export async function PATCH(request: NextRequest) {
  try {
    const context = await requireTenant()
    const body = await request.json()
    const validatedData = moveTaskSchema.parse(body)

    // Verificar se a tarefa existe e pertence à agência
    const existingTask = await db.task.findFirst({
      where: {
        id: validatedData.taskId,
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

    // Verificar se o board de destino existe e pertence ao mesmo projeto
    const targetBoard = await db.board.findFirst({
      where: {
        id: validatedData.boardId,
        projectId: existingTask.projectId,
      },
    })

    if (!targetBoard) {
      return NextResponse.json(
        { error: 'Board de destino não encontrado' },
        { status: 404 }
      )
    }

    // Atualizar posições das outras tarefas se necessário
    if (existingTask.boardId === validatedData.boardId) {
      // Movendo dentro do mesmo board
      if (validatedData.position > existingTask.position) {
        // Movendo para baixo
        await db.task.updateMany({
          where: {
            boardId: validatedData.boardId,
            position: {
              gt: existingTask.position,
              lte: validatedData.position,
            },
          },
          data: {
            position: {
              decrement: 1,
            },
          },
        })
      } else {
        // Movendo para cima
        await db.task.updateMany({
          where: {
            boardId: validatedData.boardId,
            position: {
              gte: validatedData.position,
              lt: existingTask.position,
            },
          },
          data: {
            position: {
              increment: 1,
            },
          },
        })
      }
    } else {
      // Movendo para board diferente
      // Decrementar posições no board original
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

      // Incrementar posições no board de destino
      await db.task.updateMany({
        where: {
          boardId: validatedData.boardId,
          position: {
            gte: validatedData.position,
          },
        },
        data: {
          position: {
            increment: 1,
          },
        },
      })
    }

    // Atualizar a tarefa
    const task = await db.task.update({
      where: { id: validatedData.taskId },
      data: {
        boardId: validatedData.boardId,
        position: validatedData.position,
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

    console.error('Erro ao mover tarefa:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: error instanceof Error && error.message.includes('Acesso negado') ? 403 : 500 }
    )
  }
}
