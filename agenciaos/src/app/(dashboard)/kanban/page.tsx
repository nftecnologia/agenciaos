'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { KanbanBoard } from '@/components/kanban/kanban-board'
import { ProjectSelector } from '@/components/kanban/project-selector'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Kanban as KanbanIcon } from 'lucide-react'

export default function KanbanPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kanban"
        description="Gerencie tarefas e projetos com quadros visuais"
        action={
          selectedProjectId ? (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Tarefa
            </Button>
          ) : undefined
        }
      />

      {/* Seletor de Projeto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KanbanIcon className="h-5 w-5" />
            Selecionar Projeto
          </CardTitle>
          <CardDescription>
            Escolha um projeto para visualizar e gerenciar suas tarefas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectSelector
            selectedProjectId={selectedProjectId}
            onProjectSelect={setSelectedProjectId}
          />
        </CardContent>
      </Card>

      {/* Board do Kanban */}
      {selectedProjectId ? (
        <KanbanBoard projectId={selectedProjectId} />
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <KanbanIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Selecione um Projeto</h3>
              <p className="text-muted-foreground">
                Escolha um projeto acima para começar a gerenciar suas tarefas no Kanban
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 