import {
  init_esm
} from "./chunk-XVMCOVNG.mjs";

// src/trigger/simple-jobs.ts
init_esm();
var simpleAIJob = {
  id: "simple-ai-job",
  trigger: async (payload) => {
    console.log(`[SIMULAÇÃO] Processando IA para agência ${payload.agencyId}`);
    setTimeout(async () => {
      console.log(`IA processada para: ${payload.content}`);
    }, 1e3);
    return {
      id: `job-${Date.now()}`
    };
  }
};
var simpleWebhookJob = {
  id: "simple-webhook-job",
  trigger: async (payload) => {
    console.log(`[SIMULAÇÃO] Webhook recebido: ${payload.event} para ${payload.customerId}`);
    setTimeout(async () => {
      console.log(`Webhook processado: ${payload.event}`);
    }, 500);
    return {
      id: `webhook-${Date.now()}`
    };
  }
};
var simpleReportJob = {
  id: "simple-report-job",
  trigger: async () => {
    console.log("[SIMULAÇÃO] Gerando relatório simples");
    setTimeout(async () => {
      console.log("Relatório gerado com sucesso");
    }, 2e3);
    return {
      id: `report-${Date.now()}`
    };
  }
};

export {
  simpleAIJob,
  simpleWebhookJob,
  simpleReportJob
};
//# sourceMappingURL=chunk-3L5RPVZE.mjs.map
