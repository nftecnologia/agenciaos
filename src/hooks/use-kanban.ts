'use client'

import { useState, useEffect, useCallback } from 'react'
import { Board, Task, Priority } from '@prisma/client'

interface TaskWithAssignee extends Task {
  assignee?: {
    id: string
    name: string | null
    email: string
  } | null
}

interface BoardWithTasks extends Board {
  tasks: TaskWithAssignee[]
}

interface CreateTaskData {
  projectId: string
  boardId: string
  title: string
  description?: string
  priority?: Priority
  assignedTo?: string
  dueDate?: string
}

interface UpdateTaskData {
  title?: string
  description?: string
  priority?: Priority
  assignedTo?: string | null
  dueDate?: string | null
}

interface MoveTaskData {
  taskId: string
  boardId: string
  position: number
}

export function useKanban(projectId: string | null) {
  const [boards, setBoards] = useState<BoardWithTasks[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar boards do projeto
  const loadBoards = useCallback(async () => {
    if (!projectId) {
      setBoards([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/boards?projectId=${projectId}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao carregar boards')
      }

      const data = await response.json()
      setBoards(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  // Criar novo board
  const createBoard = async (name: string, color?: string) => {
    if (!projectId) return

    try {
      const response = await fetch('/api/boards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          name,
          color,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar board')
      }

      const newBoard = await response.json()
      setBoards(prev => [...prev, newBoard])
      return newBoard
    } catch (err) {
      throw err
    }
  }

  // Atualizar board
  const updateBoard = async (boardId: string, data: { name?: string; color?: string }) => {
    try {
      const response = await fetch(`/api/boards/${boardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao atualizar board')
      }

      const updatedBoard = await response.json()
      setBoards(prev => prev.map(board => 
        board.id === boardId ? updatedBoard : board
      ))
      return updatedBoard
    } catch (err) {
      throw err
    }
  }

  // Deletar board
  const deleteBoard = async (boardId: string) => {
    try {
      const response = await fetch(`/api/boards/${boardId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao deletar board')
      }

      setBoards(prev => prev.filter(board => board.id !== boardId))
    } catch (err) {
      throw err
    }
  }

  // Criar nova tarefa
  const createTask = async (data: CreateTaskData) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar tarefa')
      }

      const newTask = await response.json()
      
      // Adicionar tarefa ao board correspondente
      setBoards(prev => prev.map(board => 
        board.id === data.boardId 
          ? { ...board, tasks: [...board.tasks, newTask] }
          : board
      ))
      
      return newTask
    } catch (err) {
      throw err
    }
  }

  // Atualizar tarefa
  const updateTask = async (taskId: string, data: UpdateTaskData) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao atualizar tarefa')
      }

      const updatedTask = await response.json()
      
      // Atualizar tarefa nos boards
      setBoards(prev => prev.map(board => ({
        ...board,
        tasks: board.tasks.map(task => 
          task.id === taskId ? updatedTask : task
        )
      })))
      
      return updatedTask
    } catch (err) {
      throw err
    }
  }

  // Mover tarefa (drag & drop)
  const moveTask = async (data: MoveTaskData) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao mover tarefa')
      }

      // Recarregar boards para sincronizar posições
      await loadBoards()
    } catch (err) {
      throw err
    }
  }

  // Deletar tarefa
  const deleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao deletar tarefa')
      }

      // Remover tarefa dos boards
      setBoards(prev => prev.map(board => ({
        ...board,
        tasks: board.tasks.filter(task => task.id !== taskId)
      })))
    } catch (err) {
      throw err
    }
  }

  // Carregar boards quando o projectId mudar
  useEffect(() => {
    loadBoards()
  }, [loadBoards])

  return {
    boards,
    loading,
    error,
    loadBoards,
    createBoard,
    updateBoard,
    deleteBoard,
    createTask,
    updateTask,
    moveTask,
    deleteTask,
  }
}
