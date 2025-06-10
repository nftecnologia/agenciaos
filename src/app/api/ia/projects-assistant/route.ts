import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { openai } from '@/lib/openai'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email || !session.user.agencyId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { message } = await request.json()

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Mensagem é obrigatória' }, { status: 400 })
    }

    // Buscar dados de projetos e tarefas
    const [projects, tasks, boards] = await Promise.all([
      db.project.findMany({
        where: { agencyId: session.user.agencyId },
        include: { 
          client: true,
          tasks: {
            include: {
              assignee: true,
              board: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      db.task.findMany({
        where: { 
          project: { agencyId: session.user.agencyId }
        },
        include: {
          assignee: true,
          board: true,
          project: { include: { client: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      }),
      db.board.findMany({
        where: {
          project: { agencyId: session.user.agencyId }
        },
        include: {
          project: true,
          tasks: true
        }
      })
    ])

    // Calcular métricas de projetos
    const projectsByStatus = projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const tasksByPriority = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const overdueTasks = tasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < new Date()
    )

    const upcomingTasks = tasks.filter(task => 
      task.dueDate && 
      new Date(task.dueDate) > new Date() && 
      new Date(task.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    )

    // Preparar contexto para a IA
    const projectsContext = `
DADOS DOS PROJETOS:

📋 VISÃO GERAL DE PROJETOS:
- Total de Projetos: ${projects.length}
- Por Status: ${Object.entries(projectsByStatus).map(([status, count]) => `${status}: ${count}`).join(', ')}
- Projetos Ativos: ${projects.filter(p => p.status === 'IN_PROGRESS').length}

⚡ GESTÃO DE TAREFAS:
- Total de Tarefas: ${tasks.length}
- Por Prioridade: ${Object.entries(tasksByPriority).map(([priority, count]) => `${priority}: ${count}`).join(', ')}
- Tarefas em Atraso: ${overdueTasks.length}
- Tarefas Próximas (7 dias): ${upcomingTasks.length}

🎯 PROJETOS EM ANDAMENTO:
${projects.filter(p => p.status === 'IN_PROGRESS').map(p => 
  `- ${p.name} (Cliente: ${p.client.name}) - ${p.tasks.length} tarefas`
).join('\n')}

⚠️ TAREFAS EM ATRASO:
${overdueTasks.slice(0, 5).map(t => 
  `- ${t.title} (Projeto: ${t.project.name}) - Vence: ${new Date(t.dueDate!).toLocaleDateString('pt-BR')}`
).join('\n')}

📅 PRÓXIMAS TAREFAS:
${upcomingTasks.slice(0, 5).map(t => 
  `- ${t.title} (${t.priority}) - Vence: ${new Date(t.dueDate!).toLocaleDateString('pt-BR')}`
).join('\n')}

📊 BOARDS DE KANBAN:
- Total de Boards: ${boards.length}
- Boards por Projeto: ${boards.reduce((acc, board) => {
  const projectName = board.project.name
  acc[projectName] = (acc[projectName] || 0) + 1
  return acc
}, {} as Record<string, number>)}
`

    console.log('🤖 Gerente de Projetos: Analisando dados de projetos...')

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Você é um Gerente de Projetos especializado em otimização de fluxos e gestão de tarefas para agências digitais.

Sua função é:
- Analisar status e progresso dos projetos
- Identificar gargalos e tarefas em atraso
- Sugerir otimizações de fluxo de trabalho
- Recomendar redistribuição de tarefas
- Propor melhorias na gestão de tempo
- Alertar sobre riscos de cronograma

Sempre baseie suas respostas nos dados reais fornecidos e seja específico com ações práticas.
Use um tom consultivo e organizacional, com emojis para destacar prioridades.`
        },
        {
          role: "user",
          content: `${projectsContext}

PERGUNTA DO USUÁRIO: ${message}

Por favor, analise os dados dos projetos e responda com recomendações específicas de gestão e otimização.`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })

    const response = completion.choices[0].message.content

    return NextResponse.json({
      success: true,
      response: response || 'Desculpe, não consegui gerar uma resposta. Tente novamente.',
      metrics: {
        totalProjects: projects.length,
        projectsByStatus,
        totalTasks: tasks.length,
        tasksByPriority,
        overdueTasks: overdueTasks.length,
        upcomingTasks: upcomingTasks.length,
        totalBoards: boards.length
      }
    })

  } catch (error) {
    console.error('❌ Erro no Gerente de Projetos:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do assistente. Tente novamente.'
    }, { status: 500 })
  }
}
