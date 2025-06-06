import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { Role, Plan } from '@prisma/client'
import { withValidation, createSuccessResponse, createErrorResponse } from '@/lib/api-validation'
import { registerSchema, type RegisterInput } from '@/lib/validations'
import { applyRateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'

export const POST = withValidation<RegisterInput>(
  async (request, { body }) => {
    try {
      // Aplicar rate limiting para autenticação
      const rateLimitResult = await applyRateLimit(request, 'auth')
      if (!rateLimitResult.success && rateLimitResult.error) {
        throw rateLimitResult.error
      }

      if (!body) {
        return createErrorResponse('Dados de entrada são obrigatórios', 400)
      }

      const { name, email, password, agencyName } = body

      // Verificar se o email já existe
      const existingUser = await db.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        return createErrorResponse('Este email já está em uso', 400)
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 12)

      // Criar slug da agência baseado no nome
      const agencySlug = agencyName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50)

      // Verificar se o slug já existe e adicionar número se necessário
      let finalSlug = agencySlug
      let counter = 1
      while (await db.agency.findUnique({ where: { slug: finalSlug } })) {
        finalSlug = `${agencySlug}-${counter}`
        counter++
      }

      // Criar usuário e agência em uma transação
      const result = await db.$transaction(async (tx) => {
        // Criar usuário
        const user = await tx.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            role: Role.OWNER,
            emailVerified: new Date(),
          },
        })

        // Criar agência
        const agency = await tx.agency.create({
          data: {
            name: agencyName,
            slug: finalSlug,
            ownerId: user.id,
            plan: Plan.FREE,
          },
        })

        // Atualizar usuário com agencyId
        await tx.user.update({
          where: { id: user.id },
          data: { agencyId: agency.id },
        })

        return { user, agency }
      })

      return createSuccessResponse(
        {
          user: {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            role: result.user.role,
          },
          agency: {
            id: result.agency.id,
            name: result.agency.name,
            slug: result.agency.slug,
          },
        },
        201,
        'Conta criada com sucesso'
      )
    } catch (error) {
      console.error('Erro ao criar conta:', error)
      return createErrorResponse('Erro interno do servidor', 500)
    }
  },
  {
    bodySchema: registerSchema
  }
)
