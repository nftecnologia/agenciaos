// Jobs simples funcionais (sem Prisma para deploy)
export { simpleAIJob, simpleWebhookJob, simpleReportJob } from "./simple-jobs";

// Jobs inteligentes com simulações contextuais
export { intelligentAIJob, intelligentWebhookJob, intelligentReportJob } from "./intelligent-simulations";

// Jobs completos com Prisma (comentados para deploy - usar quando local)
// export { generateAIContent } from "./ai-content-generation";
// export { processPaymentWebhook } from "./payment-webhook";
// export { generateMonthlyReports } from "./scheduled-reports";

// Tipos para os payloads
export type SimpleAIPayload = {
  agencyId: string;
  content: string;
};

export type SimpleWebhookPayload = {
  event: string;
  customerId: string;
};

export type AIContentPayload = {
  agencyId: string;
  agentType: string;
  input: Record<string, unknown>;
  userId: string;
};

export type PaymentWebhookPayload = {
  event: string;
  customerId: string;
  productId: string;
  amount: number;
  status: string;
};
