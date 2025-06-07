import { task } from "@trigger.dev/sdk/v3";
import { db } from "@/lib/db";

export const processPaymentWebhook = task({
  id: "process-payment-webhook",
  maxDuration: 60, // 1 minuto
  retry: {
    maxAttempts: 5,
  },
  run: async (payload: {
    event: string;
    customerId: string;
    productId: string;
    amount: number;
    status: string;
  }) => {
    const { event, customerId } = payload;

    console.log(`Processando webhook de pagamento: ${event} para cliente ${customerId}`);

    try {
      if (event === "payment.approved") {
        // Ativar plano PRO
        const agency = await db.agency.findFirst({
          where: { id: customerId },
        });

        if (!agency) {
          throw new Error("Agência não encontrada");
        }

        await db.agency.update({
          where: { id: customerId },
          data: {
            plan: "PRO",
            updatedAt: new Date(),
          },
        });

        console.log(`Plano PRO ativado para agência ${customerId}`);

        return {
          success: true,
          action: "plan_activated",
          agencyId: customerId,
          plan: "PRO",
        };
      }

      if (event === "payment.cancelled" || event === "subscription.cancelled") {
        // Downgrade para plano FREE
        await db.agency.update({
          where: { id: customerId },
          data: {
            plan: "FREE",
            updatedAt: new Date(),
          },
        });

        console.log(`Plano downgraded para FREE - agência ${customerId}`);

        return {
          success: true,
          action: "plan_downgraded",
          agencyId: customerId,
          plan: "FREE",
        };
      }

      console.log(`Evento não processado: ${event}`);
      return {
        success: true,
        action: "ignored",
        event,
      };
    } catch (error) {
      console.error("Erro ao processar webhook de pagamento:", error);
      throw error;
    }
  },
});
