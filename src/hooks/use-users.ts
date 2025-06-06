'use client'

import { useQuery } from '@tanstack/react-query'

interface User {
  id: string
  name: string | null
  email: string
  role: string
}

async function fetchUsers(): Promise<User[]> {
  const response = await fetch('/api/users')
  
  if (!response.ok) {
    throw new Error('Erro ao buscar usuários')
  }
  
  return response.json()
}

export function useUsers() {
  const {
    data: users = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })

  return {
    users,
    loading,
    error: error?.message,
    refetch,
  }
} 