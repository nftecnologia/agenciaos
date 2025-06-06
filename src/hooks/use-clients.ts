'use client'

import { useState, useEffect, useCallback } from 'react'

export interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  company?: string
  createdAt: string
  updatedAt: string
  projects: Array<{
    id: string
    name: string
    status: string
    createdAt: string
    updatedAt: string
  }>
  _count: {
    projects: number
  }
}

export interface ClientsResponse {
  clients: Client[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface CreateClientData {
  name: string
  email?: string
  phone?: string
  company?: string
}

export type UpdateClientData = Partial<CreateClientData>

export function useClients(search: string = '', page: number = 1, limit: number = 10) {
  const [data, setData] = useState<ClientsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      })

      const response = await fetch(`/api/clients?${params}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao carregar clientes')
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [search, page, limit])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const createClient = async (clientData: CreateClientData): Promise<Client> => {
    const response = await fetch('/api/clients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Erro ao criar cliente')
    }

    const client = await response.json()
    
    // Atualizar lista local
    await fetchClients()
    
    return client
  }

  const updateClient = async (id: string, clientData: UpdateClientData): Promise<Client> => {
    const response = await fetch(`/api/clients/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Erro ao atualizar cliente')
    }

    const client = await response.json()
    
    // Atualizar lista local
    await fetchClients()
    
    return client
  }

  const deleteClient = async (id: string): Promise<void> => {
    const response = await fetch(`/api/clients/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Erro ao deletar cliente')
    }

    // Atualizar lista local
    await fetchClients()
  }

  const refresh = () => {
    fetchClients()
  }

  return {
    clients: data?.clients || [],
    pagination: data?.pagination,
    loading,
    error,
    createClient,
    updateClient,
    deleteClient,
    refresh,
  }
}

export function useClient(id: string) {
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClient = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/clients/${id}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao carregar cliente')
      }

      const result = await response.json()
      setClient(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      fetchClient()
    }
  }, [fetchClient, id])

  const refresh = () => {
    fetchClient()
  }

  return {
    client,
    loading,
    error,
    refresh,
  }
} 