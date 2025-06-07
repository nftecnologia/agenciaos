import { task } from "@trigger.dev/sdk/v3";
import { db } from "@/lib/db";

export const generateAIContent = task({
  id: "generate-ai-content",
  maxDuration: 300, // 5 minutos
  retry: {
    maxAttempts: 3,
  },
  run: async (payload: {
    agencyId: string;
    agentType: string;
    input: Record<string, unknown>;
    userId: string;
  }) => {
    const { agencyId, agentType, input } = payload;

    console.log(`Iniciando geração de conteúdo IA para agência ${agencyId}`);

    try {
      // Verificar limites do plano
      const agency = await db.agency.findUnique({
        where: { id: agencyId },
        select: { plan: true },
      });

      if (!agency) {
        throw new Error("Agência não encontrada");
      }

      // Verificar uso de IA do mês atual
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      const monthlyUsage = await db.aIUsage.aggregate({
        where: {
          agencyId,
          createdAt: {
            gte: currentMonth,
          },
        },
        _sum: {
          tokensUsed: true,
        },
      });

      const totalTokens = monthlyUsage._sum.tokensUsed || 0;
      const maxTokens = agency.plan === "FREE" ? 10000 : 100000;

      if (totalTokens >= maxTokens) {
        throw new Error("Limite de uso de IA excedido para este mês");
      }

      // Simular chamada para OpenAI (aqui você integraria com a API real)
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simula tempo de processamento

      const generatedContent = `Conteúdo gerado para ${agentType}: ${JSON.stringify(input)}`;
      const tokensUsed = Math.floor(Math.random() * 1000) + 100; // Simula tokens usados
      const cost = tokensUsed * 0.00002; // Simula custo

      // Registrar uso de IA
      await db.aIUsage.create({
        data: {
          agencyId,
          agentType,
          tokensUsed,
          cost,
        },
      });

      console.log(`Conteúdo IA gerado com sucesso. Tokens: ${tokensUsed}, Custo: $${cost}`);

      return {
        content: generatedContent,
        tokensUsed,
        cost,
        success: true,
      };
    } catch (error) {
      console.error("Erro na geração de conteúdo IA:", error);
      throw error;
    }
  },
});
