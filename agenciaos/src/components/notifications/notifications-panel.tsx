'use client'

import { useState } from 'react'
import { useNotifications, type Notification } from '../../hooks/use-notifications'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select'
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Mail,
  Bot,
  Users,
  FolderOpen,
  FileText
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const typeIcons = {
  'project-analysis': FolderOpen,
  'client-strategy': Users,
  'task-breakdown': FileText,
  'monthly-report': Bot
}

const typeLabels = {
  'project-analysis': 'Análise de Projeto',
  'client-strategy': 'Estratégia de Cliente',
  'task-breakdown': 'Breakdown de Task',
  'monthly-report': 'Relatório Mensal'
}

const typeColors = {
  'project-analysis': 'bg-blue-500',
  'client-strategy': 'bg-green-500',
  'task-breakdown': 'bg-orange-500',
  'monthly-report': 'bg-purple-500'
}

interface NotificationsPanelProps {
  className?: string
}

export function NotificationsPanel({ className }: NotificationsPanelProps) {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearOldNotifications 
  } = useNotifications()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Filtrar notificações
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType = filterType === 'all' || notification.type === filterType
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'read' && notification.read) ||
                         (filterStatus === 'unread' && !notification.read)
    
    return matchesSearch && matchesType && matchesStatus
  })

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Notificações</h2>
            <p className="text-gray-600">
              {unreadCount > 0 ? `${unreadCount} não lidas` : 'Tudo em dia'}
            </p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                onClick={markAllAsRead}
                className="flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Marcar todas como lidas
              </Button>
            )}
            <Button 
              variant="outline"
              onClick={clearOldNotifications}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Limpar antigas
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros e Busca
            </CardTitle>
            <CardDescription>
              Encontre notificações específicas rapidamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar notificações..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Filtro por tipo */}
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="project-analysis">Análise de Projeto</SelectItem>
                  <SelectItem value="client-strategy">Estratégia de Cliente</SelectItem>
                  <SelectItem value="task-breakdown">Breakdown de Task</SelectItem>
                  <SelectItem value="monthly-report">Relatório Mensal</SelectItem>
                </SelectContent>
              </Select>

              {/* Filtro por status */}
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="unread">Não lidas</SelectItem>
                  <SelectItem value="read">Lidas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{notifications.length}</p>
                </div>
                <Bot className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Não lidas</p>
                  <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
                </div>
                <Mail className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Hoje</p>
                  <p className="text-2xl font-bold text-green-600">
                    {notifications.filter(n => 
                      new Date(n.timestamp).toDateString() === new Date().toDateString()
                    ).length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Filtradas</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {filteredNotifications.length}
                  </p>
                </div>
                <Filter className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Notificações */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma notificação encontrada
                </h3>
                <p className="text-gray-600">
                  {searchQuery || filterType !== 'all' || filterStatus !== 'all'
                    ? 'Tente ajustar os filtros de busca'
                    : 'Notificações aparecerão aqui quando você criar projetos, clientes ou tasks'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => {
              const Icon = typeIcons[notification.type] || Bot
              return (
                <Card 
                  key={notification.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    !notification.read ? 'ring-2 ring-blue-200 bg-blue-50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${typeColors[notification.type]}`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                Novo
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Icon className="h-3 w-3" />
                              {typeLabels[notification.type]}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(notification.timestamp), {
                                addSuffix: true,
                                locale: ptBR
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {/* Estatísticas de filtros aplicados */}
        {(searchQuery || filterType !== 'all' || filterStatus !== 'all') && (
          <Card className="border-dashed">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  Mostrando {filteredNotifications.length} de {notifications.length} notificações
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('')
                    setFilterType('all')
                    setFilterStatus('all')
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Limpar filtros
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
