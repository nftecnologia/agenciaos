import { requireTenant } from '@/lib/tenant'
import { db } from '@/lib/db'
import { withValidation, createSuccessResponse } from '@/lib/api-validation'
import { createClientSchema, clientsQuerySchema, type CreateClientInput, type ClientsQuery } from '@/lib/validations'
import { applyRateLimit } from '@/lib/rate-limit'
import { appErrors } from '@/lib/errors'

export const runtime = 'nodejs'

// GET /api/clients - Listar clientes
export const GET = withValidation<never, ClientsQuery>(
  async (request, { query }) => {
    try {
      // Aplicar rate limiting
      const rateLimitResult = await applyRateLimit(request, 'api')
      if (!rateLimitResult.success && rateLimitResult.error) {
        throw rateLimitResult.error
      }

      const context = await requireTenant()
      
      // Usar query validada ou valores padrão
      const { search = '', page = 1, limit = 10 } = query || {}
      const offset = (page - 1) * limit

      // Construir filtros de busca
      const where = {
        agencyId: context.agencyId,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { company: { contains: search, mode: 'insensitive' as const } },
          ],
        }),
      }

      // Buscar clientes com contagem total
      const [clients, total] = await Promise.all([
        db.client.findMany({
          where,
          include: {
            projects: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
            _count: {
              select: {
                projects: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit,
        }),
        db.client.count({ where }),
      ])

      // Calcular metadados de paginação
      const totalPages = Math.ceil(total / limit)
      const hasNext = page < totalPages
      const hasPrev = page > 1

      return createSuccessResponse({
        clients,
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
      console.error('Erro ao buscar clientes:', error)
      throw error
    }
  },
  {
    querySchema: clientsQuerySchema
  }
)

// POST /api/clients - Criar cliente
export const POST = withValidation<CreateClientInput>(
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

      const { name, email, phone, company, address } = body

      // Verificar se já existe cliente com mesmo email na agência
      if (email) {
        const existingClient = await db.client.findFirst({
          where: {
            agencyId: context.agencyId,
            email,
          },
        })

        if (existingClient) {
          throw appErrors.EMAIL_ALREADY_EXISTS
        }
      }

      // Criar cliente
      const client = await db.client.create({
        data: {
          name,
          email,
          phone,
          company,
          address: address ? JSON.stringify(address) : undefined,
          agencyId: context.agencyId,
        },
        include: {
          projects: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
          _count: {
            select: {
              projects: true,
            },
          },
        },
      })

      return createSuccessResponse(client, 201, 'Cliente criado com sucesso')
    } catch (error) {
      console.error('Erro ao criar cliente:', error)
      throw error
    }
  },
  {
    bodySchema: createClientSchema
  }
)
