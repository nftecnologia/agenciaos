import { NextRequest, NextResponse } from 'next/server'
import { requireTenant } from '@/lib/tenant'
import { db } from '@/lib/db'
import { createProjectSchema, projectsQuerySchema } from '@/lib/validations'
import { applyRateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'

// GET /api/projects - Listar projetos
export async function GET(request: NextRequest) {
  try {
    // Aplicar rate limiting
    const rateLimitResult = await applyRateLimit(request, 'api')
    if (!rateLimitResult.success && rateLimitResult.error) {
      return NextResponse.json(
        { error: rateLimitResult.error.message },
        { status: 429 }
      )
    }

    const context = await requireTenant()
    
    // Extrair parâmetros de query
    const { searchParams } = new URL(request.url)
    const queryData = {
      status: searchParams.get('status') || undefined,
      clientId: searchParams.get('clientId') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
    }

    // Validar query parameters
    const validationResult = projectsQuerySchema.safeParse(queryData)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Parâmetros inválidos', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const { status, clientId, page, limit } = validationResult.data
    const offset = (page - 1) * limit

    // Construir filtros de busca
    const where = {
      agencyId: context.agencyId,
      ...(status && { status }),
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
    // Aplicar rate limiting
    const rateLimitResult = await applyRateLimit(request, 'api')
    if (!rateLimitResult.success && rateLimitResult.error) {
      return NextResponse.json(
        { error: rateLimitResult.error.message },
        { status: 429 }
      )
    }

    const context = await requireTenant()
    const body = await request.json()

    // Validar dados de entrada
    const validationResult = createProjectSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const { name, description, clientId, budget, startDate, endDate } = validationResult.data

    // Verificar se cliente existe e pertence à agência
    const client = await db.client.findFirst({
      where: {
        id: clientId,
        agencyId: context.agencyId,
      },
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    // Converter datas se fornecidas
    let parsedStartDate: Date | undefined
    let parsedEndDate: Date | undefined

    if (startDate) {
      parsedStartDate = new Date(startDate)
    }

    if (endDate) {
      parsedEndDate = new Date(endDate)
    }

    // Criar projeto
    const project = await db.project.create({
      data: {
        name,
        description,
        clientId,
        budget: budget || undefined,
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

    return NextResponse.json(
      {
        message: 'Projeto criado com sucesso',
        project,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar projeto:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: error instanceof Error && error.message.includes('Acesso negado') ? 403 : 500 }
    )
  }
}
