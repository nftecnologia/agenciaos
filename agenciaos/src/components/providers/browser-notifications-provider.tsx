'use client'

import { useBrowserNotificationsSetup } from '../../hooks/use-browser-notifications'

interface BrowserNotificationsProviderProps {
  children: React.ReactNode
}

export function BrowserNotificationsProvider({ children }: BrowserNotificationsProviderProps) {
  // Hook que automaticamente solicita permissão e configura notificações
  useBrowserNotificationsSetup()
  
  return <>{children}</>
}
