import { NextRequest, NextResponse } from 'next/server'
import { requireTenant } from '@/lib/tenant'
import { db } from '@/lib/db'
import { createRevenueSchema, revenuesQuerySchema } from '@/lib/validations'
import { applyRateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'

// GET /api/revenues - Listar receitas
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
      clientId: searchParams.get('clientId') || undefined,
      projectId: searchParams.get('projectId') || undefined,
      category: searchParams.get('category') || undefined,
      isRecurring: searchParams.get('isRecurring') === 'true' ? true : searchParams.get('isRecurring') === 'false' ? false : undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
    }

    // Validar query parameters
    const validationResult = revenuesQuerySchema.safeParse(queryData)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Parâmetros inválidos', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const { clientId, projectId, category, isRecurring, startDate, endDate, page, limit } = validationResult.data
    const offset = (page - 1) * limit

    // Construir filtros de busca
    const where = {
      agencyId: context.agencyId,
      ...(category && { category: { contains: category, mode: 'insensitive' as const } }),
      ...(clientId && { clientId }),
      ...(projectId && { projectId }),
      ...(isRecurring !== undefined && { isRecurring }),
      ...(startDate && endDate && {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      }),
    }

    // Buscar receitas com paginação
    const [revenues, total] = await Promise.all([
      db.revenue.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              company: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { date: 'desc' },
        skip: offset,
        take: limit,
      }),
      db.revenue.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      revenues,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error('Erro ao buscar receitas:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: error instanceof Error && error.message.includes('Acesso negado') ? 403 : 500 }
    )
  }
}

// POST /api/revenues - Criar receita
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
    const validationResult = createRevenueSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const { description, amount, category, clientId, projectId, isRecurring, date } = validationResult.data

    // Validar data
    const parsedDate = new Date(date)

    // Verificar se cliente existe e pertence à agência (se fornecido)
    if (clientId) {
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
    }

    // Verificar se projeto existe e pertence à agência (se fornecido)
    if (projectId) {
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
    }

    // Criar receita
    const revenue = await db.revenue.create({
      data: {
        agencyId: context.agencyId,
        description,
        amount,
        category,
        clientId: clientId || undefined,
        projectId: projectId || undefined,
        isRecurring: isRecurring || false,
        date: parsedDate,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        message: 'Receita criada com sucesso',
        revenue,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar receita:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: error instanceof Error && error.message.includes('Acesso negado') ? 403 : 500 }
    )
  }
}
