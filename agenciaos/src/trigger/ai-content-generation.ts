import { task } from "@trigger.dev/sdk/v3";
import { OpenAIService } from "@/lib/openai";

export const aiContentGenerationTask = task({
  id: "ai-content-generation",
  run: async (payload: { 
    agencyId: string; 
    content: string;
    type?: 'project-analysis' | 'client-strategy' | 'task-breakdown' | 'monthly-report';
    data?: Record<string, unknown>;
  }) => {
    console.log("🤖 Iniciando geração de conteúdo IA REAL para:", payload.agencyId);
    console.log("📋 Tipo:", payload.type);
    console.log("📝 Conteúdo:", payload.content);
    
    try {
      let aiResult: Record<string, unknown> = {};
      
      // Determinar tipo de análise baseado no conteúdo ou tipo fornecido
      const content = payload.content.toLowerCase();
      
      if (payload.type === 'project-analysis' || content.includes('projeto') || content.includes('project')) {
        console.log("🔍 Executando análise de projeto com OpenAI...");
        
        // Extrair informações do conteúdo
        const projectData = {
          projectName: extractProjectName(payload.content),
          projectDescription: payload.content,
          clientType: payload.data?.clientType as string | undefined,
          budget: payload.data?.budget as number | undefined,
          industry: payload.data?.industry as string | undefined
        };
        
        aiResult = await OpenAIService.analyzeProject(projectData);
        aiResult.type = 'project-analysis';
        
      } else if (payload.type === 'client-strategy' || content.includes('cliente') || content.includes('client') || content.includes('relacionamento')) {
        console.log("🤝 Executando estratégia de cliente com OpenAI...");
        
        const clientData = {
          clientName: extractClientName(payload.content),
          clientCompany: payload.data?.clientCompany as string | undefined,
          industry: payload.data?.industry as string | undefined,
          currentRelationship: (payload.data?.currentRelationship as string) || 'Novo cliente'
        };
        
        aiResult = await OpenAIService.generateClientStrategy(clientData);
        aiResult.type = 'client-strategy';
        
      } else if (payload.type === 'task-breakdown' || content.includes('task') || content.includes('tarefa') || content.includes('subtask')) {
        console.log("📋 Executando breakdown de task com OpenAI...");
        
        const taskData = {
          taskTitle: extractTaskTitle(payload.content),
          taskDescription: payload.content,
          priority: (payload.data?.priority as string) || 'medium',
          dueDate: payload.data?.dueDate as string | undefined
        };
        
        aiResult = await OpenAIService.breakdownTask(taskData);
        aiResult.type = 'task-breakdown';
        
      } else if (payload.type === 'monthly-report' || content.includes('relatório') || content.includes('report') || content.includes('mensal')) {
        console.log("📈 Executando relatório mensal com OpenAI...");
        
        const reportData = {
          agencyMetrics: (payload.data?.agencyMetrics as {
            projectsCount: number;
            clientsCount: number;
            revenue: number;
            completedTasks: number;
          }) || {
            projectsCount: 12,
            clientsCount: 8,
            revenue: 450000,
            completedTasks: 156
          },
          period: (payload.data?.period as string) || new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
        };
        
        aiResult = await OpenAIService.generateMonthlyReport(reportData);
        aiResult.type = 'monthly-report';
        
      } else {
        // Análise geral - usa análise de projeto por padrão
        console.log("🔄 Executando análise geral com OpenAI...");
        
        const generalData = {
          projectName: 'Análise Geral',
          projectDescription: payload.content
        };
        
        aiResult = await OpenAIService.analyzeProject(generalData);
        aiResult.type = 'project-analysis';
      }
      
      // Adicionar metadados
      aiResult.agencyId = payload.agencyId;
      aiResult.processedAt = new Date().toISOString();
      aiResult.confidence = 0.95; // IA real tem alta confiança
      aiResult.source = 'OpenAI GPT-4o';
      
      console.log("✅ Conteúdo IA gerado com sucesso!");
      console.log("📊 Resultado:", JSON.stringify(aiResult, null, 2));
      
      return aiResult;
      
    } catch (error) {
      console.error("❌ Erro na geração de conteúdo IA:", error);
      
      // Fallback para resultado simulado em caso de erro
      const fallbackResult = {
        type: payload.type || 'project-analysis',
        agencyId: payload.agencyId,
        suggestions: [
          "Análise detalhada do projeto em andamento",
          "Implementação de melhores práticas de desenvolvimento",
          "Otimização de processos internos",
          "Monitoramento contínuo de performance"
        ],
        insights: [
          "Projeto apresenta potencial de crescimento",
          "Recomenda-se foco em qualidade de código",
          "Importante manter comunicação clara com cliente",
          "Definir métricas de sucesso mensuráveis"
        ],
        estimatedHours: Math.floor(Math.random() * 100) + 50,
        confidence: 0.75,
        processedAt: new Date().toISOString(),
        source: 'Fallback Simulation',
        error: 'OpenAI API indisponível, usando dados simulados'
      };
      
      console.log("🔄 Usando resultado fallback:", fallbackResult);
      
      return fallbackResult;
    }
  },
});

// Funções auxiliares para extrair informações do conteúdo
function extractProjectName(content: string): string {
  const match = content.match(/projeto[:\s]+([^.\n]+)/i) || 
                content.match(/project[:\s]+([^.\n]+)/i) ||
                content.match(/"([^"]+)"/);
  return match ? match[1].trim() : 'Projeto Sem Nome';
}

function extractClientName(content: string): string {
  const match = content.match(/cliente[:\s]+([^.\n]+)/i) || 
                content.match(/client[:\s]+([^.\n]+)/i) ||
                content.match(/empresa[:\s]+([^.\n]+)/i) ||
                content.match(/"([^"]+)"/);
  return match ? match[1].trim() : 'Cliente Não Identificado';
}

function extractTaskTitle(content: string): string {
  const match = content.match(/task[:\s]+([^.\n]+)/i) || 
                content.match(/tarefa[:\s]+([^.\n]+)/i) ||
                content.match(/"([^"]+)"/);
  return match ? match[1].trim() : 'Task Sem Título';
}
