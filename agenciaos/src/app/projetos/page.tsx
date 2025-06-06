'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { ProjectsList } from '@/components/projects/projects-list'
import { CreateProjectDialog } from '@/components/projects/create-project-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SimpleSelect, SimpleSelectItem } from '@/components/ui/simple-select'
import { Plus, Search, Filter } from 'lucide-react'

export default function ProjectsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projetos"
        description="Gerencie seus projetos e acompanhe o progresso"
        action={
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Projeto
          </Button>
        }
      />

      {/* Filtros */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar projetos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <SimpleSelect 
            value={statusFilter} 
            onValueChange={setStatusFilter}
            placeholder="Filtrar por status"
            className="w-48"
          >
            <SimpleSelectItem value="">Todos os status</SimpleSelectItem>
            <SimpleSelectItem value="PLANNING">Planejamento</SimpleSelectItem>
            <SimpleSelectItem value="IN_PROGRESS">Em Progresso</SimpleSelectItem>
            <SimpleSelectItem value="REVIEW">Revisão</SimpleSelectItem>
            <SimpleSelectItem value="COMPLETED">Concluído</SimpleSelectItem>
            <SimpleSelectItem value="CANCELLED">Cancelado</SimpleSelectItem>
          </SimpleSelect>
        </div>
      </div>

      {/* Lista de Projetos */}
      <ProjectsList search={search} statusFilter={statusFilter} />

      {/* Dialog de Criação */}
      <CreateProjectDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  )
} 