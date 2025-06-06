'use client'

import { useState, useEffect, useCallback } from 'react'

export interface Expense {
  id: string
  description: string
  amount: number
  category: string
  date: string
  createdAt: string
  updatedAt: string
}

export interface ExpensesResponse {
  expenses: Expense[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface CreateExpenseData {
  description: string
  amount: number
  category: string
  date: string
}

export interface UpdateExpenseData {
  description?: string
  amount?: number
  category?: string
  date?: string
}

export interface ExpenseFilters {
  search?: string
  category?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export function useExpenses(initialFilters: ExpenseFilters = {}) {
  const [expenses, setExpenses] = useState<Expense[]>([])
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
  const [filters, setFilters] = useState<ExpenseFilters>(initialFilters)

  // Função para buscar despesas
  const fetchExpenses = useCallback(async (currentFilters: ExpenseFilters = {}) => {
    setLoading(true)
    setError(null)

    try {
      const searchParams = new URLSearchParams()
      
      Object.entries({ ...filters, ...currentFilters }).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value))
        }
      })

      const response = await fetch(`/api/expenses?${searchParams}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao buscar despesas')
      }

      const data: ExpensesResponse = await response.json()
      setExpenses(data.expenses)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      setExpenses([])
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Função para criar despesa
  const createExpense = useCallback(async (data: CreateExpenseData): Promise<Expense> => {
    const response = await fetch('/api/expenses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Erro ao criar despesa')
    }

    const expense = await response.json()
    
    // Atualizar lista local
    setExpenses(prev => [expense, ...prev])
    
    return expense
  }, [])

  // Função para atualizar despesa
  const updateExpense = useCallback(async (id: string, data: UpdateExpenseData): Promise<Expense> => {
    const response = await fetch(`/api/expenses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Erro ao atualizar despesa')
    }

    const updatedExpense = await response.json()
    
    // Atualizar lista local
    setExpenses(prev => 
      prev.map(expense => 
        expense.id === id ? updatedExpense : expense
      )
    )
    
    return updatedExpense
  }, [])

  // Função para deletar despesa
  const deleteExpense = useCallback(async (id: string): Promise<void> => {
    const response = await fetch(`/api/expenses/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Erro ao deletar despesa')
    }

    // Remover da lista local
    setExpenses(prev => prev.filter(expense => expense.id !== id))
  }, [])

  // Função para buscar despesa específica
  const getExpense = useCallback(async (id: string): Promise<Expense> => {
    const response = await fetch(`/api/expenses/${id}`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Erro ao buscar despesa')
    }

    return response.json()
  }, [])

  // Função para atualizar filtros
  const updateFilters = useCallback((newFilters: Partial<ExpenseFilters>) => {
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

  // Buscar despesas quando filtros mudarem
  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  return {
    expenses,
    pagination,
    loading,
    error,
    filters,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    getExpense,
    updateFilters,
    goToPage,
    resetFilters,
  }
} 