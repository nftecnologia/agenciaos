# Trigger.dev - AgênciaOS

Este documento explica a implementação do **Trigger.dev v3** no projeto AgênciaOS para processamento de jobs em background.

## 🚀 O que foi implementado

### Jobs Disponíveis

1. **Geração de Conteúdo IA** (`generate-ai-content`)
   - Processa solicitações de geração de conteúdo via OpenAI
   - Controla limites por plano (FREE/PRO)
   - Registra uso e custos de IA

2. **Webhook de Pagamentos** (`process-payment-webhook`)
   - Processa confirmações de pagamento do Digital Manager Guru
   - Ativa/desativa planos automaticamente
   - Retry automático em caso de falha

3. **Relatórios Mensais** (`generate-monthly-reports`)
   - Gera relatórios mensais de todas as agências
   - Calcula receitas, despesas e lucros
   - Execução manual ou via cron

## 📁 Estrutura de Arquivos

```
agenciaos/
├── trigger.config.ts              # Configuração do Trigger.dev
├── src/trigger/
│   ├── index.ts                   # Exportações e tipos
│   ├── ai-content-generation.ts   # Job de geração de IA
│   ├── payment-webhook.ts         # Job de webhooks de pagamento
│   └── scheduled-reports.ts       # Job de relatórios mensais
└── src/app/api/trigger/route.ts   # API endpoint para triggerar jobs
```

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Adicione as seguintes variáveis no `.env.local`:

```bash
# Trigger.dev
TRIGGER_SECRET_KEY="your_trigger_secret_key_here"
TRIGGER_PROJECT_ID="proj_agenciaos"
TRIGGER_API_URL="https://api.trigger.dev"

# OpenAI (para jobs de IA)
OPENAI_API_KEY="your_openai_api_key_here"

# Digital Manager Guru
DMG_API_KEY="your_dmg_api_key_here"
DMG_WEBHOOK_SECRET="your_dmg_webhook_secret_here"
```

### 2. Instalação e Setup

O Trigger.dev já está instalado. Para configurar:

```bash
# 1. Instalar CLI do Trigger.dev (globalmente)
npm install -g @trigger.dev/cli

# 2. Fazer login na conta Trigger.dev
npx trigger.dev@latest login

# 3. Inicializar projeto (se necessário)
npx trigger.dev@latest init

# 4. Deploy dos jobs
npx trigger.dev@latest deploy
```

### 3. Desenvolvimento Local

Para desenvolver localmente:

```bash
# Terminal 1: Executar aplicação Next.js
npm run dev

# Terminal 2: Executar Trigger.dev em modo dev
npx trigger.dev@latest dev
```

## 🔧 Como Usar

### 1. Triggerar Job de IA

```typescript
// Via API endpoint
const response = await fetch('/api/trigger', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'ai-content',
    payload: {
      agencyId: 'agency-123',
      agentType: 'META_ADS_COPY',
      input: { produto: 'Smartphone', publico: 'Jovens 18-25' },
      userId: 'user-456'
    }
  })
});
```

### 2. Triggerar Webhook de Pagamento

```typescript
// Via API endpoint (normalmente chamado pelo Digital Manager Guru)
const response = await fetch('/api/trigger', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'payment-webhook',
    payload: {
      event: 'payment.approved',
      customerId: 'agency-123',
      productId: 'pro-monthly',
      amount: 97.00,
      status: 'paid'
    }
  })
});
```

### 3. Executar Relatórios Mensais

```typescript
// Executar manualmente
import { generateMonthlyReports } from '@/trigger';

const result = await generateMonthlyReports.trigger({});
```

## 📊 Monitoramento

### Dashboard do Trigger.dev

Acesse o dashboard em: https://cloud.trigger.dev

- Visualize execuções de jobs
- Monitore erros e retries
- Analise performance e duração

### Logs

Todos os jobs incluem logging detalhado:

```typescript
console.log(`Iniciando geração de conteúdo IA para agência ${agencyId}`);
console.log(`Conteúdo IA gerado com sucesso. Tokens: ${tokensUsed}, Custo: $${cost}`);
```

## 🔄 Retry e Error Handling

### Configuração de Retry

```typescript
export const generateAIContent = task({
  id: "generate-ai-content",
  maxDuration: 300, // 5 minutos
  retry: {
    maxAttempts: 3,
  },
  // ...
});
```

### Tratamento de Erros

```typescript
try {
  // Lógica do job
  return { success: true, data: result };
} catch (error) {
  console.error("Erro no job:", error);
  throw error; // Trigger.dev vai fazer retry automaticamente
}
```

## 🚀 Deploy para Produção

### 1. Configurar Variáveis de Ambiente

No Vercel/plataforma de deploy:

```bash
TRIGGER_SECRET_KEY=prod_secret_key
TRIGGER_PROJECT_ID=proj_agenciaos
OPENAI_API_KEY=real_openai_key
DMG_API_KEY=real_dmg_key
```

### 2. Deploy dos Jobs

```bash
# Deploy dos jobs para produção
npx trigger.dev@latest deploy --env prod
```

### 3. Webhook Configuration

Configure webhooks do Digital Manager Guru para:
- URL: `https://suaapp.vercel.app/api/trigger`
- Método: POST
- Payload: formato do PaymentWebhookPayload

## 🔍 Troubleshooting

### Erro: "Project not found"
- Verifique se `TRIGGER_PROJECT_ID` está correto
- Execute `npx trigger.dev@latest init` novamente

### Jobs não executam
- Verifique se o projeto foi deployado: `npx trigger.dev@latest deploy`
- Confirme as variáveis de ambiente

### Timeout nos jobs
- Ajuste `maxDuration` na configuração do job
- Otimize o código para ser mais rápido

## 📈 Próximos Passos

1. **Scheduled Jobs**: Implementar cron jobs quando disponível na v3
2. **Webhooks de IA**: Integrar com webhooks do OpenAI para status
3. **Monitoring**: Adicionar métricas customizadas
4. **Alerts**: Configurar alertas por email/Slack

## 🔗 Links Úteis

- [Documentação Trigger.dev v3](https://trigger.dev/docs)
- [Dashboard](https://cloud.trigger.dev)
- [GitHub](https://github.com/triggerdotdev/trigger.dev)
