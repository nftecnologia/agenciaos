import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
  project: "proj_puyarnsunmklxflfaarq",
  logLevel: "log",
  maxDuration: 300, // 5 minutos
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  // Especificar o arquivo de entrada principal
  dirs: ["./src/trigger"],
  // Arquivo de entrada principal
  build: {
    external: ["@prisma/client"],
  },
});
