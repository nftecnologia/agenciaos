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

    // Buscar dados da agência para personalizar os nichos
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

    // Preparar contexto para geração de nichos
    const nicheContext = `
CONTEXTO DA AGÊNCIA PARA GERAÇÃO DE NICHOS:

🏢 DADOS DA AGÊNCIA:
- Nome: ${agency?.name || 'Agência'}
- Proprietário: ${agency?.owner?.name || 'Não informado'}
- Especialização: Marketing Digital e Identificação de Nichos

👥 CLIENTES ATIVOS (Segmentos):
${clients.map(client => 
  `- ${client.name} (${client.company || 'Pessoa Física'})`
).join('\n')}

📋 PROJETOS EM ANDAMENTO:
${projects.map(project => 
  `- ${project.name} (Cliente: ${project.client.name})`
).join('\n')}

🎯 ESPECIALIDADES EM NICHOS:
- Marketing Digital e suas vertentes
- E-commerce e Vendas Online
- Saúde e Bem-estar
- Educação e Cursos Online
- Tecnologia e Software
- Finanças e Investimentos
- Empreendedorismo e Negócios
- Lifestyle e Desenvolvimento Pessoal
- Food & Beverage
- Moda e Beleza
- Turismo e Viagens
- Casa e Decoração
- Pets e Animais
- Esportes e Fitness
- Arte e Criatividade

📊 CRITÉRIOS PARA ANÁLISE DE NICHOS:
- Potencial de mercado (alto/médio/baixo)
- Competitividade (alta/média/baixa)
- Dificuldade de monetização (fácil/moderada/difícil)
- Público-alvo (tamanho e engajamento)
- Tendências de crescimento
- Sazonalidade
- Investimento inicial necessário
- Expertise exigida
`

    console.log('🎯 Assistente de Nichos: Analisando assunto e gerando subnichos...')

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Você é um Assistente Especializado em Geração e Análise de Nichos de Mercado.

FUNÇÃO PRINCIPAL:
- Quando o usuário mencionar um ASSUNTO/TEMA, gere subnichos específicos e lucrativos dentro desse tema
- Analise cada subnicho com critérios profissionais de viabilidade
- Forneça insights sobre potencial de mercado, competitividade e monetização
- Sugira estratégias específicas para cada subnicho

ESTRUTURA DE RESPOSTA:
1. **Resumo do Tema Principal** (50-100 palavras)
2. **Lista de Subnichos** (8-12 subnichos específicos)
3. **Análise Detalhada** (Top 5 subnichos mais promissores)
4. **Estratégias de Entrada** (Como começar em cada nicho)
5. **Recomendações Finais** (Melhor subnicho para iniciantes)

FORMATO PARA CADA SUBNICHO:
📈 **Nome do Subnicho**
- **Potencial de Mercado:** Alto/Médio/Baixo + justificativa
- **Competitividade:** Alta/Média/Baixa + análise
- **Monetização:** Fácil/Moderada/Difícil + modelos de receita
- **Público-alvo:** Perfil detalhado
- **Investimento inicial:** Estimativa em R$
- **Expertise necessária:** Nível técnico exigido

EXEMPLOS DE SUBNICHOS PARA DIFERENTES TEMAS:
- **Marketing Digital**: Marketing para dentistas, Instagram para restaurantes, Ads para e-commerce
- **Saúde**: Nutrição para diabéticos, Fitness para idosos, Yoga para gestantes
- **Educação**: Inglês para executivos, Programação para crianças, Excel para contadores

CRITÉRIOS DE QUALIDADE:
- Subnichos específicos (não genéricos)
- Mercado com demanda comprovada
- Possibilidade real de monetização
- Diferenciação clara da concorrência
- Escalabilidade do negócio

IMPORTANTE: Sempre baseie as análises em dados de mercado realistas e tendências atuais do Brasil.`
        },
        {
          role: "user",
          content: `${nicheContext}

ASSUNTO/TEMA FORNECIDO: ${message}

Analise este tema e gere subnichos específicos e lucrativos. Forneça análise detalhada dos mais promissores com dados realistas do mercado brasileiro.`
        }
      ],
      temperature: 0.7,
      max_tokens: 2500
    })

    const response = completion.choices[0].message.content

    return NextResponse.json({
      success: true,
      response: response || 'Desculpe, não consegui gerar os subnichos. Tente novamente.',
      metadata: {
        agencyName: agency?.name,
        totalClients: clients.length,
        totalProjects: projects.length,
        nicheCategories: [
          'Marketing Digital',
          'E-commerce',
          'Saúde & Bem-estar',
          'Educação Online',
          'Tecnologia',
          'Finanças',
          'Lifestyle',
          'Food & Beverage'
        ]
      }
    })

  } catch (error) {
    console.error('❌ Erro no Assistente de Nichos:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do assistente. Tente novamente.'
    }, { status: 500 })
  }
}
