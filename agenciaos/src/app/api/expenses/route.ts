import { NextRequest, NextResponse } from 'next/server'
import { requireTenant } from '@/lib/tenant'
import { db } from '@/lib/db'
import { createExpenseSchema, expensesQuerySchema } from '@/lib/validations'
import { applyRateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'

// GET /api/expenses - Listar despesas
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
      category: searchParams.get('category') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
    }

    // Validar query parameters
    const validationResult = expensesQuerySchema.safeParse(queryData)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Parâmetros inválidos', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const { category, startDate, endDate, page, limit } = validationResult.data
    const offset = (page - 1) * limit

    // Construir filtros de busca
    const where = {
      agencyId: context.agencyId,
      ...(category && { category: { contains: category, mode: 'insensitive' as const } }),
      ...(startDate && endDate && {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      }),
    }

    // Buscar despesas com paginação
    const [expenses, total] = await Promise.all([
      db.expense.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: offset,
        take: limit,
      }),
      db.expense.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      expenses,
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
    console.error('Erro ao buscar despesas:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: error instanceof Error && error.message.includes('Acesso negado') ? 403 : 500 }
    )
  }
}

// POST /api/expenses - Criar despesa
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
    const validationResult = createExpenseSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const { description, amount, category, date } = validationResult.data

    // Validar data
    const parsedDate = new Date(date)

    // Criar despesa
    const expense = await db.expense.create({
      data: {
        agencyId: context.agencyId,
        description,
        amount,
        category,
        date: parsedDate,
      },
    })

    return NextResponse.json(
      {
        message: 'Despesa criada com sucesso',
        expense,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar despesa:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: error instanceof Error && error.message.includes('Acesso negado') ? 403 : 500 }
    )
  }
}
