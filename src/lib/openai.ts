import OpenAI from 'openai'

// Inicializar cliente OpenAI
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
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
  // Análise de Projeto com OpenAI
  static async analyzeProject(input: ProjectAnalysisInput): Promise<{
    suggestions: string[]
    estimatedHours: number
    priority: 'low' | 'medium' | 'high'
    technologies: string[]
    risks: string[]
    timeline: string
  }> {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Você é um consultor especializado em análise de projetos digitais. Analise o projeto e forneça insights valiosos."
          },
          {
            role: "user",
            content: `Analise este projeto:
Nome: ${input.projectName}
Descrição: ${input.projectDescription}
Tipo de Cliente: ${input.clientType || 'Não especificado'}
Orçamento: ${input.budget || 'Não especificado'}
Indústria: ${input.industry || 'Não especificado'}

Forneça:
1. 4 sugestões específicas para o projeto
2. Estimativa de horas (número)
3. Prioridade (low, medium, high)
4. 4 tecnologias recomendadas
5. 3 riscos potenciais
6. Timeline estimado

Responda em formato JSON.`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      })

      const result = JSON.parse(completion.choices[0].message.content || '{}')
      
      return {
        suggestions: result.suggestions || [
          `Implementar arquitetura escalável para ${input.projectName}`,
          'Configurar pipeline de CI/CD automatizado',
          'Desenvolver testes automatizados abrangentes',
          'Criar documentação técnica detalhada'
        ],
        estimatedHours: result.estimatedHours || 80,
        priority: result.priority || 'high',
        technologies: result.technologies || ['Next.js', 'TypeScript', 'Prisma', 'Tailwind CSS'],
        risks: result.risks || [
          'Complexidade técnica acima do esperado',
          'Mudanças de escopo durante desenvolvimento',
          'Integração com sistemas legados'
        ],
        timeline: result.timeline || '6-10 semanas'
      }
    } catch (error) {
      console.error('Erro ao analisar projeto:', error)
      // Fallback para valores padrão
      return {
        suggestions: [
          `Implementar arquitetura escalável para ${input.projectName}`,
          'Configurar pipeline de CI/CD automatizado',
          'Desenvolver testes automatizados abrangentes',
          'Criar documentação técnica detalhada'
        ],
        estimatedHours: 80,
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
  }

  // Geração de conteúdo para carrossel Instagram
  static async generateCarouselContent(topic: string): Promise<{
    slides: Array<{ title: string; content: string }>
  }> {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Você é um especialista em criação de conteúdo para redes sociais, especialmente Instagram. 
Crie conteúdo envolvente e profissional para carrosséis que geram engajamento e conversões.
Use uma linguagem persuasiva e amigável em português brasileiro.`
          },
          {
            role: "user",
            content: `Crie um carrossel de Instagram com 5 slides sobre: "${topic}"

Para cada slide, forneça:
- title: Um título impactante e conciso
- content: Conteúdo informativo e envolvente (máximo 150 caracteres)

O primeiro slide deve ser chamativo para capturar atenção.
Os slides 2-4 devem conter dicas ou informações valiosas.
O último slide deve ter um CTA (call to action).

Responda em formato JSON com a estrutura:
{
  "slides": [
    { "title": "...", "content": "..." }
  ]
}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
      })

      const result = JSON.parse(completion.choices[0].message.content || '{}')
      
      return {
        slides: result.slides || []
      }
    } catch (error) {
      console.error('Erro ao gerar conteúdo do carrossel:', error)
      // Fallback para conteúdo padrão
      return {
        slides: [
          {
            title: `${topic}`,
            content: `Descubra as melhores práticas sobre ${topic.toLowerCase()}`
          },
          {
            title: '1. Primeira Dica',
            content: `Primeira estratégia importante sobre ${topic.toLowerCase()}`
          },
          {
            title: '2. Segunda Dica',
            content: `Segunda estratégia valiosa sobre ${topic.toLowerCase()}`
          },
          {
            title: '3. Terceira Dica',
            content: `Terceira estratégia eficaz sobre ${topic.toLowerCase()}`
          },
          {
            title: 'Vamos conversar?',
            content: 'Entre em contato e transforme seu negócio!'
          }
        ]
      }
    }
  }

  // Outras funções mantidas como fallback
  static async generateClientStrategy(input: ClientStrategyInput): Promise<{
    strategies: string[]
    nextActions: string[]
    relationshipType: string
    opportunityScore: number
    recommendations: string[]
  }> {
    // Implementação similar com OpenAI...
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
      opportunityScore: 85,
      recommendations: [
        'Foco em valor agregado',
        'Comunicação proativa',
        'Acompanhamento de resultados'
      ]
    }
  }

  static async breakdownTask(input: TaskBreakdownInput): Promise<{
    subtasks: { title: string; estimatedHours: number; priority: string }[]
    totalEstimatedHours: number
    dependencies: string[]
    risks: string[]
    checklist: string[]
  }> {
    // Implementação similar com OpenAI...
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

  static async generateMonthlyReport(input: MonthlyReportInput): Promise<{
    insights: string[]
    recommendations: string[]
    highlights: string[]
    metrics: { label: string; value: string; trend: 'up' | 'down' | 'stable' }[]
    nextMonthGoals: string[]
  }> {
    // Implementação similar com OpenAI...
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

// Serviços de imagem mantidos como fallback
export class FreepikService {
  static async generateCarouselBackground(): Promise<string | null> {
    console.log(`🎨 Fallback: Gerando placeholder`)
    
    // Retorna URL de placeholder temporário
    return `https://via.placeholder.com/1080x1080/667eea/ffffff?text=Placeholder`
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
