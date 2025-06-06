'use client'

import { useState, useEffect } from 'react'

export interface DashboardStats {
  clients: {
    total: number
    growth: number
  }
  projects: {
    total: number
    active: number
    growth: number
  }
  revenue: {
    total: number
    monthly: number
    growth: number
  }
  ai: {
    used: number
    limit: number
    percentage: number
  }
  recentProjects: Array<{
    id: string
    name: string
    client: string
    status: string
    updatedAt: string
  }>
  pendingTasks: Array<{
    id: string
    title: string
    project: string
    assignee: string
    dueDate: string | null
    priority: string
  }>
}

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/dashboard/stats')
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao carregar estatísticas')
      }

      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const refresh = () => {
    fetchStats()
  }

  return {
    stats,
    loading,
    error,
    refresh,
  }
} 