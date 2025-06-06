'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useKanban } from '@/hooks/use-kanban'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

const createBoardSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(50, 'Nome muito longo'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor inválida').optional(),
})

type CreateBoardForm = z.infer<typeof createBoardSchema>

interface CreateBoardDialogProps {
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const predefinedColors = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // yellow
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
  '#ec4899', // pink
  '#6b7280', // gray
]

export function CreateBoardDialog({ projectId, open, onOpenChange }: CreateBoardDialogProps) {
  const { createBoard } = useKanban(projectId)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<CreateBoardForm>({
    resolver: zodResolver(createBoardSchema),
    defaultValues: {
      name: '',
      color: predefinedColors[0],
    },
  })

  const handleSubmit = async (data: CreateBoardForm) => {
    try {
      setIsLoading(true)
      await createBoard(data.name, data.color)
      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error('Erro ao criar board:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const selectedColor = form.watch('color')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Novo Board</DialogTitle>
          <DialogDescription>
            Crie um novo board para organizar suas tarefas no Kanban.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Board</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: A Fazer, Em Andamento..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor do Board</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      {/* Cores predefinidas */}
                      <div className="grid grid-cols-5 gap-2">
                        {predefinedColors.map((color) => (
                          <button
                            key={color}
                            type="button"
                            className={`w-8 h-8 rounded-full border-2 transition-all ${
                              selectedColor === color
                                ? 'border-gray-900 scale-110'
                                : 'border-gray-300 hover:scale-105'
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => field.onChange(color)}
                          />
                        ))}
                      </div>
                      
                      {/* Input de cor customizada */}
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          className="w-12 h-8 p-0 border-0"
                          {...field}
                        />
                        <Input
                          placeholder="#3b82f6"
                          className="flex-1"
                          {...field}
                        />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Criar Board
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 