'use client'

import { useState, useEffect, useCallback } from 'react'
import { useNotifications } from './use-notifications'

export interface BrowserNotificationOptions {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  requireInteraction?: boolean
  silent?: boolean
}

export function useBrowserNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)
  const { notifications } = useNotifications()

  // Verificar suporte e permissão
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsSupported(true)
      setPermission(Notification.permission)
    }
  }, [])

  // Solicitar permissão
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      throw new Error('Browser notifications não são suportadas')
    }

    if (permission === 'granted') {
      return permission
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error)
      throw error
    }
  }, [isSupported, permission])

  // Mostrar notificação do browser
  const showNotification = useCallback(async (options: BrowserNotificationOptions) => {
    if (!isSupported) {
      console.warn('Browser notifications não são suportadas')
      return null
    }

    if (permission !== 'granted') {
      const newPermission = await requestPermission()
      if (newPermission !== 'granted') {
        console.warn('Permissão negada para notificações')
        return null
      }
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        badge: options.badge || '/favicon.ico',
        tag: options.tag || `notification-${Date.now()}`,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
      })

      // Auto-fechar após 5 segundos se não for requireInteraction
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close()
        }, 5000)
      }

      // Event listeners
      notification.onclick = () => {
        window.focus()
        notification.close()
      }

      notification.onerror = (error) => {
        console.error('Erro na notificação:', error)
      }

      return notification
    } catch (error) {
      console.error('Erro ao mostrar notificação:', error)
      return null
    }
  }, [isSupported, permission, requestPermission])

  // Monitorar novas notificações e enviar push notifications automáticas
  useEffect(() => {
    if (!isSupported || permission !== 'granted') {
      return
    }

    // Verifica se há notificações não lidas e envia push notification
    const unreadNotifications = notifications.filter(n => !n.read)
    
    if (unreadNotifications.length > 0) {
      const latestNotification = unreadNotifications[0]
      
      // Verifica se a notificação é recente (última hora)
      const notificationTime = new Date(latestNotification.timestamp).getTime()
      const oneHourAgo = Date.now() - (60 * 60 * 1000)
      
      if (notificationTime > oneHourAgo) {
        // Envia push notification apenas se a aba não estiver ativa
        if (document.hidden) {
          showNotification({
            title: `AgênciaOS - ${latestNotification.title}`,
            body: latestNotification.message,
            icon: '/favicon.ico',
            tag: `agenciaos-${latestNotification.id}`,
            requireInteraction: true
          })
        }
      }
    }
  }, [notifications, isSupported, permission, showNotification])

  // Notificação de job concluído
  const notifyJobCompleted = useCallback(async (jobTitle: string, jobType: string) => {
    const typeEmojis = {
      'project-analysis': '📊',
      'client-strategy': '🤝',
      'task-breakdown': '📋',
      'monthly-report': '📈'
    }

    const emoji = typeEmojis[jobType as keyof typeof typeEmojis] || '🤖'

    return showNotification({
      title: `${emoji} AgênciaOS - Análise Concluída`,
      body: `${jobTitle} foi processado com sucesso!`,
      icon: '/favicon.ico',
      tag: `job-completed-${Date.now()}`,
      requireInteraction: false
    })
  }, [showNotification])

  // Notificação de job iniciado
  const notifyJobStarted = useCallback(async (jobTitle: string) => {
    // Apenas se o usuário estiver em outra aba
    if (document.hidden) {
      return showNotification({
        title: '🔄 AgênciaOS - Processando',
        body: `Analisando: ${jobTitle}...`,
        icon: '/favicon.ico',
        tag: `job-started-${Date.now()}`,
        requireInteraction: false,
        silent: true // Silencioso para não ser intrusivo
      })
    }
    return null
  }, [showNotification])

  // Notificação personalizada
  const notify = useCallback(async (title: string, message: string, options?: Partial<BrowserNotificationOptions>) => {
    return showNotification({
      title: `AgênciaOS - ${title}`,
      body: message,
      icon: '/favicon.ico',
      ...options
    })
  }, [showNotification])

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
    notifyJobCompleted,
    notifyJobStarted,
    notify
  }
}

// Hook para configuração automática
export function useBrowserNotificationsSetup() {
  const { isSupported, permission, requestPermission } = useBrowserNotifications()
  const [hasAskedPermission, setHasAskedPermission] = useState(false)

  // Solicitar permissão automaticamente na primeira visita
  useEffect(() => {
    if (!hasAskedPermission && isSupported && permission === 'default') {
      const timer = setTimeout(async () => {
        try {
          await requestPermission()
          setHasAskedPermission(true)
        } catch {
          console.log('Usuário negou permissão para notificações')
          setHasAskedPermission(true)
        }
      }, 3000) // Aguarda 3 segundos antes de solicitar

      return () => clearTimeout(timer)
    }
  }, [isSupported, permission, requestPermission, hasAskedPermission])

  return {
    isSupported,
    permission,
    requestPermission,
    hasAskedPermission
  }
}
