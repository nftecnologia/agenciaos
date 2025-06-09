// Versão temporária simplificada para permitir build
// TODO: Restaurar integração OpenAI quando build estiver funcionando

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
  // Fallback: Análise de Projeto sem OpenAI
  static async analyzeProject(input: ProjectAnalysisInput): Promise<{
    suggestions: string[]
    estimatedHours: number
    priority: 'low' | 'medium' | 'high'
    technologies: string[]
    risks: string[]
    timeline: string
  }> {
    // Simulação temporária baseada no input
    return {
      suggestions: [
        `Implementar arquitetura escalável para ${input.projectName}`,
        'Configurar pipeline de CI/CD automatizado',
        'Desenvolver testes automatizados abrangentes',
        'Criar documentação técnica detalhada'
      ],
      estimatedHours: Math.floor(Math.random() * 200) + 50,
      priority: 'high',
      technologies: ['Next.js', 'TypeScript', 'Prisma', 'Tailwind CSS'],
      risks: [
        'Complexidade técnica acima do esperado',
        'Mudanças de escopo durante desenvolvimento',
        'Integração com sistemas legados'
      ],
      timeline: '6-10 semanas'
    }
  }

  // Fallback: Estratégia de Cliente sem OpenAI
  static async generateClientStrategy(input: ClientStrategyInput): Promise<{
    strategies: string[]
    nextActions: string[]
    relationshipType: string
    opportunityScore: number
    recommendations: string[]
  }> {
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

  // Fallback: Breakdown de Task sem OpenAI
  static async breakdownTask(input: TaskBreakdownInput): Promise<{
    subtasks: { title: string; estimatedHours: number; priority: string }[]
    totalEstimatedHours: number
    dependencies: string[]
    risks: string[]
    checklist: string[]
  }> {
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

  // Fallback: Relatório Mensal sem OpenAI
  static async generateMonthlyReport(input: MonthlyReportInput): Promise<{
    insights: string[]
    recommendations: string[]
    highlights: string[]
    metrics: { label: string; value: string; trend: 'up' | 'down' | 'stable' }[]
    nextMonthGoals: string[]
  }> {
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
        { label: 'Taxa de Retenção', value: '92%', trend: 'up' },
        { label: 'Ticket Médio', value: 'R$ 45.000', trend: 'up' },
        { label: 'Margem de Lucro', value: '28%', trend: 'stable' },
        { label: 'NPS', value: '8.5', trend: 'up' }
      ],
      nextMonthGoals: [
        'Aumentar receita em 15%',
        'Conquistar 3 novos clientes',
        'Implementar 2 novos processos'
      ]
    }
  }
}

// Fallback: Geração de Imagens sem DALL-E/Freepik
export class FreepikService {
  static async generateCarouselBackground(input: {
    topic: string
    slideNumber: number
    slideTitle: string
    slideContent?: string
    style?: 'professional' | 'modern' | 'colorful' | 'minimalist'
  }): Promise<string | null> {
    console.log(`🎨 Fallback: Gerando placeholder para slide ${input.slideNumber}`)
    
    // Retorna URL de placeholder temporário
    return `https://via.placeholder.com/1080x1080/667eea/ffffff?text=Slide+${input.slideNumber}`
  }

  static async generateCarouselBackgrounds(input: {
    topic: string
    slides: Array<{ title: string; content?: string }>
    style?: 'professional' | 'modern' | 'colorful' | 'minimalist'
  }): Promise<Array<string | null>> {
    console.log(`🎨 Fallback: Gerando ${input.slides.length} placeholders`)
    
    return input.slides.map((_, index) => 
      `https://via.placeholder.com/1080x1080/667eea/ffffff?text=Slide+${index + 1}`
    )
  }
}

// Aliases para compatibilidade
export const DALLEService = FreepikService
export const RunwareService = FreepikService

// Mock do cliente OpenAI para compatibilidade
export const openai = {
  chat: {
    completions: {
      create: async () => {
        throw new Error('OpenAI temporariamente desabilitado - use fallbacks')
      }
    }
  }
}
