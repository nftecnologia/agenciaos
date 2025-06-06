import { z } from 'zod'
import { ProjectStatus, Priority } from '@prisma/client'

// Schema base para projeto
const baseProjectSchema = z.object({
  name: z.string()
    .min(2, "Nome do projeto deve ter pelo menos 2 caracteres")
    .max(100, "Nome do projeto não pode exceder 100 caracteres"),
  description: z.string()
    .max(500, "Descrição não pode exceder 500 caracteres")
    .optional(),
  clientId: z.string()
    .min(1, "Cliente é obrigatório"),
  budget: z.number()
    .positive("Orçamento deve ser positivo")
    .optional(),
  startDate: z.string()
    .datetime("Data de início inválida")
    .optional(),
  endDate: z.string()
    .datetime("Data de fim inválida")
    .optional()
})

// Schema para criação de projeto
export const createProjectSchema = baseProjectSchema.refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) < new Date(data.endDate)
  }
  return true
}, {
  message: "Data de fim deve ser posterior à data de início",
  path: ["endDate"]
})

// Schema para atualização de projeto
export const updateProjectSchema = baseProjectSchema.partial().refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) < new Date(data.endDate)
  }
  return true
}, {
  message: "Data de fim deve ser posterior à data de início",
  path: ["endDate"]
})

// Schema para criação de board
export const createBoardSchema = z.object({
  projectId: z.string()
    .min(1, "ID do projeto é obrigatório"),
  name: z.string()
    .min(1, "Nome do board é obrigatório")
    .max(50, "Nome do board não pode exceder 50 caracteres"),
  color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, "Cor deve estar no formato hexadecimal")
    .optional()
})

// Schema para atualização de board
export const updateBoardSchema = z.object({
  name: z.string()
    .min(1, "Nome do board é obrigatório")
    .max(50, "Nome do board não pode exceder 50 caracteres")
    .optional(),
  color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, "Cor deve estar no formato hexadecimal")
    .optional()
})

// Schema para criação de task
export const createTaskSchema = z.object({
  projectId: z.string()
    .min(1, "ID do projeto é obrigatório"),
  boardId: z.string()
    .min(1, "ID do board é obrigatório"),
  title: z.string()
    .min(1, "Título da task é obrigatório")
    .max(100, "Título não pode exceder 100 caracteres"),
  description: z.string()
    .max(1000, "Descrição não pode exceder 1000 caracteres")
    .optional(),
  priority: z.nativeEnum(Priority)
    .optional()
    .default(Priority.MEDIUM),
  assignedTo: z.string()
    .optional(),
  dueDate: z.string()
    .datetime("Data de vencimento inválida")
    .optional()
})

// Schema para atualização de task
export const updateTaskSchema = createTaskSchema.partial().omit({
  projectId: true,
  boardId: true
})

// Schema para mover task
export const moveTaskSchema = z.object({
  taskId: z.string()
    .min(1, "ID da task é obrigatório"),
  boardId: z.string()
    .min(1, "ID do board é obrigatório"),
  position: z.number()
    .int("Posição deve ser um número inteiro")
    .min(0, "Posição deve ser maior ou igual a 0")
})

// Schema para query de projetos
export const projectsQuerySchema = z.object({
  status: z.nativeEnum(ProjectStatus).optional(),
  clientId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10)
})

// Schema para query de boards
export const boardsQuerySchema = z.object({
  projectId: z.string().min(1, "ID do projeto é obrigatório")
})

// Tipos TypeScript derivados dos schemas
export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
export type CreateBoardInput = z.infer<typeof createBoardSchema>
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>
export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type MoveTaskInput = z.infer<typeof moveTaskSchema>
export type ProjectsQuery = z.infer<typeof projectsQuerySchema>
export type BoardsQuery = z.infer<typeof boardsQuerySchema>
