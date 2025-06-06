import { z } from 'zod'

// Schema para registro de usuário
export const registerSchema = z.object({
  name: z.string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(50, "Nome não pode exceder 50 caracteres"),
  email: z.string()
    .email("Email inválido")
    .max(100, "Email não pode exceder 100 caracteres"),
  password: z.string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .max(100, "Senha não pode exceder 100 caracteres"),
  agencyName: z.string()
    .min(2, "Nome da agência deve ter pelo menos 2 caracteres")
    .max(100, "Nome da agência não pode exceder 100 caracteres")
})

// Schema para login
export const loginSchema = z.object({
  email: z.string()
    .email("Email inválido")
    .max(100, "Email não pode exceder 100 caracteres"),
  password: z.string()
    .min(1, "Senha é obrigatória")
    .max(100, "Senha não pode exceder 100 caracteres")
})

// Schema para redefinição de senha
export const resetPasswordSchema = z.object({
  email: z.string()
    .email("Email inválido")
    .max(100, "Email não pode exceder 100 caracteres")
})

// Schema para nova senha
export const newPasswordSchema = z.object({
  password: z.string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .max(100, "Senha não pode exceder 100 caracteres"),
  confirmPassword: z.string()
    .min(6, "Confirmação de senha deve ter pelo menos 6 caracteres")
    .max(100, "Confirmação de senha não pode exceder 100 caracteres")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"]
})

// Tipos TypeScript derivados dos schemas
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type NewPasswordInput = z.infer<typeof newPasswordSchema>
