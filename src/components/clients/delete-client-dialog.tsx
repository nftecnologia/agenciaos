'use client'

import { useState } from 'react'
import { useClients, type Client } from '@/hooks/use-clients'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, AlertTriangle } from 'lucide-react'

interface DeleteClientDialogProps {
  client: Client
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteClientDialog({ client, open, onOpenChange }: DeleteClientDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { deleteClient } = useClients()

  const handleDelete = async () => {
    try {
      setLoading(true)
      setError(null)

      await deleteClient(client.id)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar cliente')
    } finally {
      setLoading(false)
    }
  }

  const hasProjects = client._count.projects > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Deletar Cliente
          </DialogTitle>
          <DialogDescription>
            Esta ação não pode ser desfeita. O cliente será permanentemente removido.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">{client.name}</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              {client.email && <p>Email: {client.email}</p>}
              {client.company && <p>Empresa: {client.company}</p>}
              <p>Projetos: {client._count.projects}</p>
            </div>
          </div>

          {hasProjects && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-red-800 mb-1">
                    Cliente possui projetos associados
                  </p>
                  <p className="text-red-700">
                    Este cliente possui {client._count.projects} projeto{client._count.projects !== 1 ? 's' : ''} associado{client._count.projects !== 1 ? 's' : ''}. 
                    Você deve remover ou transferir os projetos antes de deletar o cliente.
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading || hasProjects}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Deletar Cliente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 