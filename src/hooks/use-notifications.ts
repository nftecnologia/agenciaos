'use client'

import { useState, useEffect, useCallback } from 'react'

export interface Notification {
  id: string
  type: 'project-analysis' | 'client-strategy' | 'task-breakdown' | 'monthly-report'
  title: string
  message: string
  read: boolean
  timestamp: string
  jobId?: string
  result?: unknown
}

interface JobProgress {
  id: string
  type: string
  title: string
  startTime: number
  estimatedDuration: number
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [activeJobs, setActiveJobs] = useState<JobProgress[]>([])

  // Completar um job
  const completeJob = useCallback((jobId: string, title: string, type: string, result?: unknown) => {
    setActiveJobs(prevJobs => {
      const updatedJobs = prevJobs.filter(job => job.id !== jobId)
      localStorage.setItem('agenciaos-active-jobs', JSON.stringify(updatedJobs))
      return updatedJobs
    })
    
    // Criar notificação
    const notification: Notification = {
      id: jobId,
      type: type as Notification['type'],
      title: getCompletionTitle(type),
      message: getCompletionMessage(type),
      read: false,
      timestamp: new Date().toISOString(),
      jobId,
      result
    }
    
    setNotifications(prevNotifications => {
      const updatedNotifications = [notification, ...prevNotifications]
      localStorage.setItem('agenciaos-notifications', JSON.stringify(updatedNotifications))
      return updatedNotifications
    })
    
    // Log de conclusão (sem toast para evitar dependência)
    console.log(`✅ ${notification.title}`)
  }, [])

  // Carregar notificações do localStorage
  useEffect(() => {
    const stored = localStorage.getItem('agenciaos-notifications')
    if (stored) {
      try {
        setNotifications(JSON.parse(stored))
      } catch (error) {
        console.error('Erro ao carregar notificações:', error)
      }
    }

    // Carregar jobs ativos
    const storedJobs = localStorage.getItem('agenciaos-active-jobs')
    if (storedJobs) {
      try {
        const jobs = JSON.parse(storedJobs)
        setActiveJobs(jobs)
        
        // Verificar jobs que devem ter terminado
        const now = Date.now()
        jobs.forEach((job: JobProgress) => {
          const timeElapsed = now - job.startTime
          if (timeElapsed >= job.estimatedDuration) {
            completeJob(job.id, job.title, job.type)
          } else {
            // Programar conclusão do job
            const remainingTime = job.estimatedDuration - timeElapsed
            setTimeout(() => {
              completeJob(job.id, job.title, job.type)
            }, remainingTime)
          }
        })
      } catch (error) {
        console.error('Erro ao carregar jobs ativos:', error)
      }
    }
  }, [completeJob])

  // Salvar notificações no localStorage
  const saveNotifications = (newNotifications: Notification[]) => {
    localStorage.setItem('agenciaos-notifications', JSON.stringify(newNotifications))
    setNotifications(newNotifications)
  }

  // Salvar jobs ativos
  const saveActiveJobs = (jobs: JobProgress[]) => {
    localStorage.setItem('agenciaos-active-jobs', JSON.stringify(jobs))
    setActiveJobs(jobs)
  }

  // Iniciar um job
  const startJob = (type: string, title: string, estimatedDuration: number = 15000) => {
    const jobId = `job-${Date.now()}`
    
    // Adicionar à lista de jobs ativos
    const newJob: JobProgress = {
      id: jobId,
      type,
      title,
      startTime: Date.now(),
      estimatedDuration
    }
    
    const updatedJobs = [...activeJobs, newJob]
    saveActiveJobs(updatedJobs)
    
    // Log de início (sem toast para evitar dependência)
    console.log(`🔄 Analisando ${title}...`)
    
    // Programar conclusão do job
    setTimeout(() => {
      completeJob(jobId, title, type)
    }, estimatedDuration)
    
    return jobId
  }

  // Marcar notificação como lida
  const markAsRead = (notificationId: string) => {
    const updatedNotifications = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    )
    saveNotifications(updatedNotifications)
  }

  // Marcar todas como lidas
  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }))
    saveNotifications(updatedNotifications)
  }

  // Limpar notificações antigas (mais de 7 dias)
  const clearOldNotifications = () => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const filteredNotifications = notifications.filter(n => 
      new Date(n.timestamp) > sevenDaysAgo
    )
    saveNotifications(filteredNotifications)
  }

  // Contar não lidas
  const unreadCount = notifications.filter(n => !n.read).length

  return {
    notifications,
    activeJobs,
    unreadCount,
    startJob,
    completeJob,
    markAsRead,
    markAllAsRead,
    clearOldNotifications
  }
}

// Funções auxiliares
function getCompletionTitle(type: string): string {
  switch (type) {
    case 'project-analysis':
      return `✅ Análise de projeto concluída`
    case 'client-strategy':
      return `✅ Estratégias de relacionamento geradas`
    case 'task-breakdown':
      return `✅ Breakdown de task finalizado`
    case 'monthly-report':
      return `✅ Relatório mensal gerado`
    default:
      return `✅ Processamento concluído`
  }
}

function getCompletionMessage(type: string): string {
  switch (type) {
    case 'project-analysis':
      return 'Sugestões e estratégias foram geradas para seu projeto'
    case 'client-strategy':
      return 'Estratégias de relacionamento personalizadas foram criadas'
    case 'task-breakdown':
      return 'Task foi quebrada em subtasks com estimativas'
    case 'monthly-report':
      return 'Relatório com insights e métricas foi gerado'
    default:
      return 'Processamento foi finalizado com sucesso'
  }
}

// Hook para job específico
export function useJobProgress(jobId: string) {
  const { activeJobs } = useNotifications()
  const job = activeJobs.find(j => j.id === jobId)
  
  if (!job) return null
  
  const elapsed = Date.now() - job.startTime
  const progress = Math.min((elapsed / job.estimatedDuration) * 100, 100)
  const isComplete = progress >= 100
  
  return {
    progress,
    isComplete,
    timeElapsed: elapsed,
    estimatedTime: job.estimatedDuration
  }
}
