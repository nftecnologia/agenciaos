// Arquivo de entrada principal para o Trigger.dev v3 (deploy)
// Apenas jobs simples sem Prisma

import "./trigger/simple-jobs";

// Re-exportar apenas as tasks simples
export * from "./trigger/simple-jobs";
export * from "./trigger/index";
