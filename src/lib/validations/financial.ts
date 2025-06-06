import { z } from 'zod'

// Schema para criação de receita
export const createRevenueSchema = z.object({
  description: z.string()
    .min(2, "Descrição deve ter pelo menos 2 caracteres")
    .max(200, "Descrição não pode exceder 200 caracteres"),
  amount: z.number()
    .positive("Valor deve ser positivo")
    .max(999999999.99, "Valor muito alto"),
  category: z.string()
    .min(2, "Categoria deve ter pelo menos 2 caracteres")
    .max(50, "Categoria não pode exceder 50 caracteres"),
  clientId: z.string()
    .min(1, "Cliente é obrigatório")
    .optional(),
  projectId: z.string()
    .min(1, "Projeto é obrigatório")
    .optional(),
  isRecurring: z.boolean()
    .default(false),
  date: z.string()
    .datetime("Data inválida")
})

// Schema para atualização de receita
export const updateRevenueSchema = createRevenueSchema.partial()

// Schema para criação de despesa
export const createExpenseSchema = z.object({
  description: z.string()
    .min(2, "Descrição deve ter pelo menos 2 caracteres")
    .max(200, "Descrição não pode exceder 200 caracteres"),
  amount: z.number()
    .positive("Valor deve ser positivo")
    .max(999999999.99, "Valor muito alto"),
  category: z.string()
    .min(2, "Categoria deve ter pelo menos 2 caracteres")
    .max(50, "Categoria não pode exceder 50 caracteres"),
  date: z.string()
    .datetime("Data inválida")
})

// Schema para atualização de despesa
export const updateExpenseSchema = createExpenseSchema.partial()

// Schema para query de receitas
export const revenuesQuerySchema = z.object({
  clientId: z.string().optional(),
  projectId: z.string().optional(),
  category: z.string().optional(),
  isRecurring: z.coerce.boolean().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10)
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate)
  }
  return true
}, {
  message: "Data de fim deve ser posterior ou igual à data de início",
  path: ["endDate"]
})

// Schema para query de despesas
export const expensesQuerySchema = z.object({
  category: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10)
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate)
  }
  return true
}, {
  message: "Data de fim deve ser posterior ou igual à data de início",
  path: ["endDate"]
})

// Schema para relatórios financeiros
export const financialStatsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  groupBy: z.enum(['day', 'week', 'month', 'year']).default('month')
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate)
  }
  return true
}, {
  message: "Data de fim deve ser posterior ou igual à data de início",
  path: ["endDate"]
})

// Tipos TypeScript derivados dos schemas
export type CreateRevenueInput = z.infer<typeof createRevenueSchema>
export type UpdateRevenueInput = z.infer<typeof updateRevenueSchema>
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>
export type RevenuesQuery = z.infer<typeof revenuesQuerySchema>
export type ExpensesQuery = z.infer<typeof expensesQuerySchema>
export type FinancialStatsQuery = z.infer<typeof financialStatsQuerySchema>
