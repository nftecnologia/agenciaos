'use client'

import { useState, useMemo } from 'react'
import { useNotifications } from '../../../hooks/use-notifications'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Bell, Search, Filter, BarChart3, Users, Briefcase, FileText, Calendar, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function AutomationsPage() {
  const { notifications, markAsRead, markAllAsRead, clearOldNotifications } = useNotifications()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Estatísticas
  const stats = useMemo(() => {
    const total = notifications.length
    const unread = notifications.filter(n => !n.read).length
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayCount = notifications.filter(n => new Date(n.timestamp) >= today).length

    return { total, unread, todayCount }
  }, [notifications])

  // Notificações filtradas
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      // Filtro de busca
      const matchesSearch = searchTerm === '' || 
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase())

      // Filtro por tipo
      const matchesType = filterType === 'all' || notification.type === filterType

      // Filtro por status
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'unread' && !notification.read) ||
        (filterStatus === 'read' && notification.read)

      return matchesSearch && matchesType && matchesStatus
    })
  }, [notifications, searchTerm, filterType, filterStatus])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project-analysis': return <Briefcase className="w-4 h-4" />
      case 'client-strategy': return <Users className="w-4 h-4" />
      case 'task-breakdown': return <FileText className="w-4 h-4" />
      case 'monthly-report': return <BarChart3 className="w-4 h-4" />
      default: return <Bell className="w-4 h-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'project-analysis': return 'Projeto'
      case 'client-strategy': return 'Cliente'
      case 'task-breakdown': return 'Task'
      case 'monthly-report': return 'Relatório'
      default: return 'Geral'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'project-analysis': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'client-strategy': return 'bg-green-100 text-green-800 border-green-200'
      case 'task-breakdown': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'monthly-report': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilterType('all')
    setFilterStatus('all')
  }

  const hasActiveFilters = searchTerm !== '' || filterType !== 'all' || filterStatus !== 'all'

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Automações & Notificações</h1>
          <p className="text-gray-600 mt-1">
            Acompanhe suas análises de IA e notificações em tempo real
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={markAllAsRead} variant="outline" size="sm">
            Marcar todas como lidas
          </Button>
          <Button onClick={clearOldNotifications} variant="outline" size="sm">
            Limpar antigas
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Não lidas</p>
                <p className="text-2xl font-bold text-red-600">{stats.unread}</p>
              </div>
              <Badge variant="destructive" className="text-xs px-2 py-1">
                {stats.unread}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hoje</p>
                <p className="text-2xl font-bold text-blue-600">{stats.todayCount}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resultados</p>
                <p className="text-2xl font-bold text-green-600">{filteredNotifications.length}</p>
              </div>
              <Filter className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="w-5 h-5" />
            Filtros
            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                variant="ghost"
                size="sm"
                className="ml-auto"
              >
                <X className="w-4 h-4 mr-1" />
                Limpar
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Busca */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar notificações
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Busque por título ou mensagem..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filtro por tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por tipo
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos os tipos</option>
                <option value="project-analysis">📊 Análise de Projeto</option>
                <option value="client-strategy">🤝 Estratégia de Cliente</option>
                <option value="task-breakdown">📋 Breakdown de Task</option>
                <option value="monthly-report">📈 Relatório Mensal</option>
              </select>
            </div>

            {/* Filtro por status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos os status</option>
                <option value="unread">❌ Não lidas</option>
                <option value="read">✅ Lidas</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notificações ({filteredNotifications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {notifications.length === 0 
                  ? 'Nenhuma notificação ainda' 
                  : 'Nenhuma notificação encontrada'}
              </h3>
              <p className="text-gray-500">
                {notifications.length === 0 
                  ? 'Suas notificações de IA aparecerão aqui quando ficarem prontas.'
                  : 'Tente ajustar os filtros para encontrar o que procura.'}
              </p>
              {hasActiveFilters && (
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  size="sm"
                  className="mt-4"
                >
                  Limpar filtros
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                    notification.read
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-white border-blue-200 shadow-sm hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-full ${getTypeColor(notification.type)}`}>
                        {getTypeIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                            {notification.title}
                          </h3>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getTypeColor(notification.type)}`}
                          >
                            {getTypeLabel(notification.type)}
                          </Badge>
                          {!notification.read && (
                            <Badge variant="destructive" className="text-xs">
                              Novo
                            </Badge>
                          )}
                        </div>
                        
                        <p className={`text-sm ${notification.read ? 'text-gray-500' : 'text-gray-600'} mb-2`}>
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>
                            {formatDistanceToNow(new Date(notification.timestamp), {
                              addSuffix: true,
                              locale: ptBR
                            })}
                          </span>
                          {notification.jobId && (
                            <span className="font-mono">
                              ID: {notification.jobId.slice(-8)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
