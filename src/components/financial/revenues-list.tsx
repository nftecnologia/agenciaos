'use client'

import { useState } from 'react'
import { useRevenues, type Revenue, type CreateRevenueData } from '@/hooks/use-revenues'
import { useClientsList } from '@/hooks/use-clients-list'
import { useProjectsList } from '@/hooks/use-projects-list'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Plus, Search, MoreHorizontal, Edit, Trash2, DollarSign, Calendar, Building, FolderOpen, Repeat } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export function RevenuesList() {
  const {
    revenues,
    pagination,
    loading,
    error,
    filters,
    createRevenue,
    deleteRevenue,
    updateFilters,
    goToPage,
  } = useRevenues()

  const { clients } = useClientsList()
  const { projects } = useProjectsList()

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedRevenue, setSelectedRevenue] = useState<Revenue | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState<CreateRevenueData>({
    description: '',
    amount: 0,
    category: '',
    clientId: '',
    projectId: '',
    isRecurring: false,
    date: new Date().toISOString().split('T')[0],
  })

  const handleCreateRevenue = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await createRevenue({
        ...formData,
        clientId: formData.clientId || undefined,
        projectId: formData.projectId || undefined,
      })
      
      setCreateDialogOpen(false)
      setFormData({
        description: '',
        amount: 0,
        category: '',
        clientId: '',
        projectId: '',
        isRecurring: false,
        date: new Date().toISOString().split('T')[0],
      })
    } catch (error) {
      console.error('Erro ao criar receita:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteRevenue = async () => {
    if (!selectedRevenue) return

    setIsSubmitting(true)
    try {
      await deleteRevenue(selectedRevenue.id)
      setDeleteDialogOpen(false)
      setSelectedRevenue(null)
    } catch (error) {
      console.error('Erro ao deletar receita:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <p>Erro ao carregar receitas</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filtros e Ações */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar receitas..."
              value={filters.search || ''}
              onChange={(e) => updateFilters({ search: e.target.value, page: 1 })}
              className="pl-10"
            />
          </div>
          <Select
            value={filters.category || 'all'}
            onValueChange={(value) => updateFilters({ category: value === 'all' ? undefined : value, page: 1 })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="Serviços">Serviços</SelectItem>
              <SelectItem value="Produtos">Produtos</SelectItem>
              <SelectItem value="Consultoria">Consultoria</SelectItem>
              <SelectItem value="Assinatura">Assinatura</SelectItem>
              <SelectItem value="Outros">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Receita
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleCreateRevenue}>
              <DialogHeader>
                <DialogTitle>Nova Receita</DialogTitle>
                <DialogDescription>
                  Adicione uma nova receita à sua agência
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descrição da receita..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Valor</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={formData.amount || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">Data</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Serviços">Serviços</SelectItem>
                      <SelectItem value="Produtos">Produtos</SelectItem>
                      <SelectItem value="Consultoria">Consultoria</SelectItem>
                      <SelectItem value="Assinatura">Assinatura</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="client">Cliente (opcional)</Label>
                  <Select
                    value={formData.clientId || 'none'}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, clientId: value === 'none' ? '' : value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum cliente</SelectItem>
                      {clients.filter(client => client.id && client.id.trim() !== '').map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name} {client.company && `(${client.company})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="project">Projeto (opcional)</Label>
                  <Select
                    value={formData.projectId || 'none'}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value === 'none' ? '' : value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um projeto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum projeto</SelectItem>
                      {projects.filter(project => project.id && project.id.trim() !== '').map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isRecurring"
                    checked={formData.isRecurring}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isRecurring: !!checked }))}
                  />
                  <Label htmlFor="isRecurring">Receita recorrente</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Criando...' : 'Criar Receita'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Receitas */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[250px]" />
                    <div className="flex gap-2">
                      <Skeleton className="h-3 w-[100px]" />
                      <Skeleton className="h-3 w-[80px]" />
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <Skeleton className="h-6 w-[100px]" />
                    <Skeleton className="h-3 w-[80px]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : revenues.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma receita encontrada</p>
                <p className="text-sm mt-1">
                  {filters.search || filters.category 
                    ? 'Tente ajustar os filtros de busca'
                    : 'Comece criando sua primeira receita'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          revenues.map((revenue) => (
            <Card key={revenue.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{revenue.description}</h3>
                      {revenue.isRecurring && (
                        <Badge variant="secondary" className="text-xs">
                          <Repeat className="h-3 w-3 mr-1" />
                          Recorrente
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(revenue.date)}
                      </div>
                      <Badge variant="outline">{revenue.category}</Badge>
                      {revenue.client && (
                        <div className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {revenue.client.name}
                        </div>
                      )}
                      {revenue.project && (
                        <div className="flex items-center gap-1">
                          <FolderOpen className="h-3 w-3" />
                          {revenue.project.name}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="text-lg font-semibold text-green-600">
                      {formatCurrency(revenue.amount)}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setSelectedRevenue(revenue)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Deletar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Paginação */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {revenues.length} de {pagination.total} receitas
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(pagination.page - 1)}
              disabled={!pagination.hasPrev}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(pagination.page + 1)}
              disabled={!pagination.hasNext}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      {/* Dialog de Confirmação de Deleção */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deletar Receita</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar a receita &quot;{selectedRevenue?.description}&quot;?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteRevenue} disabled={isSubmitting}>
              {isSubmitting ? 'Deletando...' : 'Deletar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
