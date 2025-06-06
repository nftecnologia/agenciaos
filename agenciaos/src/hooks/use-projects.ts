'use client'

import { useState, useEffect, useCallback } from 'react'

export interface Project {
  id: string
  name: string
  description?: string
  status: string
  budget?: number
  startDate?: string
  endDate?: string
  createdAt: string
  updatedAt: string
  client: {
    id: string
    name: string
    email?: string
    company?: string
  }
  _count: {
    tasks: number
    boards: number
  }
}

export interface ProjectsResponse {
  projects: Project[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface CreateProjectData {
  name: string
  description?: string
  clientId: string
  status?: string
  budget?: number
  startDate?: string
  endDate?: string
}

export type UpdateProjectData = Partial<CreateProjectData>

export function useProjects(
  search: string = '', 
  statusFilter: string = '',
  page: number = 1, 
  limit: number = 10
) {
  const [data, setData] = useState<ProjectsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
      })

      const response = await fetch(`/api/projects?${params}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao carregar projetos')
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, page, limit])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const createProject = async (projectData: CreateProjectData): Promise<Project> => {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Erro ao criar projeto')
    }

    const project = await response.json()
    
    // Atualizar lista local
    await fetchProjects()
    
    return project
  }

  const updateProject = async (id: string, projectData: UpdateProjectData): Promise<Project> => {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Erro ao atualizar projeto')
    }

    const project = await response.json()
    
    // Atualizar lista local
    await fetchProjects()
    
    return project
  }

  const deleteProject = async (id: string): Promise<void> => {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Erro ao deletar projeto')
    }

    // Atualizar lista local
    await fetchProjects()
  }

  const refresh = () => {
    fetchProjects()
  }

  return {
    projects: data?.projects || [],
    pagination: data?.pagination,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refresh,
  }
}

export function useProject(id: string) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProject = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/projects/${id}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao carregar projeto')
      }

      const result = await response.json()
      setProject(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      fetchProject()
    }
  }, [fetchProject, id])

  const refresh = () => {
    fetchProject()
  }

  return {
    project,
    loading,
    error,
    refresh,
  }
} 