import { requireTenant } from '@/lib/tenant'
import { db } from '@/lib/db'
import { withValidation, createSuccessResponse } from '@/lib/api-validation'
import { createExpenseSchema, expensesQuerySchema, type CreateExpenseInput, type ExpensesQuery } from '@/lib/validations'
import { applyRateLimit } from '@/lib/rate-limit'
import { appErrors } from '@/lib/errors'

export const runtime = 'nodejs'

// GET /api/expenses - Listar despesas
export const GET = withValidation<never, ExpensesQuery>(
  async (request, { query }) => {
    try {
      // Aplicar rate limiting
      const rateLimitResult = await applyRateLimit(request, 'api')
      if (!rateLimitResult.success && rateLimitResult.error) {
        throw rateLimitResult.error
      }

      const context = await requireTenant()
      
      // Usar query validada ou valores padrão
      const { 
        category, 
        startDate, 
        endDate, 
        page = 1, 
        limit = 10 
      } = query || {}
      
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

      return createSuccessResponse({
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
      throw error
    }
  },
  {
    querySchema: expensesQuerySchema
  }
)

// POST /api/expenses - Criar despesa
export const POST = withValidation<CreateExpenseInput>(
  async (request, { body }) => {
    try {
      // Aplicar rate limiting
      const rateLimitResult = await applyRateLimit(request, 'api')
      if (!rateLimitResult.success && rateLimitResult.error) {
        throw rateLimitResult.error
      }

      const context = await requireTenant()

      if (!body) {
        throw appErrors.INVALID_INPUT
      }

      const { description, amount, category, date } = body

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

      return createSuccessResponse(expense, 201, 'Despesa criada com sucesso')
    } catch (error) {
      console.error('Erro ao criar despesa:', error)
      throw error
    }
  },
  {
    bodySchema: createExpenseSchema
  }
)
