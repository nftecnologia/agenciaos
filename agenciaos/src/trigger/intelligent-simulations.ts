// Simulações inteligentes e contextuais para jobs do Trigger.dev
// Gera resultados específicos baseados no conteúdo recebido

interface AIJobPayload {
  agencyId: string;
  content: string;
}

interface WebhookPayload {
  event: string;
  customerId: string;
}

// Detecta o tipo de projeto baseado no conteúdo
function detectProjectType(content: string): string {
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('e-commerce') || lowerContent.includes('loja') || lowerContent.includes('venda')) {
    return 'ecommerce';
  }
  if (lowerContent.includes('app') || lowerContent.includes('mobile') || lowerContent.includes('aplicativo')) {
    return 'mobile-app';
  }
  if (lowerContent.includes('site') || lowerContent.includes('website') || lowerContent.includes('landing')) {
    return 'website';
  }
  if (lowerContent.includes('sistema') || lowerContent.includes('software') || lowerContent.includes('crm')) {
    return 'system';
  }
  if (lowerContent.includes('marketing') || lowerContent.includes('campanha') || lowerContent.includes('publicidade')) {
    return 'marketing';
  }
  return 'general';
}

// Detecta o tipo de empresa baseado no nome/descrição
function detectCompanyType(content: string): string {
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('restaurante') || lowerContent.includes('comida') || lowerContent.includes('gastronomia')) {
    return 'restaurant';
  }
  if (lowerContent.includes('tech') || lowerContent.includes('software') || lowerContent.includes('tecnologia')) {
    return 'tech';
  }
  if (lowerContent.includes('consultoria') || lowerContent.includes('consultório') || lowerContent.includes('advogado')) {
    return 'services';
  }
  if (lowerContent.includes('loja') || lowerContent.includes('varejo') || lowerContent.includes('comércio')) {
    return 'retail';
  }
  return 'general';
}

// Gera sugestões específicas por tipo de projeto
function generateProjectSuggestions(type: string, projectName: string): string[] {
  const suggestions: Record<string, string[]> = {
    ecommerce: [
      `Implementar sistema de recomendações personalizadas para ${projectName}`,
      'Criar funil de vendas otimizado com checkout em uma página',
      'Configurar abandono de carrinho com sequência de emails automática',
      'Desenvolver programa de cashback e fidelidade',
      'Implementar reviews e avaliações de produtos',
      'Criar sistema de wishlist compartilhável',
      'Integrar chat ao vivo para suporte durante compras'
    ],
    'mobile-app': [
      `Implementar onboarding interativo para ${projectName}`,
      'Criar sistema de notificações push inteligentes',
      'Desenvolver funcionalidade offline-first',
      'Implementar autenticação biométrica',
      'Criar sistema de gamificação com pontos',
      'Desenvolver dark mode automático',
      'Implementar analytics de comportamento do usuário'
    ],
    website: [
      `Otimizar velocidade de carregamento para ${projectName}`,
      'Implementar SEO técnico avançado',
      'Criar landing pages de alta conversão',
      'Desenvolver formulários inteligentes',
      'Implementar chat bot para atendimento',
      'Criar sistema de blog integrado',
      'Otimizar para dispositivos móveis'
    ],
    system: [
      `Implementar dashboard analytics para ${projectName}`,
      'Criar sistema de relatórios automatizados',
      'Desenvolver API robusta e documentada',
      'Implementar backup automático de dados',
      'Criar sistema de permissões granulares',
      'Desenvolver integrações com ERPs',
      'Implementar auditoria de ações do usuário'
    ],
    marketing: [
      `Criar funil de marketing digital para ${projectName}`,
      'Implementar automação de email marketing',
      'Desenvolver landing pages A/B testadas',
      'Criar campanhas de retargeting personalizadas',
      'Implementar tracking avançado de conversões',
      'Desenvolver conteúdo SEO otimizado',
      'Criar estratégia de social media integrada'
    ],
    general: [
      `Desenvolver estratégia digital completa para ${projectName}`,
      'Implementar analytics e métricas de performance',
      'Criar sistema de backup e segurança',
      'Desenvolver documentação técnica completa',
      'Implementar testes automatizados',
      'Criar processo de deploy automatizado'
    ]
  };

  const baseSuggestions = suggestions[type] || suggestions.general;
  return baseSuggestions.slice(0, 4); // Retorna 4 sugestões
}

// Gera estratégias específicas por tipo de empresa
function generateClientStrategies(type: string, companyName: string): string[] {
  const strategies: Record<string, string[]> = {
    restaurant: [
      `Implementar cardápio digital QR Code para ${companyName}`,
      'Criar sistema próprio de delivery',
      'Desenvolver programa de fidelidade gastronômica',
      'Implementar sistema de reservas online',
      'Criar campanhas de marketing sazonal',
      'Desenvolver parcerias com influenciadores locais'
    ],
    tech: [
      `Criar estratégia de thought leadership para ${companyName}`,
      'Desenvolver cases de sucesso documentados',
      'Implementar programa de parcerias tecnológicas',
      'Criar conteúdo técnico para blog',
      'Desenvolver presença em eventos do setor',
      'Implementar sistema de lead scoring'
    ],
    services: [
      `Desenvolver funil de captação para ${companyName}`,
      'Implementar sistema de agendamento online',
      'Criar conteúdo educativo para clientes',
      'Desenvolver programa de referências',
      'Implementar CRM personalizado',
      'Criar estratégia de networking digital'
    ],
    retail: [
      `Implementar omnichannel para ${companyName}`,
      'Criar programa de fidelidade digital',
      'Desenvolver estratégia de vendas sazonais',
      'Implementar sistema de estoque inteligente',
      'Criar campanhas de cross-selling',
      'Desenvolver experiência de compra personalizada'
    ],
    general: [
      `Desenvolver presença digital robusta para ${companyName}`,
      'Implementar estratégia de content marketing',
      'Criar funil de vendas otimizado',
      'Desenvolver programa de relacionamento',
      'Implementar análise de concorrência',
      'Criar métricas de ROI personalizadas'
    ]
  };

  const baseStrategies = strategies[type] || strategies.general;
  return baseStrategies.slice(0, 4);
}

// Gera próximas ações específicas
function generateNextActions(type: string): string[] {
  const actions: Record<string, string[]> = {
    restaurant: [
      'Agendar visita para análise do ambiente físico',
      'Preparar proposta de cardápio digital',
      'Pesquisar concorrência local de delivery'
    ],
    tech: [
      'Agendar apresentação de cases similares',
      'Preparar auditoria técnica atual',
      'Mapear stack tecnológico existente'
    ],
    services: [
      'Agendar reunião de descoberta do negócio',
      'Preparar análise do funil atual',
      'Pesquisar concorrência direta'
    ],
    retail: [
      'Agendar análise da jornada do cliente',
      'Preparar proposta omnichannel',
      'Pesquisar tendências do setor'
    ],
    general: [
      'Agendar reunião de alinhamento estratégico',
      'Preparar análise de mercado personalizada',
      'Mapear objetivos de curto e longo prazo'
    ]
  };

  return actions[type] || actions.general;
}

// Gera breakdown de tasks complexas
function generateTaskBreakdown(title: string, description: string): string[] {
  const lowerTitle = title.toLowerCase();
  const lowerDesc = description.toLowerCase();
  
  if (lowerTitle.includes('landing') || lowerDesc.includes('landing')) {
    return [
      'Pesquisa e análise de concorrência (2h)',
      'Criação de wireframes e estrutura (3h)',
      'Design visual e identidade (4h)',
      'Desenvolvimento frontend responsivo (8h)',
      'Implementação de formulários e integrações (3h)',
      'Otimização SEO e performance (2h)',
      'Testes em dispositivos e browsers (2h)',
      'Deploy e configuração de domínio (1h)'
    ];
  }
  
  if (lowerTitle.includes('app') || lowerDesc.includes('aplicativo')) {
    return [
      'Definição de arquitetura e tecnologias (2h)',
      'Criação de protótipos navegáveis (4h)',
      'Desenvolvimento da autenticação (6h)',
      'Implementação das telas principais (12h)',
      'Integração com APIs externas (4h)',
      'Implementação de notificações push (3h)',
      'Testes unitários e de integração (4h)',
      'Build e publicação nas stores (2h)'
    ];
  }
  
  if (lowerTitle.includes('sistema') || lowerDesc.includes('crm')) {
    return [
      'Levantamento de requisitos detalhados (3h)',
      'Modelagem do banco de dados (4h)',
      'Desenvolvimento da API backend (10h)',
      'Criação do painel administrativo (8h)',
      'Implementação de relatórios (4h)',
      'Sistema de permissões e roles (3h)',
      'Testes de segurança e performance (3h)',
      'Documentação técnica (2h)'
    ];
  }
  
  // Breakdown genérico para tasks complexas
  return [
    'Análise e planejamento detalhado (2h)',
    'Pesquisa de tecnologias e ferramentas (1h)',
    'Criação de estrutura base (3h)',
    'Desenvolvimento da funcionalidade principal (6h)',
    'Implementação de recursos secundários (4h)',
    'Testes e correções (2h)',
    'Documentação e deploy (1h)',
    'Validação com stakeholders (1h)'
  ];
}

// Calcula estimativa total baseada no breakdown
function calculateEstimate(breakdown: string[]): number {
  return breakdown.reduce((total, item) => {
    const match = item.match(/\((\d+)h\)/);
    return total + (match ? parseInt(match[1]) : 2);
  }, 0);
}

// Job de IA inteligente
export const intelligentAIJob = {
  id: "intelligent-ai-job",
  trigger: async (payload: AIJobPayload) => {
    console.log(`[IA INTELIGENTE] Analisando: ${payload.content}`);
    
    // Simular tempo de processamento realista (5-15 segundos)
    const processingTime = Math.random() * 10000 + 5000;
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    // Analisar o conteúdo para gerar resultados específicos
    const content = payload.content.toLowerCase();
    
    let result;
    
    // Detectar se é projeto, cliente ou task
    if (content.includes('projeto') || content.includes('gerar sugestões')) {
      const projectMatch = content.match(/projeto[:\s]+"([^"]+)"/);
      const projectName = projectMatch ? projectMatch[1] : 'Projeto';
      const type = detectProjectType(content);
      
      result = {
        type: 'project-analysis',
        title: `Análise de Projeto: ${projectName}`,
        suggestions: generateProjectSuggestions(type, projectName),
        estimatedHours: Math.floor(Math.random() * 100) + 50,
        priority: type === 'ecommerce' || type === 'mobile-app' ? 'high' : 'medium',
        projectType: type
      };
    } 
    else if (content.includes('cliente') || content.includes('empresarial')) {
      const clientMatch = content.match(/cliente[:\s]+"([^"]+)"/);
      const companyMatch = content.match(/empresa[:\s]+"([^"]+)"/);
      const clientName = clientMatch ? clientMatch[1] : companyMatch ? companyMatch[1] : 'Cliente';
      const type = detectCompanyType(content);
      
      result = {
        type: 'client-strategy',
        title: `Estratégias para ${clientName}`,
        strategies: generateClientStrategies(type, clientName),
        nextActions: generateNextActions(type),
        companyType: type,
        priority: 'high'
      };
    }
    else if (content.includes('tarefa') || content.includes('subtasks')) {
      const taskMatch = content.match(/tarefa[:\s]+"([^"]+)"/);
      const taskTitle = taskMatch ? taskMatch[1] : 'Tarefa Complexa';
      const breakdown = generateTaskBreakdown(taskTitle, content);
      
      result = {
        type: 'task-breakdown',
        title: `Breakdown: ${taskTitle}`,
        subtasks: breakdown,
        totalHours: calculateEstimate(breakdown),
        complexity: breakdown.length > 6 ? 'high' : 'medium'
      };
    }
    else {
      // Fallback genérico
      result = {
        type: 'general-analysis',
        title: 'Análise Geral',
        insights: [
          'Implementar metodologia ágil no desenvolvimento',
          'Criar documentação técnica detalhada',
          'Estabelecer métricas de sucesso claras',
          'Implementar testes automatizados'
        ],
        recommendations: [
          'Definir MVP com funcionalidades essenciais',
          'Criar cronograma realista de entregas',
          'Estabelecer canal de comunicação efetivo'
        ]
      };
    }
    
    console.log(`[IA INTELIGENTE] Análise concluída: ${result.title}`);
    
    return {
      id: `intelligent-job-${Date.now()}`,
      result,
      processingTime: Math.round(processingTime / 1000),
      timestamp: new Date().toISOString()
    };
  },
};

export const intelligentWebhookJob = {
  id: "intelligent-webhook-job",
  trigger: async (payload: WebhookPayload) => {
    console.log(`[WEBHOOK INTELIGENTE] Processando: ${payload.event}`);
    
    // Simular processamento baseado no tipo de evento
    const processingTime = payload.event.includes('payment') ? 2000 : 500;
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    let result;
    
    switch (payload.event) {
      case 'payment.approved':
        result = {
          action: 'payment_processed',
          message: 'Pagamento aprovado e processado',
          nextSteps: [
            'Enviar email de confirmação',
            'Atualizar status do pedido',
            'Gerar nota fiscal',
            'Notificar equipe de fulfillment'
          ]
        };
        break;
      case 'user.created':
        result = {
          action: 'user_onboarding',
          message: 'Novo usuário criado, iniciando onboarding',
          nextSteps: [
            'Enviar email de boas-vindas',
            'Criar perfil personalizado',
            'Configurar preferências iniciais',
            'Agendar tutorial guiado'
          ]
        };
        break;
      default:
        result = {
          action: 'generic_processing',
          message: `Evento ${payload.event} processado com sucesso`,
          nextSteps: ['Registrar evento no log', 'Notificar admins se necessário']
        };
    }
    
    return {
      id: `webhook-${Date.now()}`,
      event: payload.event,
      customerId: payload.customerId,
      result,
      timestamp: new Date().toISOString()
    };
  },
};

export const intelligentReportJob = {
  id: "intelligent-report-job",
  trigger: async () => {
    console.log("[RELATÓRIO INTELIGENTE] Gerando relatório mensal");
    
    // Simular tempo de processamento longo (10-20 segundos)
    const processingTime = Math.random() * 10000 + 10000;
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    // Gerar dados simulados realistas
    const now = new Date();
    const month = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    
    const result = {
      period: month,
      summary: {
        totalProjects: Math.floor(Math.random() * 15) + 5,
        completedProjects: Math.floor(Math.random() * 10) + 3,
        newClients: Math.floor(Math.random() * 8) + 2,
        revenue: Math.floor(Math.random() * 50000) + 25000,
        hoursWorked: Math.floor(Math.random() * 300) + 150
      },
      insights: [
        'Aumento de 23% na conversão de leads',
        'Tempo médio de projeto reduziu em 15%',
        'Satisfação do cliente manteve-se em 94%',
        'Maior demanda por projetos de e-commerce'
      ],
      recommendations: [
        'Investir em automação de processos',
        'Expandir equipe de desenvolvimento',
        'Criar pacotes especializados em e-commerce',
        'Implementar sistema de feedback contínuo'
      ],
      topProjects: [
        'Sistema E-commerce para TechCorp',
        'App Mobile para StartupX',
        'Landing Page para ConsultoriaY'
      ]
    };
    
    console.log(`[RELATÓRIO INTELIGENTE] Relatório de ${month} gerado`);
    
    return {
      id: `report-${Date.now()}`,
      result,
      processingTime: Math.round(processingTime / 1000),
      timestamp: new Date().toISOString()
    };
  },
};
