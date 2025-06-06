import { NextRequest, NextResponse } from 'next/server'
import { requireTenant } from '@/lib/tenant'
import { db } from '@/lib/db'
import { z } from 'zod'

export const runtime = 'nodejs'

// Schema de validação para criação de projeto
const createProjectSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  clientId: z.string().min(1, 'Cliente é obrigatório'),
  status: z.enum(['PLANNING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'CANCELLED']).default('PLANNING'),
  budget: z.number().positive('Orçamento deve ser positivo').optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

// GET /api/projects - Listar projetos
export async function GET(request: NextRequest) {
  try {
    const context = await requireTenant()
    const { searchParams } = new URL(request.url)
    
    // Parâmetros de busca e paginação
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const clientId = searchParams.get('clientId') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Construir filtros de busca
    const where = {
      agencyId: context.agencyId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
          { client: { name: { contains: search, mode: 'insensitive' as const } } },
        ],
      }),
      ...(status && { status: status as 'PLANNING' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED' | 'CANCELLED' }),
      ...(clientId && { clientId }),
    }

    // Buscar projetos com contagem total
    const [projects, total] = await Promise.all([
      db.project.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              company: true,
            },
          },
          _count: {
            select: {
              tasks: true,
              boards: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      db.project.count({ where }),
    ])

    // Calcular metadados de paginação
    const totalPages = Math.ceil(total / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    return NextResponse.json({
      projects,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    })
  } catch (error) {
    console.error('Erro ao buscar projetos:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: error instanceof Error && error.message.includes('Acesso negado') ? 403 : 500 }
    )
  }
}

// POST /api/projects - Criar projeto
export async function POST(request: NextRequest) {
  try {
    const context = await requireTenant()
    const body = await request.json()

    // Validar dados de entrada
    const validationResult = createProjectSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: validationResult.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      )
    }

    const { name, description, clientId, status, budget, startDate, endDate } = validationResult.data

    // Verificar se cliente existe e pertence à agência
    const client = await db.client.findFirst({
      where: {
        id: clientId,
        agencyId: context.agencyId,
      },
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Cliente não encontrado ou não pertence à sua agência' },
        { status: 404 }
      )
    }

    // Validar datas se fornecidas
    let parsedStartDate: Date | undefined
    let parsedEndDate: Date | undefined

    if (startDate) {
      parsedStartDate = new Date(startDate)
      if (isNaN(parsedStartDate.getTime())) {
        return NextResponse.json(
          { error: 'Data de início inválida' },
          { status: 400 }
        )
      }
    }

    if (endDate) {
      parsedEndDate = new Date(endDate)
      if (isNaN(parsedEndDate.getTime())) {
        return NextResponse.json(
          { error: 'Data de fim inválida' },
          { status: 400 }
        )
      }
    }

    // Validar se data de fim é posterior à data de início
    if (parsedStartDate && parsedEndDate && parsedEndDate <= parsedStartDate) {
      return NextResponse.json(
        { error: 'Data de fim deve ser posterior à data de início' },
        { status: 400 }
      )
    }

    // Criar projeto
    const project = await db.project.create({
      data: {
        name,
        description,
        clientId,
        status,
        budget: budget ? budget : null,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        agencyId: context.agencyId,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            boards: true,
          },
        },
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar projeto:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 