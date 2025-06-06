'use client'

import { useProjects } from '@/hooks/use-projects'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ProjectStatus } from '@prisma/client'

interface ProjectSelectorProps {
  selectedProjectId: string | null
  onProjectSelect: (projectId: string | null) => void
}

const statusLabels = {
  [ProjectStatus.PLANNING]: 'Planejamento',
  [ProjectStatus.IN_PROGRESS]: 'Em Andamento',
  [ProjectStatus.REVIEW]: 'Revisão',
  [ProjectStatus.COMPLETED]: 'Concluído',
  [ProjectStatus.CANCELLED]: 'Cancelado',
}

const statusColors = {
  [ProjectStatus.PLANNING]: 'bg-blue-100 text-blue-800',
  [ProjectStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
  [ProjectStatus.REVIEW]: 'bg-purple-100 text-purple-800',
  [ProjectStatus.COMPLETED]: 'bg-green-100 text-green-800',
  [ProjectStatus.CANCELLED]: 'bg-red-100 text-red-800',
}

export function ProjectSelector({ selectedProjectId, onProjectSelect }: ProjectSelectorProps) {
  const { projects, loading, error } = useProjects()

  if (loading) {
    return <Skeleton className="h-10 w-full" />
  }

  if (error) {
    return (
      <div className="text-red-600 text-sm">
        Erro ao carregar projetos: {error}
      </div>
    )
  }

  // Filtrar apenas projetos ativos para o Kanban
  const activeProjects = projects.filter(project => 
    project.status === ProjectStatus.PLANNING || 
    project.status === ProjectStatus.IN_PROGRESS ||
    project.status === ProjectStatus.REVIEW
  )

  if (activeProjects.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">
          Nenhum projeto ativo encontrado
        </p>
        <p className="text-sm text-muted-foreground">
          Crie um projeto primeiro para usar o Kanban
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Select
        value={selectedProjectId || ''}
        onValueChange={(value) => onProjectSelect(value || null)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione um projeto..." />
        </SelectTrigger>
        <SelectContent>
          {activeProjects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span>{project.name}</span>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${statusColors[project.status as keyof typeof statusColors]}`}
                  >
                    {statusLabels[project.status as keyof typeof statusLabels]}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground ml-2">
                  {project.client.name}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedProjectId && (
        <div className="p-4 bg-muted rounded-lg">
          {(() => {
            const selectedProject = activeProjects.find(p => p.id === selectedProjectId)
            if (!selectedProject) return null

            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{selectedProject.name}</h4>
                  <Badge className={statusColors[selectedProject.status as keyof typeof statusColors]}>
                    {statusLabels[selectedProject.status as keyof typeof statusLabels]}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Cliente: {selectedProject.client.name}
                </p>
                {selectedProject.description && (
                  <p className="text-sm text-muted-foreground">
                    {selectedProject.description}
                  </p>
                )}
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
