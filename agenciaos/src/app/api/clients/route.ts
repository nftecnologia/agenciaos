import { NextRequest, NextResponse } from 'next/server'
import { requireTenant } from '@/lib/tenant'
import { db } from '@/lib/db'
import { createClientSchema, clientsQuerySchema } from '@/lib/validations'
import { applyRateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'

// GET /api/clients - Listar clientes
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
      search: searchParams.get('search') || '',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
    }

    // Validar query parameters
    const validationResult = clientsQuerySchema.safeParse(queryData)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Parâmetros inválidos', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const { search, page, limit } = validationResult.data
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
    const validationResult = createClientSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const { name, email, phone, company, address } = validationResult.data

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
          { error: 'Este email já está em uso' },
          { status: 400 }
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

    return NextResponse.json(
      {
        message: 'Cliente criado com sucesso',
        client,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar cliente:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: error instanceof Error && error.message.includes('Acesso negado') ? 403 : 500 }
    )
  }
}
