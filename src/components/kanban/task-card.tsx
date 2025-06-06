'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  Clock, 
  AlertCircle, 
  Circle,
  MoreHorizontal
} from 'lucide-react'
import { Task } from '@prisma/client'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface TaskWithAssignee extends Task {
  assignee?: {
    id: string
    name: string | null
    email: string
  } | null
}

interface TaskCardProps {
  task: TaskWithAssignee
  isDragging?: boolean
}

export function TaskCard({ task, isDragging = false }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'Urgente'
      case 'HIGH':
        return 'Alta'
      case 'MEDIUM':
        return 'Média'
      case 'LOW':
        return 'Baixa'
      default:
        return priority
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <AlertCircle className="h-3 w-3 text-red-600" />
      case 'HIGH':
        return <AlertCircle className="h-3 w-3 text-orange-600" />
      case 'MEDIUM':
        return <Clock className="h-3 w-3 text-blue-600" />
      case 'LOW':
        return <Circle className="h-3 w-3 text-gray-400" />
      default:
        return <Circle className="h-3 w-3 text-gray-400" />
    }
  }

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date()

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${
        isDragging || isSortableDragging ? 'opacity-50 rotate-3 shadow-lg' : ''
      } ${isOverdue ? 'border-red-200' : ''}`}
    >
      <CardContent className="p-3 space-y-3">
        {/* Header com prioridade e ações */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getPriorityIcon(task.priority)}
            <Badge 
              variant="outline" 
              className={`text-xs ${getPriorityColor(task.priority)}`}
            >
              {getPriorityLabel(task.priority)}
            </Badge>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </div>

        {/* Título e descrição */}
        <div className="space-y-1">
          <h4 className="text-sm font-medium leading-tight line-clamp-2">
            {task.title}
          </h4>
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}
        </div>

        {/* Data de vencimento */}
        {task.dueDate && (
          <div className={`flex items-center gap-1 text-xs ${
            isOverdue ? 'text-red-600' : 'text-muted-foreground'
          }`}>
            {isOverdue ? (
              <AlertCircle className="h-3 w-3" />
            ) : (
              <Calendar className="h-3 w-3" />
            )}
            <span>
              {format(new Date(task.dueDate), 'dd/MM/yyyy', { locale: ptBR })}
            </span>
            {isOverdue && (
              <Badge variant="destructive" className="text-xs ml-1">
                Atrasada
              </Badge>
            )}
          </div>
        )}

        {/* Assignee */}
        {task.assignee && (
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarImage src="" />
              <AvatarFallback className="text-xs">
                {task.assignee.name?.charAt(0) || task.assignee.email.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate">
              {task.assignee.name || task.assignee.email}
            </span>
          </div>
        )}


      </CardContent>
    </Card>
  )
}
