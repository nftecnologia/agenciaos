# Project Brief - AgênciaOS SaaS

## 🎯 Visão Geral
**Problema:** Agências de marketing digital precisam de uma solução completa que integre gestão de projetos, social media, financeiro e automação via IA
**Solução:** SaaS completo com 4 módulos principais + 31 agentes de IA especializados
**Valor:** Centralizar todas as operações da agência em uma única plataforma com automação inteligente

## 💰 Modelo de Negócio
- **Plano Free**: 3 clientes, 5 projetos, 20 gerações IA/mês (isca para conversão)
- **Plano Pro**: Ilimitado, 500 gerações IA/mês, R$197/mês
- **Meta**: 500 agências Pro = R$98.500/mês de receita recorrente

## 🏗️ Módulos Principais

### 1. **Gestão de Projetos**
- Kanban com drag-and-drop (dnd-kit)
- Tasks com prazos e responsáveis
- Timeline visual de projetos
- Templates de projetos reutilizáveis
- Comentários e anexos em tasks

### 2. **Central IA (31 Agentes)**

#### **Meta Ads (5 agentes)**
- Gerador de Personas Detalhadas
- Criador de Copy Persuasiva
- Estratégias de Segmentação
- Análise de Concorrência
- Otimizador de Testes A/B

#### **Instagram (7 agentes)**
- Gerador de Legendas Virais
- Pesquisador de Hashtags
- Ideias de Conteúdo
- Planejador de Carrossel
- Scripts para Reels
- Bio Otimizada
- Calendário de Posts

#### **YouTube (5 agentes)**
- Roteirista Completo
- Gerador de Títulos
- Otimizador de SEO
- Ideias de Thumbnail
- Estrutura de Vídeos

#### **Blog/SEO (6 agentes)**
- Escritor de Artigos Completos
- Estruturador de Conteúdo
- Meta Descriptions
- FAQ Generator
- Keyword Research
- Outline Builder

#### **WhatsApp Business (4 agentes)**
- Scripts de Vendas
- Templates de Mensagens
- Fluxos de Atendimento
- Respostas Automáticas

#### **CRM (3 agentes)**
- Templates de Follow-up
- Scripts de Atendimento
- Pesquisas de Satisfação

#### **Feed & Stories (1 super agente)**
- Gera imagem + texto + hashtags
- Formatos: Feed quadrado, portrait, stories
- Estilos: minimalista, moderno, corporativo, vibrante

### 3. **Módulo Financeiro**
- Dashboard com métricas em tempo real
- Receitas recorrentes e avulsas
- Controle de despesas por categoria
- Relatórios de lucratividade por cliente
- Previsão de fluxo de caixa
- Integração com emissão de NF (futuro)

### 4. **Social Media Hub**
- Calendário editorial visual
- Agendamento de posts (futuro)
- Preview realista de posts
- Biblioteca de assets
- Analytics integrado

## 🛠️ Stack Tecnológico
- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **Database:** Neon Postgres (multi-tenant)
- **Auth:** NextAuth.js v5 (JWT + multi-tenant)
- **IA:** OpenAI GPT-4 + DALL-E 3
- **Pagamentos:** Digital Manager Guru (sem taxas)
- **Deploy:** Vercel (otimizado para Next.js)

## 🔐 Arquitetura Multi-tenant
- Todos os dados filtrados por `agencyId`
- Row Level Security no Postgres
- Middleware de validação
- Contexto automático de agência

### **Permissões**
- **Owner**: Dono da agência (acesso total)
- **Admin**: Gerencia usuários e configurações
- **Member**: Acesso aos projetos atribuídos

## 📊 Critérios de Sucesso
1. **MVP Funcional** - 4 módulos principais operacionais
2. **31 Agentes IA** - Todos funcionando com qualidade
3. **Multi-tenancy** - Isolamento perfeito entre agências
4. **Pagamentos** - Integração Digital Manager Guru
5. **Performance** - Web Vitals verdes, carregamento < 2s
6. **Escalabilidade** - Suportar 1000+ agências simultâneas

## 🎯 Diferencial Competitivo
- **Foco específico** em agências de marketing digital
- **31 agentes IA especializados** (maior conjunto do mercado)
- **Preço acessível** (R$197 vs R$500+ concorrentes)
- **Setup rápido** (onboarding em 5 minutos)
- **Suporte brasileiro** (timezone e idioma)

## ⏱️ Escopo Total Revisado

### **Fase 1: Fundação (25 horas)**
- [ ] Setup Next.js + Multi-tenancy - 8h
- [ ] Autenticação + Permissões - 8h
- [ ] Dashboard Principal - 6h
- [ ] Deploy + CI/CD - 3h

### **Fase 2: Core Business (40 horas)**
- [ ] Módulo Projetos (Kanban) - 15h
- [ ] Módulo Financeiro - 12h
- [ ] Social Media Hub - 8h
- [ ] Sistema de Pagamentos - 5h

### **Fase 3: IA Engine (30 horas)**
- [ ] Infraestrutura IA - 8h
- [ ] Agentes Meta Ads (5) - 8h
- [ ] Agentes Instagram (7) - 8h
- [ ] Agentes YouTube/Blog/WhatsApp/CRM (18) - 6h

### **Fase 4: Polimento (10 horas)**
- [ ] Testes E2E - 4h
- [ ] Otimizações Performance - 3h
- [ ] Documentação - 3h

**📈 Progresso Total:** 0% (0/105 horas estimadas)
**⏱️ Tempo Restante:** 105 horas (~26 dias úteis a 4h/dia)
**🎯 Data Estimada:** 31/01/2025

## 🚀 Estratégia de Lançamento
1. **Beta Fechado** - 50 agências selecionadas
2. **Feedback Loop** - Ajustes baseados no uso real
3. **Lançamento Público** - Marketing digital agressivo
4. **Meta 6 meses** - 500 agências Pro (R$98.5k MRR)

---
**Última atualização:** 06/01/2025
**Próxima revisão:** 08/01/2025 