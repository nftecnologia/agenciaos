import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format, isToday, isTomorrow, isPast } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CheckSquare, Clock, AlertTriangle, User } from 'lucide-react'

interface Task {
  id: string
  title: string
  project: string
  assignee: string
  dueDate: string | null
  priority: string
}

interface PendingTasksProps {
  tasks: Task[]
  loading?: boolean
}

const priorityConfig = {
  LOW: { label: 'Baixa', color: 'bg-gray-100 text-gray-800', icon: null },
  MEDIUM: { label: 'Média', color: 'bg-blue-100 text-blue-800', icon: null },
  HIGH: { label: 'Alta', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
  URGENT: { label: 'Urgente', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
}

export function PendingTasks({ tasks, loading = false }: PendingTasksProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Tarefas Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                <div className="flex items-center gap-2">
                  <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                  <div className="h-5 w-12 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Tarefas Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma tarefa pendente</p>
            <p className="text-sm">Todas as tarefas estão em dia!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) return { text: 'Sem prazo', color: 'text-muted-foreground' }
    
    const date = new Date(dueDate)
    
    if (isPast(date) && !isToday(date)) {
      return { 
        text: `Atrasada - ${format(date, 'dd/MM', { locale: ptBR })}`, 
        color: 'text-red-600' 
      }
    }
    
    if (isToday(date)) {
      return { text: 'Hoje', color: 'text-orange-600' }
    }
    
    if (isTomorrow(date)) {
      return { text: 'Amanhã', color: 'text-yellow-600' }
    }
    
    return { 
      text: format(date, 'dd/MM', { locale: ptBR }), 
      color: 'text-muted-foreground' 
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5" />
          Tarefas Pendentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => {
            const priority = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.MEDIUM
            const dueDate = formatDueDate(task.dueDate)
            const PriorityIcon = priority.icon
            
            return (
              <div key={task.id} className="space-y-2">
                <p className="text-sm font-medium leading-none">
                  {task.title}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{task.project}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {task.assignee}
                  </div>
                  <span>•</span>
                  <div className={`flex items-center gap-1 ${dueDate.color}`}>
                    <Clock className="h-3 w-3" />
                    {dueDate.text}
                  </div>
                  <Badge variant="secondary" className={`${priority.color} ml-auto`}>
                    {PriorityIcon && <PriorityIcon className="h-3 w-3 mr-1" />}
                    {priority.label}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
} 