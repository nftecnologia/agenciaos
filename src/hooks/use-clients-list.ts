'use client'

import { useState, useEffect } from 'react'

export interface ClientOption {
  id: string
  name: string
  company?: string
}

export function useClientsList() {
  const [clients, setClients] = useState<ClientOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true)
        setError(null)

        // Buscar todos os clientes sem paginação
        const response = await fetch('/api/clients?limit=1000')
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Erro ao carregar clientes')
        }

        const data = await response.json()
        setClients(data.clients.map((client: { id: string; name: string; company?: string }) => ({
          id: client.id,
          name: client.name,
          company: client.company,
        })))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [])

  return {
    clients,
    loading,
    error,
  }
} 