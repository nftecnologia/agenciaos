import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { Role, Plan } from '@/generated/prisma'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, agencyName } = await request.json()

    // Validações
    if (!name || !email || !password || !agencyName) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Verificar se o email já existe
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email já está em uso' },
        { status: 400 }
      )
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
    console.error('Erro ao criar conta:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 