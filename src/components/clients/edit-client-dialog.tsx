'use client'

import { useState, useEffect } from 'react'
import { useClients, type Client, type UpdateClientData } from '@/hooks/use-clients'
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
import { Loader2 } from 'lucide-react'

interface EditClientDialogProps {
  client: Client
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditClientDialog({ client, open, onOpenChange }: EditClientDialogProps) {
  const [formData, setFormData] = useState<UpdateClientData>({
    name: '',
    email: '',
    phone: '',
    company: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { updateClient } = useClients()

  // Preencher formulário quando cliente mudar
  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        email: client.email || '',
        phone: client.phone || '',
        company: client.company || '',
      })
    }
  }, [client])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name?.trim()) {
      setError('Nome é obrigatório')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Preparar dados apenas com campos que mudaram
      const changedData: UpdateClientData = {}
      
      if (formData.name !== client.name) {
        changedData.name = formData.name
      }
      if (formData.email !== (client.email || '')) {
        changedData.email = formData.email || undefined
      }
      if (formData.phone !== (client.phone || '')) {
        changedData.phone = formData.phone || undefined
      }
      if (formData.company !== (client.company || '')) {
        changedData.company = formData.company || undefined
      }

      // Se não há mudanças, apenas fechar
      if (Object.keys(changedData).length === 0) {
        onOpenChange(false)
        return
      }

      await updateClient(client.id, changedData)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar cliente')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof UpdateClientData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
          <DialogDescription>
            Atualize as informações do cliente {client.name}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nome *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Nome do cliente"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="email@exemplo.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-phone">Telefone</Label>
            <Input
              id="edit-phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-company">Empresa</Label>
            <Input
              id="edit-company"
              value={formData.company}
              onChange={(e) => handleChange('company', e.target.value)}
              placeholder="Nome da empresa"
            />
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
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 