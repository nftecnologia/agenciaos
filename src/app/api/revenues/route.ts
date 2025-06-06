import { requireTenant } from '@/lib/tenant'
import { db } from '@/lib/db'
import { withValidation, createSuccessResponse } from '@/lib/api-validation'
import { createRevenueSchema, revenuesQuerySchema, type CreateRevenueInput, type RevenuesQuery } from '@/lib/validations'
import { applyRateLimit } from '@/lib/rate-limit'
import { appErrors } from '@/lib/errors'

export const runtime = 'nodejs'

// GET /api/revenues - Listar receitas
export const GET = withValidation<never, RevenuesQuery>(
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
        clientId, 
        projectId, 
        category, 
        isRecurring, 
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

      return createSuccessResponse({
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
      throw error
    }
  },
  {
    querySchema: revenuesQuerySchema
  }
)

// POST /api/revenues - Criar receita
export const POST = withValidation<CreateRevenueInput>(
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

      const { description, amount, category, clientId, projectId, isRecurring, date } = body

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
          throw appErrors.CLIENT_NOT_FOUND
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
          throw appErrors.PROJECT_NOT_FOUND
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

      return createSuccessResponse(revenue, 201, 'Receita criada com sucesso')
    } catch (error) {
      console.error('Erro ao criar receita:', error)
      throw error
    }
  },
  {
    bodySchema: createRevenueSchema
  }
)
