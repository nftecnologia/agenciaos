# Arquitetura Técnica - AgênciaOS SaaS

## 🏗️ Visão Geral da Arquitetura

### **Princípios Arquiteturais**
- **Multi-tenancy**: Isolamento completo entre agências
- **Escalabilidade**: Suportar 1000+ agências simultâneas
- **Performance**: Web Vitals verdes, carregamento < 2s
- **Segurança**: Row Level Security, JWT, validação rigorosa
- **Manutenibilidade**: Código limpo, tipado, testável

## 📦 Stack Tecnológico Detalhado

### **Frontend**
- **Next.js 14**: App Router + React Server Components
- **TypeScript**: Tipagem estrita em todo o projeto
- **Tailwind CSS**: Utility-first styling
- **Shadcn UI**: Componentes acessíveis e customizáveis
- **Radix UI**: Primitives para componentes complexos
- **React Hook Form**: Gerenciamento de formulários
- **Zod**: Validação de schemas
- **Framer Motion**: Animações suaves
- **dnd-kit**: Drag and drop para Kanban

### **Backend**
- **Next.js API Routes**: Endpoints RESTful
- **Server Actions**: Mutações server-side
- **next-safe-action**: Validação e tipagem de actions
- **Prisma**: ORM type-safe
- **Neon Postgres**: Database serverless
- **NextAuth.js v5**: Autenticação e sessões

### **IA & Automação**
- **OpenAI GPT-4**: Geração de texto
- **DALL-E 3**: Geração de imagens
- **Vercel AI SDK**: Streaming e otimizações
- **Custom Prompts**: Templates especializados

### **Pagamentos & Monetização**
- **Digital Manager Guru**: Checkout e assinaturas
- **Webhooks**: Confirmação automática
- **Rate Limiting**: Controle de uso por plano

### **Deploy & Infraestrutura**
- **Vercel**: Hosting otimizado para Next.js
- **GitHub Actions**: CI/CD automatizado
- **Vercel Analytics**: Monitoramento de performance
- **Sentry**: Error tracking (futuro)

## 🗄️ Arquitetura do Banco de Dados

### **Schema Multi-tenant**

```prisma
// Tenant principal
model Agency {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  ownerId     String
  settings    Json?
  plan        Plan     @default(FREE)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relacionamentos
  owner       User     @relation(fields: [ownerId], references: [id])
  members     User[]   @relation("AgencyMembers")
  clients     Client[]
  projects    Project[]
  revenues    Revenue[]
  expenses    Expense[]
  aiUsage     AIUsage[]
  
  @@map("agencies")
}

// Usuários com roles
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String?
  avatar      String?
  role        Role     @default(MEMBER)
  agencyId    String?
  createdAt   DateTime @default(now())
  
  // Relacionamentos
  agency      Agency?  @relation("AgencyMembers", fields: [agencyId], references: [id])
  ownedAgency Agency?
  assignedTasks Task[]
  
  @@map("users")
}

// Clientes da agência
model Client {
  id          String   @id @default(cuid())
  agencyId    String
  name        String
  email       String?
  phone       String?
  company     String?
  address     Json?
  createdAt   DateTime @default(now())
  
  // Relacionamentos
  agency      Agency   @relation(fields: [agencyId], references: [id])
  projects    Project[]
  revenues    Revenue[]
  
  @@map("clients")
}

// Projetos
model Project {
  id          String   @id @default(cuid())
  agencyId    String
  clientId    String
  name        String
  description String?
  status      ProjectStatus @default(PLANNING)
  budget      Decimal?
  startDate   DateTime?
  endDate     DateTime?
  createdAt   DateTime @default(now())
  
  // Relacionamentos
  agency      Agency   @relation(fields: [agencyId], references: [id])
  client      Client   @relation(fields: [clientId], references: [id])
  boards      Board[]
  tasks       Task[]
  revenues    Revenue[]
  
  @@map("projects")
}

// Boards do Kanban
model Board {
  id          String   @id @default(cuid())
  projectId   String
  name        String
  position    Int
  color       String?
  
  // Relacionamentos
  project     Project  @relation(fields: [projectId], references: [id])
  tasks       Task[]
  
  @@map("boards")
}

// Tasks do Kanban
model Task {
  id          String   @id @default(cuid())
  projectId   String
  boardId     String
  assignedTo  String?
  title       String
  description String?
  priority    Priority @default(MEDIUM)
  dueDate     DateTime?
  position    Int
  createdAt   DateTime @default(now())
  
  // Relacionamentos
  project     Project  @relation(fields: [projectId], references: [id])
  board       Board    @relation(fields: [boardId], references: [id])
  assignee    User?    @relation(fields: [assignedTo], references: [id])
  
  @@map("tasks")
}

// Receitas
model Revenue {
  id          String   @id @default(cuid())
  agencyId    String
  clientId    String?
  projectId   String?
  description String
  amount      Decimal
  category    String
  isRecurring Boolean  @default(false)
  date        DateTime
  createdAt   DateTime @default(now())
  
  // Relacionamentos
  agency      Agency   @relation(fields: [agencyId], references: [id])
  client      Client?  @relation(fields: [clientId], references: [id])
  project     Project? @relation(fields: [projectId], references: [id])
  
  @@map("revenues")
}

// Despesas
model Expense {
  id          String   @id @default(cuid())
  agencyId    String
  description String
  amount      Decimal
  category    String
  date        DateTime
  createdAt   DateTime @default(now())
  
  // Relacionamentos
  agency      Agency   @relation(fields: [agencyId], references: [id])
  
  @@map("expenses")
}

// Uso de IA
model AIUsage {
  id          String   @id @default(cuid())
  agencyId    String
  agentType   String
  tokensUsed  Int
  cost        Decimal
  createdAt   DateTime @default(now())
  
  // Relacionamentos
  agency      Agency   @relation(fields: [agencyId], references: [id])
  
  @@map("ai_usage")
}

// Enums
enum Plan {
  FREE
  PRO
}

enum Role {
  OWNER
  ADMIN
  MEMBER
}

enum ProjectStatus {
  PLANNING
  IN_PROGRESS
  REVIEW
  COMPLETED
  CANCELLED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

## 🔐 Sistema de Segurança Multi-tenant

### **Row Level Security (RLS)**
```sql
-- Política para tabela agencies
CREATE POLICY agency_isolation ON agencies
  FOR ALL USING (id = current_setting('app.current_agency_id')::text);

-- Política para tabela clients
CREATE POLICY client_isolation ON clients
  FOR ALL USING (agency_id = current_setting('app.current_agency_id')::text);

-- Aplicar para todas as tabelas tenant-specific
```

### **Middleware de Autenticação**
```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Injetar agencyId no contexto
  const response = NextResponse.next()
  response.headers.set('x-agency-id', token.agencyId as string)
  
  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*']
}
```

### **Context Provider**
```typescript
// lib/agency-context.tsx
'use client'

import { createContext, useContext } from 'react'

interface AgencyContextType {
  agencyId: string
  agencyName: string
  plan: 'FREE' | 'PRO'
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
}

const AgencyContext = createContext<AgencyContextType | null>(null)

export function useAgency() {
  const context = useContext(AgencyContext)
  if (!context) {
    throw new Error('useAgency must be used within AgencyProvider')
  }
  return context
}
```

## 🤖 Arquitetura dos Agentes IA

### **Sistema de Prompts**
```typescript
// lib/ai/prompts.ts
export const PROMPTS = {
  META_ADS: {
    PERSONA: `
      Você é um especialista em criação de personas para Meta Ads.
      Baseado nas informações do negócio, crie uma persona detalhada...
    `,
    COPY: `
      Você é um copywriter especialista em Meta Ads.
      Crie copies persuasivas seguindo as melhores práticas...
    `
  },
  INSTAGRAM: {
    LEGEND: `
      Você é um social media especialista em Instagram.
      Crie legendas envolventes que geram engajamento...
    `
  }
  // ... outros prompts
}
```

### **Engine de IA**
```typescript
// lib/ai/engine.ts
import OpenAI from 'openai'
import { PROMPTS } from './prompts'

export class AIEngine {
  private openai: OpenAI
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  }
  
  async generateContent(
    agentType: string,
    input: any,
    agencyId: string
  ) {
    // Verificar limites do plano
    await this.checkUsageLimits(agencyId)
    
    // Gerar conteúdo
    const prompt = this.buildPrompt(agentType, input)
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    })
    
    // Registrar uso
    await this.trackUsage(agencyId, agentType, response.usage)
    
    return response.choices[0].message.content
  }
  
  private async checkUsageLimits(agencyId: string) {
    // Implementar verificação de limites
  }
}
```

## 📱 Estrutura de Componentes

### **Organização de Pastas**
```
src/
├── app/                    # App Router
│   ├── (auth)/            # Grupo de rotas de auth
│   ├── dashboard/         # Dashboard principal
│   ├── projects/          # Gestão de projetos
│   ├── clients/           # Gestão de clientes
│   ├── financial/         # Módulo financeiro
│   ├── ai/                # Central de IA
│   └── api/               # API Routes
├── components/            # Componentes reutilizáveis
│   ├── ui/                # Shadcn components
│   ├── forms/             # Formulários
│   ├── charts/            # Gráficos
│   └── kanban/            # Componentes do Kanban
├── lib/                   # Utilitários
│   ├── db.ts              # Prisma client
│   ├── auth.ts            # NextAuth config
│   ├── ai/                # Engine de IA
│   └── utils.ts           # Funções utilitárias
├── hooks/                 # Custom hooks
├── types/                 # TypeScript types
└── styles/                # CSS global
```

### **Componente Kanban**
```typescript
// components/kanban/board.tsx
'use client'

import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import { Column } from './column'
import { Task } from './task'

interface KanbanBoardProps {
  boards: Board[]
  tasks: Task[]
  onTaskMove: (taskId: string, newBoardId: string) => void
}

export function KanbanBoard({ boards, tasks, onTaskMove }: KanbanBoardProps) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      onTaskMove(active.id as string, over.id as string)
    }
  }
  
  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex gap-6 overflow-x-auto">
        {boards.map(board => (
          <SortableContext key={board.id} items={tasks.filter(t => t.boardId === board.id)}>
            <Column board={board} tasks={tasks.filter(t => t.boardId === board.id)} />
          </SortableContext>
        ))}
      </div>
    </DndContext>
  )
}
```

## 💳 Sistema de Pagamentos

### **Integração Digital Manager Guru**
```typescript
// lib/payments/dmg.ts
export class DMGPayments {
  private apiKey: string
  
  constructor() {
    this.apiKey = process.env.DMG_API_KEY!
  }
  
  async createCheckout(agencyId: string, plan: 'PRO') {
    const response = await fetch('https://api.digitalmanagerguru.com/checkout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        product_id: plan === 'PRO' ? 'prod_pro_monthly' : '',
        customer_data: {
          external_id: agencyId
        },
        success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?payment=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing?payment=cancelled`
      })
    })
    
    return response.json()
  }
  
  async handleWebhook(payload: any) {
    // Processar webhook de confirmação
    if (payload.event === 'payment.approved') {
      await this.activatePlan(payload.customer.external_id, 'PRO')
    }
  }
}
```

## 📊 Monitoramento e Analytics

### **Métricas de Performance**
- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Time to Interactive**: < 3s
- **Bundle Size**: < 500KB inicial
- **API Response Time**: < 200ms média

### **Métricas de Negócio**
- **Conversão Free → Pro**: Meta 15%
- **Churn Rate**: < 5% mensal
- **Usage per Agency**: Média 200 IA/mês
- **Support Tickets**: < 2% dos usuários

## 🚀 Estratégia de Deploy

### **Ambientes**
- **Development**: Localhost + Neon branch
- **Staging**: Vercel preview + Neon staging
- **Production**: Vercel production + Neon main

### **CI/CD Pipeline**
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---
**Última atualização:** 06/01/2025
**Próxima revisão:** 08/01/2025 