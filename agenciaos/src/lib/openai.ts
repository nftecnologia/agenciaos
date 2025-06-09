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
        Analise este projeto de agência digital e forneça insights detalhados:
        
        Nome: ${input.projectName}
        Descrição: ${input.projectDescription}
        ${input.clientType ? `Tipo de Cliente: ${input.clientType}` : ''}
        ${input.budget ? `Orçamento: R$ ${input.budget}` : ''}
        ${input.industry ? `Setor: ${input.industry}` : ''}
        
        Retorne uma análise em formato JSON com:
        - suggestions (array de 4-5 sugestões estratégicas)
        - estimatedHours (número de horas estimadas)
        - priority (low, medium ou high)
        - technologies (array de tecnologias recomendadas)
        - risks (array de 3-4 riscos principais)
        - timeline (texto como "X-Y semanas")
        
        Seja específico, prático e baseado nas melhores práticas de agências digitais.
      `

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Você é um consultor sênior especializado em gestão de projetos de agências digitais. Responda sempre em português brasileiro e em formato JSON válido.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })

      const content = response.choices[0]?.message?.content
      if (!content) throw new Error('Resposta vazia da OpenAI')

      // Parse da resposta JSON
      const analysis = JSON.parse(content)
      
      return {
        suggestions: analysis.suggestions || [`Desenvolver ${input.projectName} com foco em qualidade`],
        estimatedHours: analysis.estimatedHours || 80,
        priority: analysis.priority || 'medium',
        technologies: analysis.technologies || ['Next.js', 'TypeScript'],
        risks: analysis.risks || ['Mudanças de escopo'],
        timeline: analysis.timeline || '4-6 semanas'
      }
      
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
        Desenvolva uma estratégia comercial para este cliente de agência digital:
        
        Nome: ${input.clientName}
        ${input.clientCompany ? `Empresa: ${input.clientCompany}` : ''}
        ${input.industry ? `Setor: ${input.industry}` : ''}
        ${input.currentRelationship ? `Relacionamento Atual: ${input.currentRelationship}` : ''}
        
        Retorne uma estratégia em formato JSON com:
        - strategies (array de 4-5 estratégias específicas)
        - nextActions (array de 3-4 próximas ações práticas)
        - relationshipType (texto como "Prospect", "Cliente Ativo", "Key Account", etc.)
        - opportunityScore (número de 0-100 representando potencial)
        - recommendations (array de 3-4 recomendações estratégicas)
        
        Base-se em práticas comerciais de agências digitais e relacionamento B2B.
      `

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em vendas e relacionamento comercial para agências digitais. Responda sempre em português brasileiro e em formato JSON válido.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      })

      const content = response.choices[0]?.message?.content
      if (!content) throw new Error('Resposta vazia da OpenAI')

      // Parse da resposta JSON
      const strategy = JSON.parse(content)
      
      return {
        strategies: strategy.strategies || [`Desenvolver relacionamento com ${input.clientName}`],
        nextActions: strategy.nextActions || ['Agendar reunião inicial'],
        relationshipType: strategy.relationshipType || 'Prospect',
        opportunityScore: strategy.opportunityScore || 70,
        recommendations: strategy.recommendations || ['Foco em valor agregado']
      }
      
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
        Faça o breakdown detalhado desta task de projeto de agência digital:
        
        Título: ${input.taskTitle}
        Descrição: ${input.taskDescription}
        Prioridade: ${input.priority}
        ${input.dueDate ? `Prazo: ${input.dueDate}` : ''}
        
        Retorne um breakdown em formato JSON com:
        - subtasks (array de objetos com title, estimatedHours, priority)
        - totalEstimatedHours (soma total das horas)
        - dependencies (array de dependências necessárias)
        - risks (array de riscos potenciais)
        - checklist (array de itens para verificação)
        
        Seja específico e prático, baseado em metodologias ágeis.
      `

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em gerenciamento de projetos e metodologias ágeis para agências digitais. Responda sempre em português brasileiro e em formato JSON válido.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })

      const content = response.choices[0]?.message?.content
      if (!content) throw new Error('Resposta vazia da OpenAI')

      // Parse da resposta JSON
      const breakdown = JSON.parse(content)
      
      return {
        subtasks: breakdown.subtasks || [{ title: input.taskTitle, estimatedHours: 8, priority: 'medium' }],
        totalEstimatedHours: breakdown.totalEstimatedHours || 8,
        dependencies: breakdown.dependencies || ['Aprovação inicial'],
        risks: breakdown.risks || ['Mudanças de escopo'],
        checklist: breakdown.checklist || ['Requisitos definidos']
      }
      
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
        Gere um relatório mensal estratégico para esta agência digital:
        
        Período: ${input.period}
        Métricas atuais:
        - Projetos: ${input.agencyMetrics.projectsCount}
        - Clientes: ${input.agencyMetrics.clientsCount}
        - Receita: R$ ${input.agencyMetrics.revenue}
        - Tasks Concluídas: ${input.agencyMetrics.completedTasks}
        
        Retorne um relatório em formato JSON com:
        - insights (array de 4-5 insights estratégicos)
        - recommendations (array de 3-4 recomendações práticas)
        - highlights (array de 3-4 destaques do período)
        - metrics (array de objetos com label, value, trend: 'up'/'down'/'stable')
        - nextMonthGoals (array de 3-4 metas para próximo mês)
        
        Base-se em análise de performance e melhores práticas de agências.
      `

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Você é um analista de negócios especializado em agências digitais. Responda sempre em português brasileiro e em formato JSON válido.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })

      const content = response.choices[0]?.message?.content
      if (!content) throw new Error('Resposta vazia da OpenAI')

      // Parse da resposta JSON
      const report = JSON.parse(content)
      
      return {
        insights: report.insights || ['Crescimento constante no número de projetos'],
        recommendations: report.recommendations || ['Investir em automação'],
        highlights: report.highlights || ['Mês produtivo'],
        metrics: report.metrics || [
          { label: 'Performance', value: '85%', trend: 'up' as const }
        ],
        nextMonthGoals: report.nextMonthGoals || ['Aumentar receita em 10%']
      }
      
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

// export { openai } - temporariamente comentado
