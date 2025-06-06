"use client"

import { useQuery } from "@tanstack/react-query"

export interface DashboardStats {
  period: string
  clients: {
    total: number
    new: number
    change: number
  }
  projects: {
    total: number
    active: number
    completed: number
    new: number
    change: number
  }
  revenue: {
    total: number
    current: number
    count: number
    change: number
  }
  expenses: {
    total: number
    current: number
    count: number
    change: number
  }
  profit: {
    current: number
    change: number
  }
  tasks: {
    total: number
    completed: number
    inProgress: number
    completionRate: number
  }
  summary: {
    totalClients: number
    activeProjects: number
    monthlyRevenue: number
    monthlyProfit: number
  }
}

export function useDashboard(period: string = '30d') {
  return useQuery({
    queryKey: ['dashboard-stats', period],
    queryFn: async (): Promise<DashboardStats> => {
      const response = await fetch(`/api/dashboard/stats?period=${period}`)
      
      if (!response.ok) {
        throw new Error('Falha ao carregar estatísticas do dashboard')
      }
      
      const data = await response.json()
      return data.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 10 * 60 * 1000, // Atualizar a cada 10 minutos
  })
}
