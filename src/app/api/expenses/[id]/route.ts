import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireTenant } from '@/lib/tenant'

// Schema de validação para atualização de despesa
const updateExpenseSchema = z.object({
  description: z.string().min(2, 'Descrição deve ter pelo menos 2 caracteres').optional(),
  amount: z.number().positive('Valor deve ser positivo').optional(),
  category: z.string().min(1, 'Categoria é obrigatória').optional(),
  date: z.string().optional(),
})

// GET /api/expenses/[id] - Buscar despesa específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireTenant()
    const { id } = await params

    const expense = await db.expense.findFirst({
      where: {
        id,
        agencyId: context.agencyId,
      },
    })

    if (!expense) {
      return NextResponse.json(
        { error: 'Despesa não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(expense)
  } catch (error) {
    console.error('Erro ao buscar despesa:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: error instanceof Error && error.message.includes('Acesso negado') ? 403 : 500 }
    )
  }
}

// PUT /api/expenses/[id] - Atualizar despesa
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireTenant()
    const { id } = await params
    const body = await request.json()

    // Validar dados de entrada
    const validationResult = updateExpenseSchema.safeParse(body)
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

    // Verificar se despesa existe e pertence à agência
    const existingExpense = await db.expense.findFirst({
      where: {
        id,
        agencyId: context.agencyId,
      },
    })

    if (!existingExpense) {
      return NextResponse.json(
        { error: 'Despesa não encontrada' },
        { status: 404 }
      )
    }

    const { description, amount, category, date } = validationResult.data

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

    // Atualizar despesa
    const expense = await db.expense.update({
      where: { id },
      data: {
        ...(description !== undefined && { description }),
        ...(amount !== undefined && { amount }),
        ...(category !== undefined && { category }),
        ...(parsedDate && { date: parsedDate }),
      },
    })

    return NextResponse.json(expense)
  } catch (error) {
    console.error('Erro ao atualizar despesa:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/expenses/[id] - Deletar despesa
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireTenant()
    const { id } = await params

    // Verificar se despesa existe e pertence à agência
    const existingExpense = await db.expense.findFirst({
      where: {
        id,
        agencyId: context.agencyId,
      },
    })

    if (!existingExpense) {
      return NextResponse.json(
        { error: 'Despesa não encontrada' },
        { status: 404 }
      )
    }

    // Deletar despesa
    await db.expense.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Despesa deletada com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar despesa:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 