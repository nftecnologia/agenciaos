'use client'

import { useState, useEffect } from 'react'

export interface ProjectListItem {
  id: string
  name: string
  status: string
  client: {
    id: string
    name: string
  }
}

export function useProjectsList() {
  const [projects, setProjects] = useState<ProjectListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/projects?limit=100')
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Erro ao carregar projetos')
        }

        const data = await response.json()
        setProjects(data.projects || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        setProjects([])
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  return {
    projects,
    loading,
    error,
  }
} 