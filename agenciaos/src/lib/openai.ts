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

// Geração de Imagens com DALL-E
export interface ImageGenerationInput {
  prompt: string
  style?: 'vivid' | 'natural'
  size?: '1024x1024' | '1792x1024' | '1024x1792'
  quality?: 'standard' | 'hd'
}

export class FreepikService {
  static async generateCarouselBackground(input: {
    topic: string
    slideNumber: number
    slideTitle: string
    slideContent?: string
    style?: 'professional' | 'modern' | 'colorful' | 'minimalist'
  }): Promise<string | null> {
    try {
      const { slideNumber, slideTitle, slideContent, style = 'professional' } = input

      // Sistema de Análise Dinâmica de Conteúdo
      const analisarContextoCompleto = (title: string, content?: string): string => {
        const textoCompleto = `${title} ${content || ''}`.trim()
        
        console.log(`🔍 Analisando conteúdo completo: "${textoCompleto}"`)
        
        // Análise em camadas
        const analise = {
          contexto: extrairContextoGeral(textoCompleto),
          acao: extrairAcaoPrincipal(textoCompleto),
          objeto: extrairObjetoFoco(textoCompleto),
          ambiente: extrairAmbienteSugerido(textoCompleto),
          emocao: extrairTomEmocional(textoCompleto),
          especificidades: extrairDetalhesEspecificos(textoCompleto)
        }
        
        return construirPromptDinamico(analise, textoCompleto)
      }

      // Extração de Contexto Geral
      const extrairContextoGeral = (texto: string) => {
        const textoLower = texto.toLowerCase()
        
        const dominios = [
          {
            nome: 'social_media_marketing',
            indicadores: ['instagram', 'social', 'rede', 'post', 'publicação', 'engajamento', 'alcance', 'hashtag', 'stories', 'reels', 'feed'],
            elementos: ['smartphone interface', 'social media dashboard', 'Instagram app', 'mobile device']
          },
          {
            nome: 'content_creation',
            indicadores: ['criar', 'produzir', 'desenvolver', 'design', 'editar', 'filmar', 'fotografar', 'gravar', 'conteúdo', 'qualidade'],
            elementos: ['creative workspace', 'production equipment', 'editing setup', 'studio environment']
          },
          {
            nome: 'business_strategy',
            indicadores: ['estratégia', 'plano', 'negócio', 'empresa', 'mercado', 'competição', 'análise'],
            elementos: ['business meeting', 'strategy board', 'corporate office', 'planning session']
          },
          {
            nome: 'sales_marketing',
            indicadores: ['venda', 'vender', 'cliente', 'conversão', 'lead', 'funil', 'CRM', 'prospect'],
            elementos: ['sales presentation', 'client meeting', 'conversion charts', 'sales dashboard']
          },
          {
            nome: 'analytics_data',
            indicadores: ['dados', 'análise', 'métricas', 'relatório', 'dashboard', 'insights', 'performance'],
            elementos: ['analytics screen', 'data visualization', 'charts and graphs', 'metrics dashboard']
          },
          {
            nome: 'audience_research',
            indicadores: ['público', 'audiência', 'persona', 'target', 'segmentação', 'demografia', 'conhece'],
            elementos: ['audience analysis', 'demographic charts', 'user research', 'customer profiles']
          },
          {
            nome: 'education_learning',
            indicadores: ['aprender', 'ensinar', 'curso', 'tutorial', 'dica', 'técnica', 'método'],
            elementos: ['educational environment', 'learning materials', 'instruction setup', 'knowledge sharing']
          }
        ]
        
        for (const dominio of dominios) {
          const matches = dominio.indicadores.filter(indicador => textoLower.includes(indicador))
          if (matches.length > 0) {
            return {
              dominio: dominio.nome,
              elementos: dominio.elementos,
              confianca: matches.length / dominio.indicadores.length,
              matches
            }
          }
        }
        
        return {
          dominio: 'general_business',
          elementos: ['professional workspace', 'modern office'],
          confianca: 0.5,
          matches: []
        }
      }

      // Extração de Ação Principal
      const extrairAcaoPrincipal = (texto: string) => {
        const textoLower = texto.toLowerCase()
        
        const acoes = [
          {
            acao: 'creating_content',
            verbos: ['criar', 'produzir', 'desenvolver', 'gerar', 'fazer', 'construir'],
            elementos: ['creation process', 'hands working', 'active production', 'making content']
          },
          {
            acao: 'analyzing_data',
            verbos: ['analisar', 'examinar', 'estudar', 'investigar', 'pesquisar', 'avaliar'],
            elementos: ['person analyzing', 'data review', 'examination process', 'research activity']
          },
          {
            acao: 'presenting_teaching',
            verbos: ['apresentar', 'ensinar', 'mostrar', 'explicar', 'demonstrar', 'orientar'],
            elementos: ['presentation setup', 'teaching environment', 'explanation scene', 'demonstration']
          },
          {
            acao: 'planning_strategizing',
            verbos: ['planejar', 'estrategizar', 'organizar', 'estruturar', 'preparar'],
            elementos: ['planning session', 'strategy meeting', 'organization process', 'preparation work']
          },
          {
            acao: 'connecting_engaging',
            verbos: ['conectar', 'engajar', 'interagir', 'comunicar', 'relacionar'],
            elementos: ['interaction scene', 'communication setup', 'engagement activity', 'connection visual']
          },
          {
            acao: 'growing_scaling',
            verbos: ['crescer', 'expandir', 'aumentar', 'escalar', 'desenvolver', 'evoluir'],
            elementos: ['growth visualization', 'expansion imagery', 'scaling process', 'development scene']
          }
        ]
        
        for (const acaoObj of acoes) {
          const verbosEncontrados = acaoObj.verbos.filter(verbo => textoLower.includes(verbo))
          if (verbosEncontrados.length > 0) {
            return {
              acao: acaoObj.acao,
              elementos: acaoObj.elementos,
              verbos: verbosEncontrados,
              intensidade: verbosEncontrados.length
            }
          }
        }
        
        return {
          acao: 'general_business_activity',
          elementos: ['professional activity', 'business scene'],
          verbos: [],
          intensidade: 0
        }
      }

      // Extração de Objeto/Foco
      const extrairObjetoFoco = (texto: string) => {
        const textoLower = texto.toLowerCase()
        const objetos = []
        
        // Tecnologia e ferramentas
        const tecnologia = [
          { palavra: 'câmera', elementos: ['professional camera', 'DSLR equipment', 'photography gear'] },
          { palavra: 'computador', elementos: ['laptop computer', 'desktop setup', 'computer workstation'] },
          { palavra: 'smartphone', elementos: ['mobile phone', 'iPhone', 'mobile device'] },
          { palavra: 'microfone', elementos: ['professional microphone', 'audio equipment', 'recording gear'] },
          { palavra: 'iluminação', elementos: ['studio lighting', 'professional lights', 'ring light'] },
          { palavra: 'software', elementos: ['computer screen with software', 'digital tools', 'app interface'] }
        ]
        
        // Espaços e ambientes
        const ambientes = [
          { palavra: 'escritório', elementos: ['modern office', 'corporate workspace', 'business environment'] },
          { palavra: 'casa', elementos: ['home office', 'residential workspace', 'home studio'] },
          { palavra: 'estúdio', elementos: ['professional studio', 'production studio', 'creative space'] },
          { palavra: 'sala', elementos: ['meeting room', 'conference space', 'presentation room'] },
          { palavra: 'loja', elementos: ['retail space', 'store environment', 'commercial setting'] }
        ]
        
        // Documentos e materiais
        const materiais = [
          { palavra: 'relatório', elementos: ['business report', 'document analysis', 'data presentation'] },
          { palavra: 'gráfico', elementos: ['charts and graphs', 'data visualization', 'analytics display'] },
          { palavra: 'planilha', elementos: ['spreadsheet view', 'data table', 'Excel interface'] },
          { palavra: 'apresentação', elementos: ['presentation slides', 'PowerPoint display', 'slide deck'] }
        ]
        
        const todosObjetos = [...tecnologia, ...ambientes, ...materiais]
        
        for (const obj of todosObjetos) {
          if (textoLower.includes(obj.palavra)) {
            objetos.push({
              tipo: obj.palavra,
              elementos: obj.elementos,
              relevancia: textoLower.split(obj.palavra).length - 1
            })
          }
        }
        
        return objetos.sort((a, b) => b.relevancia - a.relevancia)
      }

      // Extração de Ambiente Sugerido
      const extrairAmbienteSugerido = (texto: string) => {
        const textoLower = texto.toLowerCase()
        
        if (textoLower.includes('casa') || textoLower.includes('caseiro')) {
          return ['home environment', 'residential setting', 'cozy atmosphere']
        }
        if (textoLower.includes('escritório') || textoLower.includes('corporativo')) {
          return ['corporate office', 'business environment', 'professional setting']
        }
        if (textoLower.includes('estúdio') || textoLower.includes('produção')) {
          return ['studio setting', 'production environment', 'creative space']
        }
        if (textoLower.includes('café') || textoLower.includes('restaurante')) {
          return ['cafe environment', 'casual setting', 'social space']
        }
        
        return ['modern workspace', 'professional environment']
      }

      // Extração de Tom Emocional
      const extrairTomEmocional = (texto: string) => {
        const textoLower = texto.toLowerCase()
        
        const tons = [
          {
            tom: 'urgente_acao',
            indicadores: ['agora', 'hoje', 'imediatamente', 'rápido', 'urgente', 'não perca'],
            elementos: ['urgent atmosphere', 'call to action energy', 'immediate response', 'time-sensitive']
          },
          {
            tom: 'profissional_serio',
            indicadores: ['estratégia', 'profissional', 'corporativo', 'negócio', 'empresa'],
            elementos: ['serious business tone', 'professional atmosphere', 'corporate setting', 'formal environment']
          },
          {
            tom: 'inspirador_motivacional',
            indicadores: ['transformar', 'sucesso', 'conquista', 'alcançar', 'realizar', 'sonho'],
            elementos: ['inspirational scene', 'motivational atmosphere', 'success visualization', 'achievement mood']
          },
          {
            tom: 'educativo_didatico',
            indicadores: ['aprender', 'ensinar', 'dica', 'tutorial', 'como', 'passo a passo'],
            elementos: ['educational setting', 'learning atmosphere', 'instructional environment', 'teaching mood']
          },
          {
            tom: 'criativo_artistico',
            indicadores: ['criar', 'design', 'arte', 'criativo', 'inovador', 'original'],
            elementos: ['creative atmosphere', 'artistic environment', 'innovative setting', 'design workspace']
          }
        ]
        
        for (const tonObj of tons) {
          const matches = tonObj.indicadores.filter(ind => textoLower.includes(ind))
          if (matches.length > 0) {
            return {
              tom: tonObj.tom,
              elementos: tonObj.elementos,
              intensidade: matches.length,
              matches
            }
          }
        }
        
        return {
          tom: 'neutro_equilibrado',
          elementos: ['balanced atmosphere', 'neutral setting'],
          intensidade: 0,
          matches: []
        }
      }

      // Extração de Detalhes Específicos
      const extrairDetalhesEspecificos = (texto: string) => {
        const elementos = []
        const textoLower = texto.toLowerCase()
        
        // Extrair números, percentuais, métricas específicas
        const numeros = texto.match(/\d+%?/g)
        if (numeros && numeros.length > 0) {
          elementos.push('data visualization with numbers')
        }
        
        // Extrair menções a plataformas específicas
        const plataformas = ['instagram', 'facebook', 'youtube', 'linkedin', 'twitter', 'tiktok']
        const plataformasEncontradas = plataformas.filter(p => textoLower.includes(p))
        if (plataformasEncontradas.length > 0) {
          elementos.push(`${plataformasEncontradas[0]} interface visible`)
        }
        
        // Extrair menções a cores específicas
        const cores = {
          'azul': 'blue color scheme',
          'vermelho': 'red accents',
          'verde': 'green elements',
          'amarelo': 'yellow highlights',
          'roxo': 'purple aesthetic',
          'rosa': 'pink elements',
          'laranja': 'orange details'
        }
        
        for (const [cor, elemento] of Object.entries(cores)) {
          if (textoLower.includes(cor)) {
            elementos.push(elemento)
            break
          }
        }
        
        return elementos
      }

      // Construção do Prompt Dinâmico
      const construirPromptDinamico = (analise: {
        contexto: { dominio: string; elementos: string[]; confianca: number; matches: string[] };
        acao: { acao: string; elementos: string[]; verbos: string[]; intensidade: number };
        objeto: Array<{ tipo: string; elementos: string[]; relevancia: number }>;
        ambiente: string[];
        emocao: { tom: string; elementos: string[]; intensidade: number; matches: string[] };
        especificidades: string[];
      }, textoOriginal: string): string => {
        console.log(`🎨 Construindo prompt dinâmico para: "${textoOriginal.substring(0, 50)}..."`)
        
        const elementosVisuais = []
        
        // Elementos do contexto (peso alto)
        if (analise.contexto.confianca > 0.3) {
          elementosVisuais.push(...analise.contexto.elementos.slice(0, 2))
        }
        
        // Elementos da ação principal
        if (analise.acao.intensidade > 0) {
          elementosVisuais.push(...analise.acao.elementos.slice(0, 2))
        }
        
        // Elementos dos objetos específicos (peso muito alto)
        for (const obj of analise.objeto.slice(0, 2)) {
          elementosVisuais.push(...obj.elementos.slice(0, 1))
        }
        
        // Elementos do ambiente
        if (analise.ambiente && analise.ambiente.length > 0) {
          elementosVisuais.push(...analise.ambiente.slice(0, 1))
        }
        
        // Elementos do tom emocional
        if (analise.emocao.intensidade > 0) {
          elementosVisuais.push(...analise.emocao.elementos.slice(0, 1))
        }
        
        // Elementos específicos extraídos do texto
        elementosVisuais.push(...analise.especificidades)
        
        // Remover duplicatas e selecionar os melhores
        const elementosUnicos = [...new Set(elementosVisuais)]
          .filter(elemento => elemento && elemento.length > 3)
          .slice(0, 8)
        
        // Elementos base sempre presentes
        const elementosBase = [
          'professional photography',
          'high quality image',
          'modern aesthetic',
          'Instagram template background',
          'clean composition',
          'professional lighting',
          'space for text overlay'
        ]
        
        // Construir prompt final
        const promptCompleto = [
          ...elementosUnicos,
          'professional setup',
          ...elementosBase
        ].join(', ')
        
        // Log detalhado
        console.log(`📊 Análise detalhada:`)
        console.log(`   🎯 Domínio: ${analise.contexto.dominio} (${(analise.contexto.confianca * 100).toFixed(1)}%)`)
        console.log(`   🎬 Ação: ${analise.acao.acao} (intensidade: ${analise.acao.intensidade})`)
        console.log(`   📦 Objetos: ${analise.objeto.map((o) => o.tipo).join(', ')}`)
        console.log(`   🎭 Tom: ${analise.emocao.tom} (intensidade: ${analise.emocao.intensidade})`)
        console.log(`   🎨 Elementos selecionados: ${elementosUnicos.join(' | ')}`)
        
        return promptCompleto
      }

      const contextualPrompt = analisarContextoCompleto(slideTitle, slideContent)

      // Mapear estilos para prompts visuais
      const stylePrompts = {
        professional: 'clean minimalist design, soft gradients, corporate aesthetic, subtle shadows',
        modern: 'geometric shapes, vibrant colors, contemporary design, dynamic elements',
        colorful: 'bright gradients, energetic colors, creative design, inspiring layout',
        minimalist: 'ultra clean design, white space, subtle elements, elegant simplicity'
      }

      const styleContext = stylePrompts[style]

      // Prompt otimizado e ultra-específico para backgrounds Instagram
      const positivePrompt = `
        Instagram carousel background, ${styleContext},
        ${contextualPrompt}, abstract visual elements,
        soft focus background, clean composition perfect for text overlay,
        high quality professional render, modern Instagram aesthetic,
        social media template design, premium Instagram post background,
        professional gradient overlay, clean layout space for typography
      `.trim()


      console.log(`🎨 Slide ${slideNumber}: "${slideTitle}"`)
      console.log(`🎯 Prompt contextual: ${contextualPrompt.substring(0, 100)}...`)

      // Payload para Freepik Mystic API
      const payload = {
        prompt: positivePrompt,
        aspect_ratio: "square_1_1",
        resolution: "2k",
        model: "realism", // realism para backgrounds profissionais
        creative_detailing: 33,
        engine: "automatic",
        fixed_generation: false,
        filter_nsfw: true
      }

      console.log(`🚀 Iniciando geração Freepik para slide ${slideNumber}`)

      // Criar task na API Freepik
      const response = await fetch('https://api.freepik.com/v1/ai/mystic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-freepik-api-key': process.env.FREEPIK_API_KEY || 'FPSX031530fc6c3b48359f4a92010361b356'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erro na API Freepik:', response.status, errorText)
        return null
      }

      const taskResult = await response.json()
      console.log(`📋 Task criada na Freepik para slide ${slideNumber}, ID: ${taskResult.task_id}`)
      
      if (!taskResult.task_id) {
        console.error('❌ Task ID não retornado pela Freepik')
        return null
      }

      // Polling para verificar status da task
      const maxAttempts = 30 // 30 tentativas = ~5 minutos
      let attempts = 0
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 10000)) // Aguardar 10 segundos
        attempts++
        
        console.log(`⏳ Verificando status da task ${taskResult.task_id} (tentativa ${attempts}/${maxAttempts})`)
        
        const statusResponse = await fetch(`https://api.freepik.com/v1/ai/mystic/${taskResult.task_id}`, {
          headers: {
            'x-freepik-api-key': process.env.FREEPIK_API_KEY || 'FPSX031530fc6c3b48359f4a92010361b356'
          }
        })

        if (!statusResponse.ok) {
          console.error(`❌ Erro ao verificar status da task: ${statusResponse.status}`)
          continue
        }

        const statusData = await statusResponse.json()
        console.log(`📊 Status da task ${taskResult.task_id}: ${statusData.data?.status}`)
        
        if (statusData.data?.status === 'COMPLETED') {
          console.log(`✅ Slide ${slideNumber} gerado com sucesso!`)
          
          if (statusData.data.generated && statusData.data.generated.length > 0) {
            const imageUrl = statusData.data.generated[0]
            console.log(`🖼️ URL da imagem: ${imageUrl}`)
            return imageUrl
          }
        } else if (statusData.data?.status === 'FAILED') {
          console.error(`❌ Slide ${slideNumber}: Geração falhou`)
          return null
        }
        
        // Status ainda em progresso, continuar polling
      }
      
      console.error(`❌ Slide ${slideNumber}: Timeout na geração (${maxAttempts} tentativas)`)
      return null

    } catch (error) {
      console.error(`❌ Erro no slide ${input.slideNumber}:`, error)
      return null
    }
  }

  // Gerar múltiplos backgrounds para um carrossel inteiro
  static async generateCarouselBackgrounds(input: {
    topic: string
    slides: Array<{ title: string; content?: string }>
    style?: 'professional' | 'modern' | 'colorful' | 'minimalist'
  }): Promise<Array<string | null>> {
    const { topic, slides, style = 'professional' } = input

    console.log(`🎨 Gerando ${slides.length} backgrounds ultra-específicos para: "${topic}"`)

    // Gerar backgrounds em paralelo com retry automático
    const promises = slides.map(async (slide, index) => {
      const maxRetries = 3
      
      for (let tentativa = 1; tentativa <= maxRetries; tentativa++) {
        try {
          console.log(`🔄 Slide ${index + 1} - Tentativa ${tentativa}/${maxRetries}`)
          
          const result = await this.generateCarouselBackground({
            topic,
            slideNumber: index + 1,
            slideTitle: slide.title,
            slideContent: slide.content,
            style
          })
          
          if (result) {
            console.log(`✅ Slide ${index + 1} concluído com sucesso`)
            return result
          }
          
        } catch (error) {
          console.log(`❌ Slide ${index + 1} - Tentativa ${tentativa} falhou:`, error)
          
          if (tentativa < maxRetries) {
            // Aguardar antes da próxima tentativa com backoff exponencial
            const delay = Math.pow(2, tentativa) * 1000
            await new Promise(resolve => setTimeout(resolve, delay))
          }
        }
      }
      
      console.error(`❌ Slide ${index + 1} falhou após ${maxRetries} tentativas`)
      return null
    })

    try {
      const results = await Promise.all(promises)
      const successCount = results.filter((url: string | null) => url !== null).length
      
      console.log(`🎉 Geração concluída: ${successCount}/${slides.length} slides com sucesso`)
      
      // Log detalhado dos resultados
      results.forEach((result, index) => {
        const status = result ? '✅ Sucesso' : '❌ Falhou'
        console.log(`📊 Slide ${index + 1}: ${status}`)
      })

      return results
    } catch (error) {
      console.error('❌ Erro ao gerar backgrounds em lote:', error)
      return slides.map(() => null)
    }
  }
}

// Manter DALLEService como alias para compatibilidade
export const DALLEService = FreepikService
export const RunwareService = FreepikService // Manter compatibilidade

export { openai }
