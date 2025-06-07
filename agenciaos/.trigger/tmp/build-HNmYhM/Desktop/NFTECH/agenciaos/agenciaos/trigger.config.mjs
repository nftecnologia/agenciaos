import {
  defineConfig
} from "../../../../chunk-WWR7K6XQ.mjs";
import {
  init_esm
} from "../../../../chunk-XVMCOVNG.mjs";

// trigger.config.ts
init_esm();
var trigger_config_default = defineConfig({
  project: "proj_puyarnsunmklxflfaarq",
  logLevel: "log",
  maxDuration: 300,
  // 5 minutos
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1e3,
      maxTimeoutInMs: 1e4,
      factor: 2,
      randomize: true
    }
  },
  // Especificar o arquivo de entrada principal
  dirs: ["./src/trigger"],
  // Arquivo de entrada principal
  build: {}
});
var resolveEnvVars = void 0;
export {
  trigger_config_default as default,
  resolveEnvVars
};
//# sourceMappingURL=trigger.config.mjs.map
