import { task } from "@trigger.dev/sdk/v3";

export const simpleAIJob = task({
  id: "simple-ai-job",
  maxDuration: 60,
  retry: {
    maxAttempts: 2,
  },
  run: async (payload: { agencyId: string; content: string }) => {
    console.log(`Processando IA para agência ${payload.agencyId}`);
    
    // Simulação simples sem Prisma
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      result: `IA processada para: ${payload.content}`,
      timestamp: new Date().toISOString(),
    };
  },
});

export const simpleWebhookJob = task({
  id: "simple-webhook-job",
  maxDuration: 30,
  retry: {
    maxAttempts: 3,
  },
  run: async (payload: { event: string; customerId: string }) => {
    console.log(`Webhook recebido: ${payload.event} para ${payload.customerId}`);
    
    // Simulação simples sem Prisma
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      action: "processed",
      event: payload.event,
      customerId: payload.customerId,
      timestamp: new Date().toISOString(),
    };
  },
});

export const simpleReportJob = task({
  id: "simple-report-job",
  maxDuration: 120,
  retry: {
    maxAttempts: 1,
  },
  run: async () => {
    console.log("Gerando relatório simples");
    
    // Simulação simples sem Prisma
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      success: true,
      report: "Relatório gerado com sucesso",
      timestamp: new Date().toISOString(),
      agencies: 5, // Simulado
    };
  },
});
