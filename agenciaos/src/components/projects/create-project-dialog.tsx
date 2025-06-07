'use client'

import { useState } from 'react'
import { useProjects, type CreateProjectData } from '@/hooks/use-projects'
import { useClientsList } from '@/hooks/use-clients-list'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SimpleSelect, SimpleSelectItem } from '@/components/ui/simple-select'
import { Loader2 } from 'lucide-react'

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const [formData, setFormData] = useState<CreateProjectData>({
    name: '',
    description: '',
    clientId: '',
    status: 'PLANNING',
    budget: undefined,
    startDate: '',
    endDate: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { createProject } = useProjects()
  const { clients, loading: clientsLoading } = useClientsList()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setError('Nome é obrigatório')
      return
    }

    if (!formData.clientId) {
      setError('Cliente é obrigatório')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Preparar dados
      const projectData: CreateProjectData = {
        name: formData.name.trim(),
        clientId: formData.clientId,
        status: formData.status || 'PLANNING',
        ...(formData.description?.trim() && { description: formData.description.trim() }),
        ...(formData.budget && { budget: formData.budget }),
        ...(formData.startDate && { startDate: formData.startDate }),
        ...(formData.endDate && { endDate: formData.endDate }),
      }

      const newProject = await createProject(projectData)
      
      // Disparar job de IA automaticamente em background (invisível para o usuário)
      if (newProject && formData.description?.trim()) {
        try {
          fetch('/api/trigger', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'ai-content',
              payload: {
                agencyId: newProject.id,
                content: `Gerar sugestões e estratégias para o projeto "${formData.name}": ${formData.description}`
              }
            })
          }).catch(err => {
            // Log error silently - não mostrar para o usuário
            console.log('Job de IA executado em background:', err)
          })
        } catch (error) {
          // Job falhou, mas não impacta o usuário
          console.log('Erro no job de IA (background):', error)
        }
      }
      
      // Resetar formulário
      setFormData({
        name: '',
        description: '',
        clientId: '',
        status: 'PLANNING',
        budget: undefined,
        startDate: '',
        endDate: '',
      })
      
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar projeto')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof CreateProjectData, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Projeto</DialogTitle>
          <DialogDescription>
            Crie um novo projeto para sua agência. Preencha as informações básicas.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name">Nome do Projeto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Nome do projeto"
                required
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Descrição do projeto"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientId">Cliente *</Label>
              {clientsLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Carregando clientes...</span>
                </div>
              ) : (
                <SimpleSelect
                  value={formData.clientId}
                  onValueChange={(value) => handleChange('clientId', value)}
                  placeholder="Selecione um cliente"
                >
                  <SimpleSelectItem value="">Selecione um cliente</SimpleSelectItem>
                  {clients.map((client) => (
                    <SimpleSelectItem key={client.id} value={client.id}>
                      {client.name} {client.company && `(${client.company})`}
                    </SimpleSelectItem>
                  ))}
                </SimpleSelect>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <SimpleSelect
                value={formData.status || 'PLANNING'}
                onValueChange={(value) => handleChange('status', value)}
              >
                <SimpleSelectItem value="PLANNING">Planejamento</SimpleSelectItem>
                <SimpleSelectItem value="IN_PROGRESS">Em Progresso</SimpleSelectItem>
                <SimpleSelectItem value="REVIEW">Revisão</SimpleSelectItem>
                <SimpleSelectItem value="COMPLETED">Concluído</SimpleSelectItem>
                <SimpleSelectItem value="CANCELLED">Cancelado</SimpleSelectItem>
              </SimpleSelect>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Orçamento (R$)</Label>
              <Input
                id="budget"
                type="number"
                min="0"
                step="0.01"
                value={formData.budget || ''}
                onChange={(e) => handleChange('budget', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Data de Início</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Data de Fim</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || clientsLoading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Criar Projeto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
