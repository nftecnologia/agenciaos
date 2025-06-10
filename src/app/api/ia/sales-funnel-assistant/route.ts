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

    // Buscar dados da agência para personalizar o funil
    const [agency, clients, projects] = await Promise.all([
      db.agency.findUnique({
        where: { id: session.user.agencyId },
        include: { owner: true }
      }),
      db.client.findMany({
        where: { agencyId: session.user.agencyId },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      db.project.findMany({
        where: { agencyId: session.user.agencyId },
        include: { client: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ])

    // Preparar contexto para geração de funil de vendas
    const salesFunnelContext = `
CONTEXTO DA AGÊNCIA PARA GERAÇÃO DE FUNIL DE VENDAS:

🏢 DADOS DA AGÊNCIA:
- Nome: ${agency?.name || 'Agência'}
- Proprietário: ${agency?.owner?.name || 'Não informado'}
- Especialização: Marketing Digital e Estratégias de Vendas

👥 CLIENTES ATIVOS:
${clients.map(client => 
  `- ${client.name} (${client.company || 'Pessoa Física'})`
).join('\n')}

📋 PROJETOS EM ANDAMENTO:
${projects.map(project => 
  `- ${project.name} (Cliente: ${project.client.name})`
).join('\n')}

🎯 ESPECIALIDADES EM FUNIS DE VENDAS:
- Produtos Digitais (Cursos, E-books, Mentorias)
- Serviços Profissionais (Consultorias, Assessorias)
- Produtos Físicos (E-commerce, Drop Shipping)
- Software e Apps (SaaS, Ferramentas)
- Infoprodutos (Treinamentos, Masterclasses)
- Eventos e Experiências (Workshops, Palestras)

💰 ESTRATÉGIAS DE MONETIZAÇÃO:
- Produto Principal (Core Product)
- Order Bumps (Ofertas Complementares)
- Upsells (Produtos Premium)
- Downsells (Alternativas Acessíveis)
- Cross-sells (Produtos Relacionados)
- Recorrência (Assinaturas, Memberships)

📊 FAIXAS DE PREÇO TÍPICAS (MERCADO BRASILEIRO):
- Produtos de Entrada: R$ 27 - R$ 97
- Produtos Intermediários: R$ 197 - R$ 497
- Produtos Premium: R$ 997 - R$ 2.997
- Produtos Elite: R$ 5.000 - R$ 15.000+
- Order Bumps: 10-30% do produto principal
- Upsells: 3-5x o preço do produto principal
- Downsells: 30-50% do produto principal
`

    console.log('💰 Assistente de Funil: Gerando estratégia completa de vendas...')

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Você é um Assistente Especializado em Geração de Funis de Vendas completos e lucrativos.

FUNÇÃO PRINCIPAL:
- Quando o usuário fornecer um NICHO, gere um funil de vendas completo e estratégico
- Crie produtos coerentes e complementares dentro do nicho
- Calcule preços realistas baseados no mercado brasileiro
- Foque em maximizar o ticket médio e lifetime value

ESTRUTURA DO FUNIL COMPLETO:
1. **PRODUTO PRINCIPAL** (Core Product)
2. **ORDER BUMP** (Oferta Complementar)
3. **UPSELL** (Produto Premium)
4. **DOWNSELL** (Alternativa Acessível)

FORMATO PARA CADA PRODUTO:
🎯 **[TIPO DO PRODUTO]**
- **Nome:** [Nome atrativo e específico]
- **Descrição:** [Explicação clara do que é o produto]
- **Oferta:** [Proposta de valor única - o que o cliente recebe]
- **Dores que Resolve:** [3-5 problemas específicos que soluciona]
- **Público-alvo:** [Avatar específico dentro do nicho]
- **Valor Sugerido:** R$ [preço] ([justificativa do preço])
- **Conversão Esperada:** [% estimada de conversão]

CRITÉRIOS DE QUALIDADE:
- Produtos complementares (não concorrentes entre si)
- Preços escalonados logicamente
- Ofertas irresistíveis com urgência/escassez
- Dores específicas e bem definidas
- ROI claro para o cliente
- Estratégia de backend lucrativa

EXEMPLO DE ESTRUTURA DE PREÇOS:
- Produto Principal: R$ 197
- Order Bump: R$ 47 (24% do principal)
- Upsell: R$ 697 (3.5x do principal)
- Downsell: R$ 97 (50% do principal)

ANÁLISE FINANCEIRA:
- Ticket Médio Projetado
- LTV (Lifetime Value) estimado
- Margem de Lucro por produto
- ROI para investimento em tráfego

ESTRATÉGIAS DE CONVERSÃO:
- Gatilhos mentais utilizados
- Urgência e escassez
- Prova social e autoridade
- Garantias e segurança

IMPORTANTE: Baseie tudo em dados realistas do mercado brasileiro e nichos lucrativos comprovados.`
        },
        {
          role: "user",
          content: `${salesFunnelContext}

NICHO FORNECIDO: ${message}

Crie um funil de vendas completo e lucrativo para este nicho. Inclua análise financeira detalhada e estratégias de conversão para maximizar resultados.`
        }
      ],
      temperature: 0.7,
      max_tokens: 3000
    })

    const response = completion.choices[0].message.content

    return NextResponse.json({
      success: true,
      response: response || 'Desculpe, não consegui gerar o funil. Tente novamente.',
      metadata: {
        agencyName: agency?.name,
        totalClients: clients.length,
        totalProjects: projects.length,
        funnelTypes: [
          'Produtos Digitais',
          'Serviços Profissionais',
          'E-commerce',
          'SaaS/Software',
          'Infoprodutos',
          'Eventos'
        ]
      }
    })

  } catch (error) {
    console.error('❌ Erro no Assistente de Funil:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do assistente. Tente novamente.'
    }, { status: 500 })
  }
}
