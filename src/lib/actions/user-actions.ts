"use server"

import { createSafeActionClient } from "next-safe-action"
import { z } from "zod"
import { db } from "@/lib/db"
import { requirePermission } from "@/lib/tenant"
import { Role } from "@prisma/client"
import { appErrors } from "@/lib/errors"
import bcrypt from "bcryptjs"

// Schema para convidar usuário
const inviteUserSchema = z.object({
  email: z.string().email("Email inválido"),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  role: z.nativeEnum(Role, { message: "Role inválido" }),
})

// Schema para atualizar role do usuário
const updateUserRoleSchema = z.object({
  userId: z.string().min(1, "ID do usuário é obrigatório"),
  role: z.nativeEnum(Role, { message: "Role inválido" }),
})

// Schema para atualizar perfil do usuário
const updateUserProfileSchema = z.object({
  userId: z.string().min(1, "ID do usuário é obrigatório"),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").optional(),
  email: z.string().email("Email inválido").optional(),
})

// Schema para remover usuário
const removeUserSchema = z.object({
  userId: z.string().min(1, "ID do usuário é obrigatório"),
})

// Schema para resetar senha
const resetPasswordSchema = z.object({
  userId: z.string().min(1, "ID do usuário é obrigatório"),
  newPassword: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
})

// Cliente de action que requer permissão de admin
const adminAction = createSafeActionClient()

// Cliente de action que requer permissão de owner
const ownerAction = createSafeActionClient()

/**
 * Convidar novo usuário para a agência
 * Apenas admins e owners podem convidar usuários
 */
export const inviteUser = adminAction
  .schema(inviteUserSchema)
  .action(async ({ parsedInput: { email, name, role } }) => {
    try {
      const context = await requirePermission(Role.ADMIN)

      // Verificar se email já existe na agência
      const existingUser = await db.user.findFirst({
        where: {
          email,
          agencyId: context.agencyId,
        },
      })

      if (existingUser) {
        throw appErrors.EMAIL_ALREADY_EXISTS
      }

      // Verificar se é tentativa de criar owner quando não é owner
      if (role === Role.OWNER && context.role !== Role.OWNER) {
        throw appErrors.UNAUTHORIZED
      }

      // Gerar senha temporária
      const tempPassword = Math.random().toString(36).slice(-8)
      const hashedPassword = await bcrypt.hash(tempPassword, 12)

      // Criar usuário
      const user = await db.user.create({
        data: {
          email,
          name,
          role,
          password: hashedPassword,
          agencyId: context.agencyId,
          emailVerified: null, // Usuário precisa verificar email
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          emailVerified: true,
        },
      })

      // TODO: Enviar email de convite com senha temporária
      console.log(`Usuário convidado: ${email} - Senha temporária: ${tempPassword}`)

      return {
        success: true,
        data: {
          user,
          tempPassword, // Em produção, isso seria enviado por email
        },
        message: "Usuário convidado com sucesso",
      }
    } catch (error) {
      console.error("Erro ao convidar usuário:", error)
      throw error
    }
  })

/**
 * Atualizar role de um usuário
 * Apenas owners podem alterar roles
 */
export const updateUserRole = ownerAction
  .schema(updateUserRoleSchema)
  .action(async ({ parsedInput: { userId, role } }) => {
    try {
      const context = await requirePermission(Role.OWNER)

      // Verificar se usuário existe e pertence à agência
      const user = await db.user.findFirst({
        where: {
          id: userId,
          agencyId: context.agencyId,
        },
      })

      if (!user) {
        throw appErrors.USER_NOT_FOUND
      }

      // Não permitir alterar próprio role
      if (user.id === context.userId) {
        throw new Error("Não é possível alterar seu próprio role")
      }

      // Atualizar role
      const updatedUser = await db.user.update({
        where: { id: userId },
        data: { role },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          updatedAt: true,
        },
      })

      return {
        success: true,
        data: updatedUser,
        message: "Role do usuário atualizado com sucesso",
      }
    } catch (error) {
      console.error("Erro ao atualizar role do usuário:", error)
      throw error
    }
  })

/**
 * Atualizar perfil de um usuário
 * Admins podem atualizar qualquer usuário, usuários podem atualizar próprio perfil
 */
export const updateUserProfile = adminAction
  .schema(updateUserProfileSchema)
  .action(async ({ parsedInput: { userId, name, email } }) => {
    try {
      const context = await requirePermission(Role.MEMBER)

      // Verificar se usuário existe e pertence à agência
      const user = await db.user.findFirst({
        where: {
          id: userId,
          agencyId: context.agencyId,
        },
      })

      if (!user) {
        throw appErrors.USER_NOT_FOUND
      }

      // Verificar permissões: admin pode editar qualquer um, usuário só pode editar a si mesmo
      if (context.role === Role.MEMBER && user.id !== context.userId) {
        throw appErrors.UNAUTHORIZED
      }

      // Se está alterando email, verificar se já existe
      if (email && email !== user.email) {
        const existingUser = await db.user.findFirst({
          where: {
            email,
            agencyId: context.agencyId,
            id: { not: userId },
          },
        })

        if (existingUser) {
          throw appErrors.EMAIL_ALREADY_EXISTS
        }
      }

      // Atualizar usuário
      const updatedUser = await db.user.update({
        where: { id: userId },
        data: {
          ...(name && { name }),
          ...(email && { email, emailVerified: null }), // Se mudou email, precisa verificar novamente
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          updatedAt: true,
          emailVerified: true,
        },
      })

      return {
        success: true,
        data: updatedUser,
        message: "Perfil atualizado com sucesso",
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil do usuário:", error)
      throw error
    }
  })

/**
 * Remover usuário da agência
 * Apenas owners podem remover usuários
 */
export const removeUser = ownerAction
  .schema(removeUserSchema)
  .action(async ({ parsedInput: { userId } }) => {
    try {
      const context = await requirePermission(Role.OWNER)

      // Verificar se usuário existe e pertence à agência
      const user = await db.user.findFirst({
        where: {
          id: userId,
          agencyId: context.agencyId,
        },
      })

      if (!user) {
        throw appErrors.USER_NOT_FOUND
      }

      // Não permitir remover a si mesmo
      if (user.id === context.userId) {
        throw new Error("Não é possível remover sua própria conta")
      }

      // Não permitir remover o último owner
      if (user.role === Role.OWNER) {
        const ownerCount = await db.user.count({
          where: {
            agencyId: context.agencyId,
            role: Role.OWNER,
          },
        })

        if (ownerCount <= 1) {
          throw new Error("Não é possível remover o último owner da agência")
        }
      }

      // Remover usuário
      await db.user.delete({
        where: { id: userId },
      })

      return {
        success: true,
        data: { userId },
        message: "Usuário removido com sucesso",
      }
    } catch (error) {
      console.error("Erro ao remover usuário:", error)
      throw error
    }
  })

/**
 * Resetar senha de um usuário
 * Apenas admins podem resetar senhas
 */
export const resetUserPassword = adminAction
  .schema(resetPasswordSchema)
  .action(async ({ parsedInput: { userId, newPassword } }) => {
    try {
      const context = await requirePermission(Role.ADMIN)

      // Verificar se usuário existe e pertence à agência
      const user = await db.user.findFirst({
        where: {
          id: userId,
          agencyId: context.agencyId,
        },
      })

      if (!user) {
        throw appErrors.USER_NOT_FOUND
      }

      // Hash da nova senha
      const hashedPassword = await bcrypt.hash(newPassword, 12)

      // Atualizar senha
      await db.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      })

      return {
        success: true,
        data: { userId },
        message: "Senha resetada com sucesso",
      }
    } catch (error) {
      console.error("Erro ao resetar senha do usuário:", error)
      throw error
    }
  })

/**
 * Listar usuários da agência
 * Todos os membros podem ver a lista de usuários
 */
export const listUsers = adminAction
  .schema(z.object({}))
  .action(async () => {
    try {
      const context = await requirePermission(Role.MEMBER)

      const users = await db.user.findMany({
        where: {
          agencyId: context.agencyId,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          emailVerified: true,
        },
        orderBy: [
          { role: 'asc' }, // Owners primeiro
          { createdAt: 'asc' },
        ],
      })

      return {
        success: true,
        data: users,
        message: "Usuários listados com sucesso",
      }
    } catch (error) {
      console.error("Erro ao listar usuários:", error)
      throw error
    }
  })
