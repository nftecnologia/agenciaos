"use server"

import { createSafeActionClient } from "next-safe-action"
import { z } from "zod"
import { db } from "@/lib/db"
import { requirePermission } from "@/lib/tenant"
import { Role } from "@prisma/client"
import { appErrors } from "@/lib/errors"
import { revalidatePath } from "next/cache"

// Schema para criação de cliente
const createClientSchema = z.object({
  name: z.string()
    .min(2, "Nome do cliente deve ter pelo menos 2 caracteres")
    .max(100, "Nome do cliente não pode exceder 100 caracteres"),
  email: z.string()
    .email("Email inválido")
    .max(100, "Email não pode exceder 100 caracteres")
    .optional(),
  phone: z.string()
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, "Telefone deve estar no formato (XX) XXXXX-XXXX")
    .optional(),
  company: z.string()
    .max(100, "Nome da empresa não pode exceder 100 caracteres")
    .optional(),
  address: z.object({
    street: z.string().max(200, "Endereço não pode exceder 200 caracteres").optional(),
    city: z.string().max(100, "Cidade não pode exceder 100 caracteres").optional(),
    state: z.string().max(50, "Estado não pode exceder 50 caracteres").optional(),
    zipCode: z.string().max(20, "CEP não pode exceder 20 caracteres").optional(),
    country: z.string().max(50, "País não pode exceder 50 caracteres").optional()
  }).optional()
})

// Schema para atualização de cliente
const updateClientSchema = createClientSchema.partial().extend({
  id: z.string().min(1, "ID é obrigatório")
})

// Schema para deletar cliente
const deleteClientSchema = z.object({
  id: z.string().min(1, "ID é obrigatório")
})

// Cliente de action para operações autenticadas
const authenticatedAction = createSafeActionClient()

// Cliente de action para operações de admin
const adminAction = createSafeActionClient()

/**
 * Criar novo cliente
 * Membros autenticados podem criar clientes
 */
export const createClientAction = authenticatedAction
  .schema(createClientSchema)
  .action(async ({ parsedInput: { name, email, phone, company, address } }) => {
    try {
      const context = await requirePermission(Role.MEMBER)

      const client = await db.client.create({
        data: {
          agencyId: context.agencyId,
          name,
          email,
          phone,
          company,
          address: address ? JSON.stringify(address) : null,
        },
      })

      revalidatePath("/clientes")
      
      return {
        success: true,
        data: client,
        message: "Cliente criado com sucesso"
      }
    } catch (error) {
      console.error("Erro ao criar cliente:", error)
      throw error
    }
  })

/**
 * Atualizar cliente existente
 * Membros autenticados podem atualizar clientes
 */
export const updateClientAction = authenticatedAction
  .schema(updateClientSchema)
  .action(async ({ parsedInput: { id, ...updateData } }) => {
    try {
      const context = await requirePermission(Role.MEMBER)

      // Verificar se o cliente pertence à agência
      const existingClient = await db.client.findFirst({
        where: {
          id,
          agencyId: context.agencyId,
        },
      })

      if (!existingClient) {
        throw appErrors.CLIENT_NOT_FOUND || new Error("Cliente não encontrado")
      }

      const client = await db.client.update({
        where: { id },
        data: {
          ...updateData,
          address: updateData.address ? JSON.stringify(updateData.address) : undefined,
        },
      })

      revalidatePath("/clientes")
      
      return {
        success: true,
        data: client,
        message: "Cliente atualizado com sucesso"
      }
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error)
      throw error
    }
  })

/**
 * Deletar cliente
 * Apenas admins e owners podem deletar clientes
 */
export const deleteClientAction = adminAction
  .schema(deleteClientSchema)
  .action(async ({ parsedInput: { id } }) => {
    try {
      const context = await requirePermission(Role.ADMIN)

      // Verificar se o cliente pertence à agência
      const existingClient = await db.client.findFirst({
        where: {
          id,
          agencyId: context.agencyId,
        },
      })

      if (!existingClient) {
        throw appErrors.CLIENT_NOT_FOUND || new Error("Cliente não encontrado")
      }

      // Verificar se há projetos associados
      const projectsCount = await db.project.count({
        where: { clientId: id },
      })

      if (projectsCount > 0) {
        throw new Error("Não é possível deletar cliente com projetos associados")
      }

      await db.client.delete({
        where: { id },
      })

      revalidatePath("/clientes")
      
      return {
        success: true,
        message: "Cliente deletado com sucesso"
      }
    } catch (error) {
      console.error("Erro ao deletar cliente:", error)
      throw error
    }
  })

/**
 * Listar clientes da agência
 * Membros autenticados podem listar clientes
 */
export const listClientsAction = authenticatedAction
  .schema(z.object({
    search: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10)
  }))
  .action(async ({ parsedInput: { search, page, limit } }) => {
    try {
      const context = await requirePermission(Role.MEMBER)

      const where = {
        agencyId: context.agencyId,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { company: { contains: search, mode: 'insensitive' as const } },
          ],
        }),
      }

      const [clients, total] = await Promise.all([
        db.client.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: { projects: true }
            }
          }
        }),
        db.client.count({ where })
      ])

      return {
        success: true,
        data: {
          clients,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        },
        message: "Clientes listados com sucesso"
      }
    } catch (error) {
      console.error("Erro ao listar clientes:", error)
      throw error
    }
  })
