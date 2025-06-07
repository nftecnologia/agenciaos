// Simulação temporária dos jobs do Trigger.dev
// Para reativar o Trigger.dev, descomente o código abaixo e instale '@trigger.dev/sdk'

export interface JobResult {
  success: boolean;
  result?: string;
  action?: string;
  event?: string;
  customerId?: string;
  report?: string;
  timestamp: string;
  agencies?: number;
}

export const simpleAIJob = {
  id: "simple-ai-job",
  trigger: async (payload: { agencyId: string; content: string }): Promise<{ id: string }> => {
    console.log(`[SIMULAÇÃO] Processando IA para agência ${payload.agencyId}`);
    
    // Simulação do processamento
    setTimeout(async () => {
      console.log(`IA processada para: ${payload.content}`);
    }, 1000);
    
    return {
      id: `job-${Date.now()}`,
    };
  },
};

export const simpleWebhookJob = {
  id: "simple-webhook-job",
  trigger: async (payload: { event: string; customerId: string }): Promise<{ id: string }> => {
    console.log(`[SIMULAÇÃO] Webhook recebido: ${payload.event} para ${payload.customerId}`);
    
    // Simulação do processamento
    setTimeout(async () => {
      console.log(`Webhook processado: ${payload.event}`);
    }, 500);
    
    return {
      id: `webhook-${Date.now()}`,
    };
  },
};

export const simpleReportJob = {
  id: "simple-report-job",
  trigger: async (): Promise<{ id: string }> => {
    console.log("[SIMULAÇÃO] Gerando relatório simples");
    
    // Simulação do processamento
    setTimeout(async () => {
      console.log("Relatório gerado com sucesso");
    }, 2000);
    
    return {
      id: `report-${Date.now()}`,
    };
  },
};

/* 
PARA REATIVAR O TRIGGER.DEV:

1. Instalar dependência:
   npm install @trigger.dev/sdk@latest

2. Substituir o código acima por:

import { task } from "@trigger.dev/sdk/v3";

export const simpleAIJob = task({
  id: "simple-ai-job",
  maxDuration: 60,
  retry: { maxAttempts: 2 },
  run: async (payload: { agencyId: string; content: string }) => {
    console.log(`Processando IA para agência ${payload.agencyId}`);
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
  retry: { maxAttempts: 3 },
  run: async (payload: { event: string; customerId: string }) => {
    console.log(`Webhook recebido: ${payload.event} para ${payload.customerId}`);
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
  retry: { maxAttempts: 1 },
  run: async () => {
    console.log("Gerando relatório simples");
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      success: true,
      report: "Relatório gerado com sucesso",
      timestamp: new Date().toISOString(),
      agencies: 5,
    };
  },
});

*/
