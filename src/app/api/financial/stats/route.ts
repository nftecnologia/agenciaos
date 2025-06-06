import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireTenant } from '@/lib/tenant'

// GET /api/financial/stats - Estatísticas financeiras
export async function GET() {
  try {
    const context = await requireTenant()

    // Data atual e mês anterior
    const now = new Date()
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    // Buscar dados em paralelo
    const [
      totalRevenue,
      totalExpenses,
      monthlyRevenue,
      monthlyExpenses,
      lastMonthRevenue,
      lastMonthExpenses,
      recurringRevenue,
      revenueCategories,
      expenseCategories,
    ] = await Promise.all([
      // Receita total
      db.revenue.aggregate({
        where: { agencyId: context.agencyId },
        _sum: { amount: true },
      }),

      // Despesas totais
      db.expense.aggregate({
        where: { agencyId: context.agencyId },
        _sum: { amount: true },
      }),

      // Receita do mês atual
      db.revenue.aggregate({
        where: {
          agencyId: context.agencyId,
          date: {
            gte: currentMonth,
            lt: nextMonth,
          },
        },
        _sum: { amount: true },
      }),

      // Despesas do mês atual
      db.expense.aggregate({
        where: {
          agencyId: context.agencyId,
          date: {
            gte: currentMonth,
            lt: nextMonth,
          },
        },
        _sum: { amount: true },
      }),

      // Receita do mês anterior
      db.revenue.aggregate({
        where: {
          agencyId: context.agencyId,
          date: {
            gte: lastMonth,
            lt: currentMonth,
          },
        },
        _sum: { amount: true },
      }),

      // Despesas do mês anterior
      db.expense.aggregate({
        where: {
          agencyId: context.agencyId,
          date: {
            gte: lastMonth,
            lt: currentMonth,
          },
        },
        _sum: { amount: true },
      }),

      // Receita recorrente
      db.revenue.aggregate({
        where: {
          agencyId: context.agencyId,
          isRecurring: true,
        },
        _sum: { amount: true },
      }),

      // Top categorias de receita
      db.revenue.groupBy({
        by: ['category'],
        where: { agencyId: context.agencyId },
        _sum: { amount: true },
        _count: { id: true },
        orderBy: { _sum: { amount: 'desc' } },
        take: 5,
      }),

      // Top categorias de despesa
      db.expense.groupBy({
        by: ['category'],
        where: { agencyId: context.agencyId },
        _sum: { amount: true },
        _count: { id: true },
        orderBy: { _sum: { amount: 'desc' } },
        take: 5,
      }),
    ])

    // Calcular valores
    const totalRevenueAmount = Number(totalRevenue._sum.amount || 0)
    const totalExpensesAmount = Number(totalExpenses._sum.amount || 0)
    const monthlyRevenueAmount = Number(monthlyRevenue._sum.amount || 0)
    const monthlyExpensesAmount = Number(monthlyExpenses._sum.amount || 0)
    const lastMonthRevenueAmount = Number(lastMonthRevenue._sum.amount || 0)
    const lastMonthExpensesAmount = Number(lastMonthExpenses._sum.amount || 0)
    const recurringRevenueAmount = Number(recurringRevenue._sum.amount || 0)

    // Calcular lucro
    const netProfit = totalRevenueAmount - totalExpensesAmount
    const monthlyProfit = monthlyRevenueAmount - monthlyExpensesAmount

    // Calcular crescimento
    const revenueGrowth = lastMonthRevenueAmount > 0 
      ? ((monthlyRevenueAmount - lastMonthRevenueAmount) / lastMonthRevenueAmount) * 100
      : 0

    const expenseGrowth = lastMonthExpensesAmount > 0 
      ? ((monthlyExpensesAmount - lastMonthExpensesAmount) / lastMonthExpensesAmount) * 100
      : 0

    // Calcular margem de lucro
    const profitMargin = totalRevenueAmount > 0 
      ? (netProfit / totalRevenueAmount) * 100
      : 0

    // Formatar categorias
    const topRevenueCategories = revenueCategories.map(cat => ({
      category: cat.category,
      amount: Number(cat._sum.amount || 0),
      count: cat._count.id,
    }))

    const topExpenseCategories = expenseCategories.map(cat => ({
      category: cat.category,
      amount: Number(cat._sum.amount || 0),
      count: cat._count.id,
    }))

    const stats = {
      totalRevenue: totalRevenueAmount,
      totalExpenses: totalExpensesAmount,
      netProfit,
      monthlyRevenue: monthlyRevenueAmount,
      monthlyExpenses: monthlyExpensesAmount,
      monthlyProfit,
      revenueGrowth: Math.round(revenueGrowth * 100) / 100,
      expenseGrowth: Math.round(expenseGrowth * 100) / 100,
      profitMargin: Math.round(profitMargin * 100) / 100,
      recurringRevenue: recurringRevenueAmount,
      topCategories: {
        revenue: topRevenueCategories,
        expense: topExpenseCategories,
      },
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Erro ao buscar estatísticas financeiras:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: error instanceof Error && error.message.includes('Acesso negado') ? 403 : 500 }
    )
  }
} 