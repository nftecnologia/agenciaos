import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireTenant } from '@/lib/tenant'

// Schema de validação para criação de despesa
const createExpenseSchema = z.object({
  description: z.string().min(2, 'Descrição deve ter pelo menos 2 caracteres'),
  amount: z.number().positive('Valor deve ser positivo'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  date: z.string().min(1, 'Data é obrigatória'),
})

// GET /api/expenses - Listar despesas
export async function GET(request: NextRequest) {
  try {
    const context = await requireTenant()
    const { searchParams } = new URL(request.url)
    
    // Parâmetros de busca e paginação
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
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
        ],
      }),
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
    const context = await requireTenant()
    const body = await request.json()

    // Validar dados de entrada
    const validationResult = createExpenseSchema.safeParse(body)
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

    const { description, amount, category, date } = validationResult.data

    // Validar data
    const parsedDate = new Date(date)
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: 'Data inválida' },
        { status: 400 }
      )
    }

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

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar despesa:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 