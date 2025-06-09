"use server"

import { createSafeActionClient } from "next-safe-action"
import { z } from "zod"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { signIn } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AuthError } from "next-auth"

// Schema para registro
const registerSchema = z.object({
  name: z.string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome não pode exceder 100 caracteres"),
  email: z.string()
    .email("Email inválido")
    .max(100, "Email não pode exceder 100 caracteres"),
  agencyName: z.string()
    .min(2, "Nome da agência deve ter pelo menos 2 caracteres")
    .max(100, "Nome da agência não pode exceder 100 caracteres"),
  password: z.string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .max(100, "Senha não pode exceder 100 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
})

// Schema para login
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
})

// Cliente de action público (sem autenticação)
const publicAction = createSafeActionClient()

/**
 * Registrar novo usuário e agência
 */
export const registerAction = publicAction
  .schema(registerSchema)
  .action(async ({ parsedInput: { name, email, agencyName, password } }) => {
    try {
      // Verificar se o usuário já existe
      const existingUser = await db.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        return {
          success: false,
          error: "Usuário já existe com este email"
        }
      }

      // Criar slug para a agência
      const agencySlug = agencyName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")

      // Verificar se o slug já existe
      const existingAgency = await db.agency.findUnique({
        where: { slug: agencySlug }
      })

      if (existingAgency) {
        return {
          success: false,
          error: "Nome da agência já está em uso"
        }
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 12)

      // Criar usuário e agência em uma transação
      const result = await db.$transaction(async (tx) => {
        // Criar usuário temporário para obter ID
        const user = await tx.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            role: "OWNER",
          }
        })

        // Criar agência com o usuário como owner
        const agency = await tx.agency.create({
          data: {
            name: agencyName,
            slug: agencySlug,
            ownerId: user.id,
            plan: "FREE"
          }
        })

        // Atualizar usuário com agencyId
        const updatedUser = await tx.user.update({
          where: { id: user.id },
          data: { agencyId: agency.id }
        })

        return { user: updatedUser, agency }
      })

      return {
        success: true,
        data: {
          user: {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email
          },
          agency: {
            id: result.agency.id,
            name: result.agency.name,
            slug: result.agency.slug
          }
        },
        message: "Conta criada com sucesso!"
      }
    } catch (error) {
      console.error("Erro ao registrar usuário:", error)
      return {
        success: false,
        error: "Erro interno do servidor. Tente novamente."
      }
    }
  })

/**
 * Login do usuário
 */
export const loginAction = publicAction
  .schema(loginSchema)
  .action(async ({ parsedInput: { email, password } }) => {
    try {
      await signIn("credentials", {
        email,
        password,
        redirectTo: "/dashboard"
      })

      return {
        success: true,
        message: "Login realizado com sucesso!"
      }
    } catch (error) {
      console.error("Erro no login:", error)
      
      if (error instanceof AuthError) {
        switch (error.type) {
          case "CredentialsSignin":
            return {
              success: false,
              error: "Email ou senha incorretos"
            }
          default:
            return {
              success: false,
              error: "Erro no sistema de autenticação"
            }
        }
      }

      return {
        success: false,
        error: "Erro interno do servidor. Tente novamente."
      }
    }
  })

/**
 * Logout do usuário
 */
export const logoutAction = async () => {
  redirect("/auth/signin")
}
