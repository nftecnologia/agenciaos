import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireTenant } from '@/lib/tenant'

// Schema de validação para atualização de receita
const updateRevenueSchema = z.object({
  description: z.string().min(2, 'Descrição deve ter pelo menos 2 caracteres').optional(),
  amount: z.number().positive('Valor deve ser positivo').optional(),
  category: z.string().min(1, 'Categoria é obrigatória').optional(),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
  isRecurring: z.boolean().optional(),
  date: z.string().optional(),
})

// GET /api/revenues/[id] - Buscar receita específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireTenant()
    const { id } = await params

    const revenue = await db.revenue.findFirst({
      where: {
        id,
        agencyId: context.agencyId,
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

    if (!revenue) {
      return NextResponse.json(
        { error: 'Receita não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(revenue)
  } catch (error) {
    console.error('Erro ao buscar receita:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: error instanceof Error && error.message.includes('Acesso negado') ? 403 : 500 }
    )
  }
}

// PUT /api/revenues/[id] - Atualizar receita
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireTenant()
    const { id } = await params
    const body = await request.json()

    // Validar dados de entrada
    const validationResult = updateRevenueSchema.safeParse(body)
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

    // Verificar se receita existe e pertence à agência
    const existingRevenue = await db.revenue.findFirst({
      where: {
        id,
        agencyId: context.agencyId,
      },
    })

    if (!existingRevenue) {
      return NextResponse.json(
        { error: 'Receita não encontrada' },
        { status: 404 }
      )
    }

    const { description, amount, category, clientId, projectId, isRecurring, date } = validationResult.data

    // Validar data se fornecida
    let parsedDate: Date | undefined
    if (date) {
      parsedDate = new Date(date)
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          { error: 'Data inválida' },
          { status: 400 }
        )
      }
    }

    // Verificar se cliente existe e pertence à agência (se fornecido)
    if (clientId) {
      const client = await db.client.findFirst({
        where: {
          id: clientId,
          agencyId: context.agencyId,
        },
      })

      if (!client) {
        return NextResponse.json(
          { error: 'Cliente não encontrado ou não pertence à sua agência' },
          { status: 404 }
        )
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
        return NextResponse.json(
          { error: 'Projeto não encontrado ou não pertence à sua agência' },
          { status: 404 }
        )
      }
    }

    // Atualizar receita
    const revenue = await db.revenue.update({
      where: { id },
      data: {
        ...(description !== undefined && { description }),
        ...(amount !== undefined && { amount }),
        ...(category !== undefined && { category }),
        ...(clientId !== undefined && { clientId: clientId || null }),
        ...(projectId !== undefined && { projectId: projectId || null }),
        ...(isRecurring !== undefined && { isRecurring }),
        ...(parsedDate && { date: parsedDate }),
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

    return NextResponse.json(revenue)
  } catch (error) {
    console.error('Erro ao atualizar receita:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/revenues/[id] - Deletar receita
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireTenant()
    const { id } = await params

    // Verificar se receita existe e pertence à agência
    const existingRevenue = await db.revenue.findFirst({
      where: {
        id,
        agencyId: context.agencyId,
      },
    })

    if (!existingRevenue) {
      return NextResponse.json(
        { error: 'Receita não encontrada' },
        { status: 404 }
      )
    }

    // Deletar receita
    await db.revenue.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Receita deletada com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar receita:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 