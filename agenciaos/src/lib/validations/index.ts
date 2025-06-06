// Exportar todos os schemas de validação
export * from './auth'
export * from './clients'
export * from './projects'
export * from './financial'

// Schemas comuns
import { z } from 'zod'

// Schema para parâmetros de ID
export const idParamSchema = z.object({
  id: z.string().min(1, "ID é obrigatório")
})

// Schema para paginação
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10)
})

// Schema para ordenação
export const sortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

// Schema para busca
export const searchSchema = z.object({
  search: z.string().optional()
})

// Schema para filtros de data
export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate)
  }
  return true
}, {
  message: "Data de fim deve ser posterior ou igual à data de início",
  path: ["endDate"]
})

// Tipos TypeScript derivados dos schemas comuns
export type IdParam = z.infer<typeof idParamSchema>
export type Pagination = z.infer<typeof paginationSchema>
export type Sort = z.infer<typeof sortSchema>
export type Search = z.infer<typeof searchSchema>
export type DateRange = z.infer<typeof dateRangeSchema>
