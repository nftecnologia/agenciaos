import { requireTenant } from '@/lib/tenant'
import { db } from '@/lib/db'
import { withValidation, createSuccessResponse } from '@/lib/api-validation'
import { createProjectSchema, projectsQuerySchema, type CreateProjectInput, type ProjectsQuery } from '@/lib/validations'
import { applyRateLimit } from '@/lib/rate-limit'
import { appErrors } from '@/lib/errors'

export const runtime = 'nodejs'

// GET /api/projects - Listar projetos
export const GET = withValidation<never, ProjectsQuery>(
  async (request, { query }) => {
    try {
      // Aplicar rate limiting
      const rateLimitResult = await applyRateLimit(request, 'api')
      if (!rateLimitResult.success && rateLimitResult.error) {
        throw rateLimitResult.error
      }

      const context = await requireTenant()
      
      // Usar query validada ou valores padrão
      const { status, clientId, page = 1, limit = 10 } = query || {}
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

      return createSuccessResponse({
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
      throw error
    }
  },
  {
    querySchema: projectsQuerySchema
  }
)

// POST /api/projects - Criar projeto
export const POST = withValidation<CreateProjectInput>(
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

      const { name, description, clientId, budget, startDate, endDate } = body

      // Verificar se cliente existe e pertence à agência
      const client = await db.client.findFirst({
        where: {
          id: clientId,
          agencyId: context.agencyId,
        },
      })

      if (!client) {
        throw appErrors.CLIENT_NOT_FOUND
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

      return createSuccessResponse(project, 201, 'Projeto criado com sucesso')
    } catch (error) {
      console.error('Erro ao criar projeto:', error)
      throw error
    }
  },
  {
    bodySchema: createProjectSchema
  }
)
