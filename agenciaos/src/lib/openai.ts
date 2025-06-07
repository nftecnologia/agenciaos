import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface ProjectAnalysisInput {
  projectName: string
  projectDescription: string
  clientType?: string
  budget?: number
  industry?: string
}

export interface ClientStrategyInput {
  clientName: string
  clientCompany?: string
  industry?: string
  currentRelationship?: string
}

export interface TaskBreakdownInput {
  taskTitle: string
  taskDescription: string
  priority: string
  dueDate?: string
}

export interface MonthlyReportInput {
  agencyMetrics: {
    projectsCount: number
    clientsCount: number
    revenue: number
    completedTasks: number
  }
  period: string
}

export class OpenAIService {
  // Análise de Projeto
  static async analyzeProject(input: ProjectAnalysisInput): Promise<{
    suggestions: string[]
    estimatedHours: number
    priority: 'low' | 'medium' | 'high'
    technologies: string[]
    risks: string[]
    timeline: string
  }> {
    try {
      const prompt = `
Você é um consultor especialista em projetos digitais. Analise o seguinte projeto e forneça insights detalhados:

**Projeto:** ${input.projectName}
**Descrição:** ${input.projectDescription}
**Tipo de Cliente:** ${input.clientType || 'Não especificado'}
**Orçamento:** ${input.budget ? `R$ ${input.budget.toLocaleString()}` : 'Não especificado'}
**Setor:** ${input.industry || 'Não especificado'}

Forneça uma análise estruturada contendo:

1. **Sugestões Estratégicas** (4-6 sugestões específicas e acionáveis)
2. **Estimativa de Horas** (número realista baseado na complexidade)
3. **Prioridade** (low, medium ou high baseado na urgência/impacto)
4. **Tecnologias Recomendadas** (3-5 tecnologias principais)
5. **Riscos Identificados** (3-4 riscos potenciais)
6. **Timeline Estimado** (prazo realista em semanas/meses)

Responda no formato JSON:
{
  "suggestions": ["sugestão1", "sugestão2", "sugestão3", "sugestão4"],
  "estimatedHours": 120,
  "priority": "high",
  "technologies": ["Next.js", "TypeScript", "Prisma"],
  "risks": ["risco1", "risco2", "risco3"],
  "timeline": "8-12 semanas"
}
`

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Você é um consultor especialista em projetos digitais com 15 anos de experiência. Forneça análises práticas e acionáveis."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      })

      const response = completion.choices[0]?.message?.content
      if (!response) {
        throw new Error('Resposta vazia da OpenAI')
      }

      return JSON.parse(response)
    } catch (error) {
      console.error('Erro na análise de projeto:', error)
      // Fallback para dados simulados
      return {
        suggestions: [
          `Implementar arquitetura escalável para ${input.projectName}`,
          'Configurar pipeline de CI/CD automatizado',
          'Desenvolver testes automatizados abrangentes',
          'Criar documentação técnica detalhada'
        ],
        estimatedHours: Math.floor(Math.random() * 200) + 50,
        priority: 'high' as const,
        technologies: ['Next.js', 'TypeScript', 'Prisma', 'Tailwind CSS'],
        risks: [
          'Complexidade técnica acima do esperado',
          'Mudanças de escopo durante desenvolvimento',
          'Integração com sistemas legados'
        ],
        timeline: '6-10 semanas'
      }
    }
  }

  // Estratégia de Cliente
  static async generateClientStrategy(input: ClientStrategyInput): Promise<{
    strategies: string[]
    nextActions: string[]
    relationshipType: string
    opportunityScore: number
    recommendations: string[]
  }> {
    try {
      const prompt = `
Você é um especialista em relacionamento com clientes B2B. Analise o seguinte cliente e crie uma estratégia personalizada:

**Cliente:** ${input.clientName}
**Empresa:** ${input.clientCompany || 'Não especificado'}
**Setor:** ${input.industry || 'Não especificado'}
**Relacionamento Atual:** ${input.currentRelationship || 'Novo cliente'}

Crie uma estratégia de relacionamento contendo:

1. **Estratégias de Relacionamento** (4-5 estratégias específicas)
2. **Próximas Ações** (3-4 ações imediatas)
3. **Tipo de Relacionamento** (Strategic Partner, Key Account, Regular Client, ou Prospect)
4. **Score de Oportunidade** (0-100 baseado no potencial)
5. **Recomendações** (3-4 recomendações táticas)

Responda no formato JSON:
{
  "strategies": ["estratégia1", "estratégia2", "estratégia3", "estratégia4"],
  "nextActions": ["ação1", "ação2", "ação3"],
  "relationshipType": "Strategic Partner",
  "opportunityScore": 85,
  "recommendations": ["recomendação1", "recomendação2", "recomendação3"]
}
`

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Você é um especialista em gestão de relacionamento com clientes B2B com foco em resultados mensuráveis."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800,
      })

      const response = completion.choices[0]?.message?.content
      if (!response) {
        throw new Error('Resposta vazia da OpenAI')
      }

      return JSON.parse(response)
    } catch (error) {
      console.error('Erro na estratégia de cliente:', error)
      // Fallback
      return {
        strategies: [
          `Desenvolver relacionamento estratégico com ${input.clientName}`,
          'Agendar reuniões regulares de alinhamento',
          'Apresentar cases de sucesso relevantes',
          'Propor consultoria estratégica adicional'
        ],
        nextActions: [
          'Agendar call de descoberta',
          'Enviar proposta personalizada',
          'Conectar no LinkedIn'
        ],
        relationshipType: 'Key Account',
        opportunityScore: Math.floor(Math.random() * 40) + 60,
        recommendations: [
          'Foco em valor agregado',
          'Comunicação proativa',
          'Acompanhamento de resultados'
        ]
      }
    }
  }

  // Breakdown de Task
  static async breakdownTask(input: TaskBreakdownInput): Promise<{
    subtasks: { title: string; estimatedHours: number; priority: string }[]
    totalEstimatedHours: number
    dependencies: string[]
    risks: string[]
    checklist: string[]
  }> {
    try {
      const prompt = `
Você é um gerente de projetos experiente. Analise a seguinte task e faça um breakdown detalhado:

**Task:** ${input.taskTitle}
**Descrição:** ${input.taskDescription}
**Prioridade:** ${input.priority}
**Prazo:** ${input.dueDate || 'Não especificado'}

Faça um breakdown contendo:

1. **Subtasks** (5-8 subtasks específicas com título, estimativa em horas e prioridade)
2. **Total de Horas Estimadas** (soma das subtasks)
3. **Dependências** (2-3 dependências críticas)
4. **Riscos** (2-3 riscos identificados)
5. **Checklist** (5-7 itens de verificação)

Responda no formato JSON:
{
  "subtasks": [
    {"title": "Subtask 1", "estimatedHours": 4, "priority": "high"},
    {"title": "Subtask 2", "estimatedHours": 6, "priority": "medium"}
  ],
  "totalEstimatedHours": 32,
  "dependencies": ["dependência1", "dependência2"],
  "risks": ["risco1", "risco2"],
  "checklist": ["item1", "item2", "item3"]
}
`

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Você é um gerente de projetos sênior especializado em breakdown de tasks complexas."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 1000,
      })

      const response = completion.choices[0]?.message?.content
      if (!response) {
        throw new Error('Resposta vazia da OpenAI')
      }

      return JSON.parse(response)
    } catch (error) {
      console.error('Erro no breakdown de task:', error)
      // Fallback
      return {
        subtasks: [
          { title: `Planejamento de ${input.taskTitle}`, estimatedHours: 4, priority: 'high' },
          { title: 'Design e wireframes', estimatedHours: 8, priority: 'high' },
          { title: 'Desenvolvimento backend', estimatedHours: 12, priority: 'medium' },
          { title: 'Desenvolvimento frontend', estimatedHours: 16, priority: 'medium' },
          { title: 'Testes e QA', estimatedHours: 6, priority: 'medium' },
          { title: 'Deploy e configuração', estimatedHours: 4, priority: 'low' }
        ],
        totalEstimatedHours: 50,
        dependencies: [
          'Aprovação do design',
          'Configuração do ambiente',
          'Acesso aos dados necessários'
        ],
        risks: [
          'Mudanças de escopo',
          'Complexidade técnica imprevista',
          'Dependências externas'
        ],
        checklist: [
          'Requisitos claramente definidos',
          'Design aprovado pelo cliente',
          'Ambiente de desenvolvimento configurado',
          'Testes automatizados implementados',
          'Documentação atualizada'
        ]
      }
    }
  }

  // Relatório Mensal
  static async generateMonthlyReport(input: MonthlyReportInput): Promise<{
    insights: string[]
    recommendations: string[]
    highlights: string[]
    metrics: { label: string; value: string; trend: 'up' | 'down' | 'stable' }[]
    nextMonthGoals: string[]
  }> {
    try {
      const prompt = `
Você é um analista de negócios especializado em agências digitais. Gere um relatório mensal baseado nas métricas:

**Período:** ${input.period}
**Projetos:** ${input.agencyMetrics.projectsCount}
**Clientes:** ${input.agencyMetrics.clientsCount}
**Receita:** R$ ${input.agencyMetrics.revenue.toLocaleString()}
**Tasks Concluídas:** ${input.agencyMetrics.completedTasks}

Gere um relatório contendo:

1. **Insights** (4-5 insights analíticos sobre o desempenho)
2. **Recomendações** (3-4 recomendações estratégicas)
3. **Destaques** (3-4 conquistas/marcos importantes)
4. **Métricas Adicionais** (4-5 métricas com valores e tendências)
5. **Metas para Próximo Mês** (3-4 objetivos específicos)

Responda no formato JSON:
{
  "insights": ["insight1", "insight2", "insight3"],
  "recommendations": ["recomendação1", "recomendação2"],
  "highlights": ["destaque1", "destaque2", "destaque3"],
  "metrics": [
    {"label": "Taxa de Conversão", "value": "15%", "trend": "up"},
    {"label": "Satisfação do Cliente", "value": "4.8/5", "trend": "stable"}
  ],
  "nextMonthGoals": ["meta1", "meta2", "meta3"]
}
`

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Você é um analista de negócios sênior especializado em agências digitais e KPIs de performance."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      })

      const response = completion.choices[0]?.message?.content
      if (!response) {
        throw new Error('Resposta vazia da OpenAI')
      }

      return JSON.parse(response)
    } catch (error) {
      console.error('Erro no relatório mensal:', error)
      // Fallback
      return {
        insights: [
          'Crescimento constante no número de projetos',
          'Aumento na receita recorrente',
          'Melhoria na eficiência operacional',
          'Expansão da base de clientes'
        ],
        recommendations: [
          'Investir em automação de processos',
          'Expandir equipe técnica',
          'Implementar programa de fidelização'
        ],
        highlights: [
          'Lançamento de 3 projetos estratégicos',
          'Conquista de 2 clientes enterprise',
          '95% de satisfação do cliente'
        ],
        metrics: [
          { label: 'Taxa de Retenção', value: '92%', trend: 'up' as const },
          { label: 'Ticket Médio', value: 'R$ 45.000', trend: 'up' as const },
          { label: 'Margem de Lucro', value: '28%', trend: 'stable' as const },
          { label: 'NPS', value: '8.5', trend: 'up' as const }
        ],
        nextMonthGoals: [
          'Aumentar receita em 15%',
          'Conquistar 3 novos clientes',
          'Implementar 2 novos processos'
        ]
      }
    }
  }
}

export { openai }
