import {
  task
} from "./chunk-WWR7K6XQ.mjs";
import {
  init_esm
} from "./chunk-XVMCOVNG.mjs";

// src/trigger/simple-jobs.ts
init_esm();
var simpleAIJob = task({
  id: "simple-ai-job",
  maxDuration: 60,
  retry: {
    maxAttempts: 2
  },
  run: async (payload) => {
    console.log(`Processando IA para agência ${payload.agencyId}`);
    await new Promise((resolve) => setTimeout(resolve, 1e3));
    return {
      success: true,
      result: `IA processada para: ${payload.content}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
});
var simpleWebhookJob = task({
  id: "simple-webhook-job",
  maxDuration: 30,
  retry: {
    maxAttempts: 3
  },
  run: async (payload) => {
    console.log(`Webhook recebido: ${payload.event} para ${payload.customerId}`);
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      success: true,
      action: "processed",
      event: payload.event,
      customerId: payload.customerId,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
});
var simpleReportJob = task({
  id: "simple-report-job",
  maxDuration: 120,
  retry: {
    maxAttempts: 1
  },
  run: async () => {
    console.log("Gerando relatório simples");
    await new Promise((resolve) => setTimeout(resolve, 2e3));
    return {
      success: true,
      report: "Relatório gerado com sucesso",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      agencies: 5
      // Simulado
    };
  }
});

export {
  simpleAIJob,
  simpleWebhookJob,
  simpleReportJob
};
//# sourceMappingURL=chunk-PSKFQQUI.mjs.map
