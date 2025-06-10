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

    // Buscar dados financeiros detalhados
    const [revenues, expenses, projects] = await Promise.all([
      db.revenue.findMany({
        where: { agencyId: session.user.agencyId },
        include: { client: true, project: true },
        orderBy: { date: 'desc' },
        take: 100
      }),
      db.expense.findMany({
        where: { agencyId: session.user.agencyId },
        orderBy: { date: 'desc' },
        take: 100
      }),
      db.project.findMany({
        where: { agencyId: session.user.agencyId },
        include: { 
          client: true,
          revenues: true
        }
      })
    ])

    // Calcular métricas financeiras avançadas
    const totalRevenue = revenues.reduce((acc, rev) => acc + Number(rev.amount), 0)
    const totalExpenses = expenses.reduce((acc, exp) => acc + Number(exp.amount), 0)
    const netProfit = totalRevenue - totalExpenses
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0'

    // Receitas por categoria
    const revenuesByCategory = revenues.reduce((acc, rev) => {
      acc[rev.category] = (acc[rev.category] || 0) + Number(rev.amount)
      return acc
    }, {} as Record<string, number>)

    // Despesas por categoria
    const expensesByCategory = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount)
      return acc
    }, {} as Record<string, number>)

    // Receitas recorrentes
    const recurringRevenues = revenues.filter(r => r.isRecurring)
    const monthlyRecurring = recurringRevenues.reduce((acc, rev) => acc + Number(rev.amount), 0)

    // Análise por mês (últimos 6 meses)
    const monthlyData = revenues.reduce((acc, rev) => {
      const month = new Date(rev.date).toISOString().substring(0, 7)
      acc[month] = (acc[month] || 0) + Number(rev.amount)
      return acc
    }, {} as Record<string, number>)

    // Projetos mais lucrativos
    const projectProfitability = projects.map(project => ({
      name: project.name,
      client: project.client.name,
      revenue: project.revenues.reduce((acc, rev) => acc + Number(rev.amount), 0),
      budget: Number(project.budget) || 0
    })).sort((a, b) => b.revenue - a.revenue)

    // Preparar contexto financeiro para a IA
    const financialContext = `
ANÁLISE FINANCEIRA COMPLETA:

💰 RESUMO FINANCEIRO:
- Receita Total: R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Despesas Total: R$ ${totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Lucro Líquido: R$ ${netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Margem de Lucro: ${profitMargin}%

📊 RECEITAS POR CATEGORIA:
${Object.entries(revenuesByCategory).map(([category, amount]) => 
  `- ${category}: R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
).join('\n')}

💸 DESPESAS POR CATEGORIA:
${Object.entries(expensesByCategory).map(([category, amount]) => 
  `- ${category}: R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
).join('\n')}

🔄 RECEITAS RECORRENTES:
- Total Recorrente Mensal: R$ ${monthlyRecurring.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Número de Contratos Recorrentes: ${recurringRevenues.length}

📈 EVOLUÇÃO MENSAL (últimos meses):
${Object.entries(monthlyData)
  .sort(([a], [b]) => b.localeCompare(a))
  .slice(0, 6)
  .map(([month, amount]) => 
    `- ${month}: R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  ).join('\n')}

🎯 TOP PROJETOS POR RECEITA:
${projectProfitability.slice(0, 5).map(p => 
  `- ${p.name} (${p.client}): R$ ${p.revenue.toLocaleString('pt-BR')} ${p.budget > 0 ? `/ Orçamento: R$ ${p.budget.toLocaleString('pt-BR')}` : ''}`
).join('\n')}

💡 RECEITAS RECENTES:
${revenues.slice(0, 10).map(r => 
  `- R$ ${Number(r.amount).toLocaleString('pt-BR')} - ${r.description} (${new Date(r.date).toLocaleDateString('pt-BR')}) ${r.isRecurring ? '[RECORRENTE]' : ''}`
).join('\n')}

📋 DESPESAS RECENTES:
${expenses.slice(0, 10).map(e => 
  `- R$ ${Number(e.amount).toLocaleString('pt-BR')} - ${e.description} (${new Date(e.date).toLocaleDateString('pt-BR')})`
).join('\n')}
`

    console.log('🤖 Consultor Financeiro: Analisando dados financeiros...')

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Você é um Consultor Financeiro especializado em análise financeira e previsões para agências digitais.

Sua função é:
- Analisar fluxo de caixa e rentabilidade
- Identificar padrões de receita e despesas
- Sugerir otimizações financeiras
- Propor estratégias de redução de custos
- Recomendar investimentos e melhorias
- Fazer projeções e previsões financeiras
- Alertar sobre riscos financeiros

Sempre baseie suas respostas nos dados reais fornecidos e seja específico com números e análises quantitativas.
Use um tom analítico e consultivo, com emojis para destacar insights importantes.`
        },
        {
          role: "user",
          content: `${financialContext}

PERGUNTA DO USUÁRIO: ${message}

Por favor, analise os dados financeiros e responda com insights específicos e recomendações práticas.`
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
        monthlyRecurring,
        recurringContracts: recurringRevenues.length,
        revenuesByCategory,
        expensesByCategory,
        topProjects: projectProfitability.slice(0, 5)
      }
    })

  } catch (error) {
    console.error('❌ Erro no Consultor Financeiro:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do assistente. Tente novamente.'
    }, { status: 500 })
  }
}
