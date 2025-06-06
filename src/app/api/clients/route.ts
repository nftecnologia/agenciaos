import { NextRequest, NextResponse } from 'next/server'
import { requireTenant } from '@/lib/tenant'
import { db } from '@/lib/db'
import { z } from 'zod'

export const runtime = 'nodejs'

// Schema de validação para criação de cliente
const createClientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
})

// Schema de validação para atualização de cliente (usado em outros arquivos)
// const updateClientSchema = createClientSchema.partial()

// GET /api/clients - Listar clientes
export async function GET(request: NextRequest) {
  try {
    const context = await requireTenant()
    const { searchParams } = new URL(request.url)
    
    // Parâmetros de busca e paginação
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
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

    return NextResponse.json({
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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: error instanceof Error && error.message.includes('Acesso negado') ? 403 : 500 }
    )
  }
}

// POST /api/clients - Criar cliente
export async function POST(request: NextRequest) {
  try {
    const context = await requireTenant()
    const body = await request.json()

    // Validar dados de entrada
    const validationResult = createClientSchema.safeParse(body)
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

    const { name, email, phone, company } = validationResult.data

    // Verificar se já existe cliente com mesmo email na agência
    if (email) {
      const existingClient = await db.client.findFirst({
        where: {
          agencyId: context.agencyId,
          email,
        },
      })

      if (existingClient) {
        return NextResponse.json(
          { error: 'Já existe um cliente com este email' },
          { status: 409 }
        )
      }
    }

    // Criar cliente
    const client = await db.client.create({
      data: {
        name,
        email,
        phone,
        company,
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

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar cliente:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 