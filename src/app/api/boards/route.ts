import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireTenant } from '@/lib/tenant'

const createBoardSchema = z.object({
  projectId: z.string().cuid(),
  name: z.string().min(1, 'Nome é obrigatório'),
  color: z.string().optional(),
})

// GET /api/boards - Listar boards por projeto
export async function GET(request: NextRequest) {
  try {
    const context = await requireTenant()
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o projeto pertence à agência
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        agencyId: context.agencyId,
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      )
    }

    const boards = await db.board.findMany({
      where: {
        projectId,
      },
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
      orderBy: {
        position: 'asc',
      },
    })

    return NextResponse.json(boards)
  } catch (error) {
    console.error('Erro ao buscar boards:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: error instanceof Error && error.message.includes('Acesso negado') ? 403 : 500 }
    )
  }
}

// POST /api/boards - Criar novo board
export async function POST(request: NextRequest) {
  try {
    const context = await requireTenant()
    const body = await request.json()
    const validatedData = createBoardSchema.parse(body)

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

    // Obter próxima posição
    const lastBoard = await db.board.findFirst({
      where: {
        projectId: validatedData.projectId,
      },
      orderBy: {
        position: 'desc',
      },
    })

    const position = lastBoard ? lastBoard.position + 1 : 0

    const board = await db.board.create({
      data: {
        ...validatedData,
        position,
      },
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

    return NextResponse.json(board, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao criar board:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: error instanceof Error && error.message.includes('Acesso negado') ? 403 : 500 }
    )
  }
} 