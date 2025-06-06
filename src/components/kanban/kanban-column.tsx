'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { TaskCard } from './task-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, MoreHorizontal } from 'lucide-react'
import { Board, Task } from '@prisma/client'

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

interface KanbanColumnProps {
  board: BoardWithTasks
  onCreateTask: () => void
}

export function KanbanColumn({ board, onCreateTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `board-${board.id}`,
  })

  return (
    <Card className={`min-w-80 max-w-80 ${isOver ? 'ring-2 ring-blue-500' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {board.color && (
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: board.color }}
              />
            )}
            <CardTitle className="text-sm font-medium">{board.name}</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {board.tasks.length}
            </Badge>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div
          ref={setNodeRef}
          className={`space-y-3 min-h-32 p-2 rounded-lg transition-colors ${
            isOver ? 'bg-blue-50' : 'bg-gray-50/50'
          }`}
        >
          <SortableContext 
            items={board.tasks.map(task => task.id)} 
            strategy={verticalListSortingStrategy}
          >
            {board.tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </SortableContext>
          
          {board.tasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Nenhuma tarefa
            </div>
          )}
        </div>
        
        <Button
          variant="ghost"
          className="w-full mt-3 justify-start text-muted-foreground hover:text-foreground"
          onClick={onCreateTask}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar tarefa
        </Button>
      </CardContent>
    </Card>
  )
}
