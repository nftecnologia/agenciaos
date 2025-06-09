"use server"

import { authenticatedAction, adminAction } from "@/lib/safe-action"
import { createClientSchema, updateClientSchema, idParamSchema } from "@/lib/validations"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

// Action para criar cliente
export const createClientAction = authenticatedAction
  .schema(createClientSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { name, email, phone, company, address } = parsedInput

    try {
      const client = await db.client.create({
        data: {
          agencyId: ctx.agencyId,
          name,
          email,
          phone,
          company,
          address: address ?? undefined,
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
      throw new Error("Falha ao criar cliente")
    }
  })

// Action para atualizar cliente
export const updateClientAction = authenticatedAction
  .schema(updateClientSchema.extend({
    id: idParamSchema.shape.id
  }))
  .action(async ({ parsedInput, ctx }) => {
    const { id, ...updateData } = parsedInput

    try {
      // Verificar se o cliente pertence à agência
      const existingClient = await db.client.findFirst({
        where: {
          id,
          agencyId: ctx.agencyId,
        },
      })

      if (!existingClient) {
        throw new Error("Cliente não encontrado")
      }

      const client = await db.client.update({
        where: { id },
        data: {
          ...updateData,
          address: updateData.address ?? undefined,
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
      throw new Error("Falha ao atualizar cliente")
    }
  })

// Action para deletar cliente (apenas admin/owner)
export const deleteClientAction = adminAction
  .schema(idParamSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { id } = parsedInput

    try {
      // Verificar se o cliente pertence à agência
      const existingClient = await db.client.findFirst({
        where: {
          id,
          agencyId: ctx.agencyId,
        },
      })

      if (!existingClient) {
        throw new Error("Cliente não encontrado")
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
      throw new Error("Falha ao deletar cliente")
    }
  })
