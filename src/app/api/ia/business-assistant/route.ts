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

    // Buscar dados reais da agência usando agencyId
    const [projects, clients, revenues, expenses] = await Promise.all([
      db.project.findMany({
        where: { agencyId: session.user.agencyId },
        include: { client: true },
        orderBy: { createdAt: 'desc' },
        take: 20
      }),
      db.client.findMany({
        where: { agencyId: session.user.agencyId },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      db.revenue.findMany({
        where: { agencyId: session.user.agencyId },
        orderBy: { date: 'desc' },
        take: 10
      }),
      db.expense.findMany({
        where: { agencyId: session.user.agencyId },
        orderBy: { date: 'desc' },
        take: 10
      })
    ])

    // Calcular métricas (convertendo Decimal para number)
    const totalRevenue = revenues.reduce((acc, rev) => acc + Number(rev.amount), 0)
    const totalExpenses = expenses.reduce((acc, exp) => acc + Number(exp.amount), 0)
    const netProfit = totalRevenue - totalExpenses
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0'

    // Contar projetos por status
    const projectsByStatus = projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Preparar contexto para a IA
    const businessContext = `
DADOS DA AGÊNCIA:

📊 MÉTRICAS FINANCEIRAS:
- Receita Total: R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Despesas Total: R$ ${totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Lucro Líquido: R$ ${netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Margem de Lucro: ${profitMargin}%

👥 CLIENTES:
- Total de Clientes: ${clients.length}
- Novos Clientes (últimos registros): ${clients.slice(0, 3).map(c => c.name).join(', ')}

🎯 PROJETOS:
- Total de Projetos: ${projects.length}
- Por Status: ${Object.entries(projectsByStatus).map(([status, count]) => `${status}: ${count}`).join(', ')}
- Últimos Projetos: ${projects.slice(0, 3).map(p => `${p.name} (${p.status})`).join(', ')}

💰 RECEITAS RECENTES:
${revenues.slice(0, 5).map(r => `- R$ ${Number(r.amount).toLocaleString('pt-BR')} - ${r.description} (${new Date(r.date).toLocaleDateString('pt-BR')})`).join('\n')}

💸 DESPESAS RECENTES:
${expenses.slice(0, 5).map(e => `- R$ ${Number(e.amount).toLocaleString('pt-BR')} - ${e.description} (${new Date(e.date).toLocaleDateString('pt-BR')})`).join('\n')}
`

    console.log('🤖 Assistente de Negócios: Analisando dados reais...')

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Você é um Assistente de Negócios especializado em análise estratégica para agências digitais. 

Sua função é:
- Analisar métricas de performance e KPIs
- Identificar oportunidades de crescimento
- Sugerir estratégias para aumentar receita
- Avaliar a saúde financeira do negócio
- Recomendar ações para otimização

Sempre baseie suas respostas nos dados reais fornecidos e seja específico com números e insights acionáveis.
Use um tom profissional mas acessível, com emojis para destacar pontos importantes.`
        },
        {
          role: "user",
          content: `${businessContext}

PERGUNTA DO USUÁRIO: ${message}

Por favor, analise os dados da agência e responda à pergunta com insights específicos e recomendações práticas.`
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
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin: `${profitMargin}%`,
        totalClients: clients.length,
        totalProjects: projects.length,
        projectsByStatus
      }
    })

  } catch (error) {
    console.error('❌ Erro no Assistente de Negócios:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do assistente. Tente novamente.'
    }, { status: 500 })
  }
}
