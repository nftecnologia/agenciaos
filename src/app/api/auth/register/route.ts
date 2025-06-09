import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { Role, Plan } from '@prisma/client'
import { registerSchema } from '@/lib/validations'
import { applyRateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Aplicar rate limiting para autenticação
    const rateLimitResult = await applyRateLimit(request, 'auth')
    if (!rateLimitResult.success && rateLimitResult.error) {
      return NextResponse.json(
        { error: rateLimitResult.error.message },
        { status: 429 }
      )
    }

    const body = await request.json()
    
    // Validar dados de entrada
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const { name, email, password, agencyName } = validationResult.data

    console.log("📧 Tentativa de registro no banco Neon:", email)

    // Verificar se o email já existe
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      console.log("❌ Email já existe:", email)
      return NextResponse.json(
        { error: 'Este email já está em uso' },
        { status: 400 }
      )
    }

    // Hash da senha
    console.log("🔑 Gerando hash da senha...")
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

    console.log("🏢 Criando agência com slug:", finalSlug)

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

      console.log("👤 Usuário criado:", user.id)

      // Criar agência
      const agency = await tx.agency.create({
        data: {
          name: agencyName,
          slug: finalSlug,
          ownerId: user.id,
          plan: Plan.FREE,
        },
      })

      console.log("🏢 Agência criada:", agency.id)

      // Atualizar usuário com agencyId
      await tx.user.update({
        where: { id: user.id },
        data: { agencyId: agency.id },
      })

      console.log("🔗 Usuário vinculado à agência")

      return { user, agency }
    })

    console.log("✅ Conta criada com sucesso no banco Neon:", email)

    return NextResponse.json(
      {
        message: 'Conta criada com sucesso',
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
      { status: 201 }
    )
  } catch (error) {
    console.error('❌ Erro ao criar conta no banco Neon:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
