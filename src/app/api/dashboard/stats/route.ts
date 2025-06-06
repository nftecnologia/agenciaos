import { requireTenant } from '@/lib/tenant'
import { db } from '@/lib/db'
import { createSuccessResponse } from '@/lib/api-validation'
import { applyRateLimit } from '@/lib/rate-limit'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

// GET /api/dashboard/stats - Obter estatísticas do dashboard
export async function GET(request: NextRequest) {
  try {
    // Aplicar rate limiting
    const rateLimitResult = await applyRateLimit(request, 'dashboard')
    if (!rateLimitResult.success && rateLimitResult.error) {
      throw rateLimitResult.error
    }

    const context = await requireTenant()
    
    // Obter período da query string
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d'

    // Calcular data de início baseada no período
    const now = new Date()
    const startDate = new Date()
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Buscar estatísticas em paralelo
    const [
      clientsStats,
      projectsStats,
      revenuesStats,
      expensesStats,
    ] = await Promise.all([
      // Estatísticas de clientes
      Promise.all([
        db.client.count({
          where: { agencyId: context.agencyId }
        }),
        db.client.count({
          where: {
            agencyId: context.agencyId,
            createdAt: { gte: startDate }
          }
        }),
      ]),

      // Estatísticas de projetos
      Promise.all([
        db.project.count({
          where: { agencyId: context.agencyId }
        }),
        db.project.count({
          where: {
            agencyId: context.agencyId,
            status: 'IN_PROGRESS'
          }
        }),
        db.project.count({
          where: {
            agencyId: context.agencyId,
            status: 'COMPLETED'
          }
        }),
        db.project.count({
          where: {
            agencyId: context.agencyId,
            createdAt: { gte: startDate }
          }
        }),
      ]),

      // Estatísticas de receitas
      Promise.all([
        db.revenue.aggregate({
          where: { agencyId: context.agencyId },
          _sum: { amount: true },
          _count: true,
        }),
        db.revenue.aggregate({
          where: {
            agencyId: context.agencyId,
            date: { gte: startDate }
          },
          _sum: { amount: true },
          _count: true,
        }),
      ]),

      // Estatísticas de despesas
      Promise.all([
        db.expense.aggregate({
          where: { agencyId: context.agencyId },
          _sum: { amount: true },
          _count: true,
        }),
        db.expense.aggregate({
          where: {
            agencyId: context.agencyId,
            date: { gte: startDate }
          },
          _sum: { amount: true },
          _count: true,
        }),
      ]),
    ])

    // Calcular período anterior para comparação
    const previousStartDate = new Date(startDate)
    const periodDays = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    previousStartDate.setDate(startDate.getDate() - periodDays)

    // Buscar dados do período anterior para comparação
    const [previousRevenues, previousExpenses, previousClients, previousProjects] = await Promise.all([
      db.revenue.aggregate({
        where: {
          agencyId: context.agencyId,
          date: { gte: previousStartDate, lt: startDate }
        },
        _sum: { amount: true },
      }),
      db.expense.aggregate({
        where: {
          agencyId: context.agencyId,
          date: { gte: previousStartDate, lt: startDate }
        },
        _sum: { amount: true },
      }),
      db.client.count({
        where: {
          agencyId: context.agencyId,
          createdAt: { gte: previousStartDate, lt: startDate }
        }
      }),
      db.project.count({
        where: {
          agencyId: context.agencyId,
          createdAt: { gte: previousStartDate, lt: startDate }
        }
      }),
    ])

    // Calcular variações percentuais
    const calculateChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 100)
    }

    const currentRevenue = Number(revenuesStats[1]._sum.amount || 0)
    const previousRevenue = Number(previousRevenues._sum.amount || 0)
    const currentExpense = Number(expensesStats[1]._sum.amount || 0)
    const previousExpense = Number(previousExpenses._sum.amount || 0)

    // Montar resposta
    const stats = {
      period,
      clients: {
        total: clientsStats[0],
        new: clientsStats[1],
        change: calculateChange(clientsStats[1], previousClients),
      },
      projects: {
        total: projectsStats[0],
        active: projectsStats[1],
        completed: projectsStats[2],
        new: projectsStats[3],
        change: calculateChange(projectsStats[3], previousProjects),
      },
      revenue: {
        total: Number(revenuesStats[0]._sum.amount || 0),
        current: currentRevenue,
        count: revenuesStats[1]._count,
        change: calculateChange(currentRevenue, previousRevenue),
      },
      expenses: {
        total: Number(expensesStats[0]._sum.amount || 0),
        current: currentExpense,
        count: expensesStats[1]._count,
        change: calculateChange(currentExpense, previousExpense),
      },
      profit: {
        current: currentRevenue - currentExpense,
        change: calculateChange(
          currentRevenue - currentExpense,
          previousRevenue - previousExpense
        ),
      },
      tasks: {
        total: 0,
        completed: 0,
        inProgress: 0,
        completionRate: 0,
      },
      summary: {
        totalClients: clientsStats[0],
        activeProjects: projectsStats[1],
        monthlyRevenue: currentRevenue,
        monthlyProfit: currentRevenue - currentExpense,
      }
    }

    return createSuccessResponse(stats)
  } catch (error) {
    console.error('Erro ao buscar estatísticas do dashboard:', error)
    throw error
  }
}
