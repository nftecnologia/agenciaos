import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireTenant } from '@/lib/tenant'

// Schema de validação para criação de receita
const createRevenueSchema = z.object({
  description: z.string().min(2, 'Descrição deve ter pelo menos 2 caracteres'),
  amount: z.number().positive('Valor deve ser positivo'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
  isRecurring: z.boolean().default(false),
  date: z.string().min(1, 'Data é obrigatória'),
})

// GET /api/revenues - Listar receitas
export async function GET(request: NextRequest) {
  try {
    const context = await requireTenant()
    const { searchParams } = new URL(request.url)
    
    // Parâmetros de busca e paginação
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const clientId = searchParams.get('clientId') || ''
    const projectId = searchParams.get('projectId') || ''
    const isRecurring = searchParams.get('isRecurring')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Construir filtros de busca
    const where = {
      agencyId: context.agencyId,
      ...(search && {
        OR: [
          { description: { contains: search, mode: 'insensitive' as const } },
          { category: { contains: search, mode: 'insensitive' as const } },
          { client: { name: { contains: search, mode: 'insensitive' as const } } },
          { project: { name: { contains: search, mode: 'insensitive' as const } } },
        ],
      }),
      ...(category && { category: { contains: category, mode: 'insensitive' as const } }),
      ...(clientId && { clientId }),
      ...(projectId && { projectId }),
      ...(isRecurring !== null && { isRecurring: isRecurring === 'true' }),
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
    const context = await requireTenant()
    const body = await request.json()

    // Validar dados de entrada
    const validationResult = createRevenueSchema.safeParse(body)
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

    const { description, amount, category, clientId, projectId, isRecurring, date } = validationResult.data

    // Validar data
    const parsedDate = new Date(date)
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: 'Data inválida' },
        { status: 400 }
      )
    }

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
          { error: 'Cliente não encontrado ou não pertence à sua agência' },
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
          { error: 'Projeto não encontrado ou não pertence à sua agência' },
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
        clientId: clientId || null,
        projectId: projectId || null,
        isRecurring,
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

    return NextResponse.json(revenue, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar receita:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 