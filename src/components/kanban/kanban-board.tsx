'use client'

import { useState } from 'react'
import { DndContext, DragEndEvent, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { useKanban } from '@/hooks/use-kanban'
import { KanbanColumn } from './kanban-column'
import { TaskCard } from './task-card'
import { CreateBoardDialog } from './create-board-dialog'
import { CreateTaskDialog } from './create-task-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Columns } from 'lucide-react'

interface KanbanBoardProps {
  projectId: string
}

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const { boards, loading, error, createBoard, moveTask } = useKanban(projectId)
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false)
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTaskId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTaskId(null)

    if (!over) return

    const taskId = active.id as string
    const overId = over.id as string

    // Se foi dropado em uma coluna
    if (overId.startsWith('board-')) {
      const boardId = overId.replace('board-', '')
      
      // Encontrar a posição no final da coluna
      const targetBoard = boards.find(board => board.id === boardId)
      const position = targetBoard ? targetBoard.tasks.length : 0

      try {
        await moveTask({
          taskId,
          boardId,
          position,
        })
      } catch (error) {
        console.error('Erro ao mover tarefa:', error)
      }
    }
  }

  const handleCreateTask = (boardId: string) => {
    setSelectedBoardId(boardId)
    setIsCreateTaskOpen(true)
  }

  if (loading) {
    return <KanbanSkeleton />
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">Erro ao carregar Kanban</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Criar boards padrão se não existir nenhum
  const handleCreateDefaultBoards = async () => {
    try {
      await createBoard('A Fazer', '#3b82f6')
      await createBoard('Em Andamento', '#f59e0b')
      await createBoard('Revisão', '#8b5cf6')
      await createBoard('Concluído', '#10b981')
    } catch (error) {
      console.error('Erro ao criar boards padrão:', error)
    }
  }

  if (boards.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <Columns className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Nenhum Board Encontrado</h3>
              <p className="text-muted-foreground mb-6">
                Crie boards para organizar suas tarefas no Kanban
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleCreateDefaultBoards}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Boards Padrão
              </Button>
              <Button variant="outline" onClick={() => setIsCreateBoardOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Board Customizado
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const activeTask = activeTaskId 
    ? boards.flatMap(board => board.tasks).find(task => task.id === activeTaskId)
    : null

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Boards do Projeto</h3>
          <p className="text-sm text-muted-foreground">
            {boards.length} {boards.length === 1 ? 'board' : 'boards'} • {' '}
            {boards.reduce((total, board) => total + board.tasks.length, 0)} tarefas
          </p>
        </div>
        <Button variant="outline" onClick={() => setIsCreateBoardOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Board
        </Button>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-4">
          <SortableContext items={boards.map(board => board.id)} strategy={horizontalListSortingStrategy}>
            {boards.map((board) => (
              <KanbanColumn
                key={board.id}
                board={board}
                onCreateTask={() => handleCreateTask(board.id)}
              />
            ))}
          </SortableContext>
        </div>

        {/* Drag Overlay */}
        {activeTask && (
          <div className="fixed pointer-events-none z-50">
            <TaskCard task={activeTask} isDragging />
          </div>
        )}
      </DndContext>

      {/* Dialogs */}
      <CreateBoardDialog
        projectId={projectId}
        open={isCreateBoardOpen}
        onOpenChange={setIsCreateBoardOpen}
      />

      <CreateTaskDialog
        projectId={projectId}
        boardId={selectedBoardId}
        open={isCreateTaskOpen}
        onOpenChange={setIsCreateTaskOpen}
      />
    </div>
  )
}

function KanbanSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      
      <div className="flex gap-6 overflow-x-auto">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="min-w-80 space-y-4">
            <Skeleton className="h-12 w-full" />
            {Array.from({ length: 3 }).map((_, j) => (
              <Skeleton key={j} className="h-24 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
} 