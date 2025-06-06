import { NextRequest, NextResponse } from 'next/server'
import { requireTenant } from '@/lib/tenant'
import { db } from '@/lib/db'
import { z } from 'zod'

export const runtime = 'nodejs'

// Schema de validação para atualização de cliente
const updateClientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
})

// GET /api/clients/[id] - Buscar cliente específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireTenant()
    const { id } = await params

    const client = await db.client.findFirst({
      where: {
        id,
        agencyId: context.agencyId,
      },
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { updatedAt: 'desc' },
        },
        _count: {
          select: {
            projects: true,
          },
        },
      },
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error('Erro ao buscar cliente:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: error instanceof Error && error.message.includes('Acesso negado') ? 403 : 500 }
    )
  }
}

// PUT /api/clients/[id] - Atualizar cliente
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireTenant()
    const { id } = await params
    const body = await request.json()

    // Validar dados de entrada
    const validationResult = updateClientSchema.safeParse(body)
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

    // Verificar se cliente existe e pertence à agência
    const existingClient = await db.client.findFirst({
      where: {
        id,
        agencyId: context.agencyId,
      },
    })

    if (!existingClient) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    const { email } = validationResult.data

    // Verificar se email já está em uso por outro cliente
    if (email && email !== existingClient.email) {
      const emailInUse = await db.client.findFirst({
        where: {
          agencyId: context.agencyId,
          email,
          id: { not: id },
        },
      })

      if (emailInUse) {
        return NextResponse.json(
          { error: 'Já existe um cliente com este email' },
          { status: 409 }
        )
      }
    }

    // Atualizar cliente
    const updatedClient = await db.client.update({
      where: { id },
      data: validationResult.data,
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { updatedAt: 'desc' },
        },
        _count: {
          select: {
            projects: true,
          },
        },
      },
    })

    return NextResponse.json(updatedClient)
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/clients/[id] - Deletar cliente
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireTenant()
    const { id } = await params

    // Verificar se cliente existe e pertence à agência
    const existingClient = await db.client.findFirst({
      where: {
        id,
        agencyId: context.agencyId,
      },
      include: {
        _count: {
          select: {
            projects: true,
          },
        },
      },
    })

    if (!existingClient) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se cliente tem projetos associados
    if (existingClient._count.projects > 0) {
      return NextResponse.json(
        { 
          error: 'Não é possível deletar cliente com projetos associados',
          details: `Este cliente possui ${existingClient._count.projects} projeto(s). Remova ou transfira os projetos antes de deletar o cliente.`,
        },
        { status: 409 }
      )
    }

    // Deletar cliente
    await db.client.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Cliente deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar cliente:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 