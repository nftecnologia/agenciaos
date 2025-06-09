'use client'

import { useState, useEffect, useCallback } from 'react'

export interface Revenue {
  id: string
  description: string
  amount: number
  category: string
  isRecurring: boolean
  date: string
  createdAt: string
  updatedAt: string
  client?: {
    id: string
    name: string
    company?: string
  }
  project?: {
    id: string
    name: string
  }
}

export interface RevenuesResponse {
  revenues: Revenue[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface CreateRevenueData {
  description: string
  amount: number
  category: string
  clientId?: string
  projectId?: string
  isRecurring?: boolean
  date: string
}

export interface UpdateRevenueData {
  description?: string
  amount?: number
  category?: string
  clientId?: string
  projectId?: string
  isRecurring?: boolean
  date?: string
}

export interface RevenueFilters {
  search?: string
  category?: string
  clientId?: string
  projectId?: string
  isRecurring?: boolean
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export function useRevenues(initialFilters: RevenueFilters = {}) {
  const [revenues, setRevenues] = useState<Revenue[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<RevenueFilters>(initialFilters)

  // Função para buscar receitas
  const fetchRevenues = useCallback(async (currentFilters: RevenueFilters = {}) => {
    setLoading(true)
    setError(null)

    try {
      const searchParams = new URLSearchParams()
      
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value))
        }
      })

      const response = await fetch(`/api/revenues?${searchParams}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao buscar receitas')
      }

      const data: RevenuesResponse = await response.json()
      setRevenues(data.revenues)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      setRevenues([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Função para criar receita
  const createRevenue = useCallback(async (data: CreateRevenueData): Promise<Revenue> => {
    const response = await fetch('/api/revenues', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Erro ao criar receita')
    }

    const revenue = await response.json()
    
    // Atualizar lista local
    setRevenues(prev => [revenue, ...prev])
    
    return revenue
  }, [])

  // Função para atualizar receita
  const updateRevenue = useCallback(async (id: string, data: UpdateRevenueData): Promise<Revenue> => {
    const response = await fetch(`/api/revenues/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Erro ao atualizar receita')
    }

    const updatedRevenue = await response.json()
    
    // Atualizar lista local
    setRevenues(prev => 
      prev.map(revenue => 
        revenue.id === id ? updatedRevenue : revenue
      )
    )
    
    return updatedRevenue
  }, [])

  // Função para deletar receita
  const deleteRevenue = useCallback(async (id: string): Promise<void> => {
    const response = await fetch(`/api/revenues/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Erro ao deletar receita')
    }

    // Remover da lista local
    setRevenues(prev => prev.filter(revenue => revenue.id !== id))
  }, [])

  // Função para buscar receita específica
  const getRevenue = useCallback(async (id: string): Promise<Revenue> => {
    const response = await fetch(`/api/revenues/${id}`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Erro ao buscar receita')
    }

    return response.json()
  }, [])

  // Função para atualizar filtros
  const updateFilters = useCallback((newFilters: Partial<RevenueFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  // Função para ir para página específica
  const goToPage = useCallback((page: number) => {
    updateFilters({ page })
  }, [updateFilters])

  // Função para resetar filtros
  const resetFilters = useCallback(() => {
    setFilters({})
  }, [])

  // Buscar receitas quando filtros mudarem
  useEffect(() => {
    const loadRevenues = async () => {
      setLoading(true)
      setError(null)

      try {
        const searchParams = new URLSearchParams()
        
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value))
          }
        })

        const response = await fetch(`/api/revenues?${searchParams}`)
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Erro ao buscar receitas')
        }

        const data: RevenuesResponse = await response.json()
        setRevenues(data.revenues)
        setPagination(data.pagination)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        setRevenues([])
      } finally {
        setLoading(false)
      }
    }

    loadRevenues()
  }, [filters])

  return {
    revenues,
    pagination,
    loading,
    error,
    filters,
    fetchRevenues,
    createRevenue,
    updateRevenue,
    deleteRevenue,
    getRevenue,
    updateFilters,
    goToPage,
    resetFilters,
  }
}
