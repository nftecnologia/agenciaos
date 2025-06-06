import { NextResponse } from 'next/server'
import { requireTenant } from '@/lib/tenant'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

// GET /api/dashboard/stats - Estatísticas do dashboard
export async function GET() {
  try {
    const context = await requireTenant()

    // Buscar estatísticas em paralelo
    const [
      clientsCount,
      projectsCount,
      activeProjectsCount,
      totalRevenue,
      monthlyRevenue,
      aiUsageCount,
      recentProjects,
      pendingTasks,
    ] = await Promise.all([
      // Total de clientes
      db.client.count({
        where: { agencyId: context.agencyId },
      }),

      // Total de projetos
      db.project.count({
        where: { agencyId: context.agencyId },
      }),

      // Projetos ativos (em progresso)
      db.project.count({
        where: {
          agencyId: context.agencyId,
          status: 'IN_PROGRESS',
        },
      }),

      // Receita total
      db.revenue.aggregate({
        where: { agencyId: context.agencyId },
        _sum: { amount: true },
      }),

      // Receita do mês atual
      db.revenue.aggregate({
        where: {
          agencyId: context.agencyId,
          date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { amount: true },
      }),

      // Uso de IA do mês
      db.aIUsage.aggregate({
        where: {
          agencyId: context.agencyId,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { tokensUsed: true },
      }),

      // Projetos recentes
      db.project.findMany({
        where: { agencyId: context.agencyId },
        include: {
          client: {
            select: { name: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),

      // Tarefas pendentes
      db.task.findMany({
        where: {
          project: { agencyId: context.agencyId },
          dueDate: {
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Próximos 7 dias
          },
        },
        include: {
          project: {
            select: { name: true },
          },
          assignee: {
            select: { name: true },
          },
        },
        orderBy: { dueDate: 'asc' },
        take: 10,
      }),
    ])

    // Calcular crescimento mensal (comparar com mês anterior)
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    
    const lastMonthRevenue = await db.revenue.aggregate({
      where: {
        agencyId: context.agencyId,
        date: {
          gte: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1),
          lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: { amount: true },
    })

    const currentMonthAmount = Number(monthlyRevenue._sum.amount || 0)
    const lastMonthAmount = Number(lastMonthRevenue._sum.amount || 0)
    const revenueGrowth = lastMonthAmount > 0 
      ? ((currentMonthAmount - lastMonthAmount) / lastMonthAmount) * 100
      : 0

    // Calcular limite de IA baseado no plano
    const aiLimit = context.agency.plan === 'PRO' ? 500 : 20
    const aiUsed = aiUsageCount._sum.tokensUsed || 0

    const stats = {
      clients: {
        total: clientsCount,
        growth: 0, // TODO: Calcular crescimento
      },
      projects: {
        total: projectsCount,
        active: activeProjectsCount,
        growth: 0, // TODO: Calcular crescimento
      },
      revenue: {
        total: Number(totalRevenue._sum.amount || 0),
        monthly: currentMonthAmount,
        growth: Math.round(revenueGrowth * 100) / 100,
      },
      ai: {
        used: aiUsed,
        limit: aiLimit,
        percentage: Math.round((aiUsed / aiLimit) * 100),
      },
      recentProjects: recentProjects.map(project => ({
        id: project.id,
        name: project.name,
        client: project.client.name,
        status: project.status,
        updatedAt: project.updatedAt,
      })),
      pendingTasks: pendingTasks.map(task => ({
        id: task.id,
        title: task.title,
        project: task.project.name,
        assignee: task.assignee?.name || 'Não atribuído',
        dueDate: task.dueDate,
        priority: task.priority,
      })),
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: error instanceof Error && error.message.includes('Acesso negado') ? 403 : 500 }
    )
  }
} 