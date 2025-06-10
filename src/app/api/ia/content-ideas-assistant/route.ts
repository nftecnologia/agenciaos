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

    // Buscar dados da agência para personalizar as ideias
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

    // Preparar contexto para geração de ideias de conteúdo
    const contentIdeasContext = `
CONTEXTO DA AGÊNCIA PARA GERAÇÃO DE IDEIAS DE CONTEÚDO:

🏢 DADOS DA AGÊNCIA:
- Nome: ${agency?.name || 'Agência'}
- Proprietário: ${agency?.owner?.name || 'Não informado'}
- Especialização: Marketing Digital e Criação de Conteúdo

👥 CLIENTES ATIVOS:
${clients.map(client => 
  `- ${client.name} (${client.company || 'Pessoa Física'})`
).join('\n')}

📋 PROJETOS EM ANDAMENTO:
${projects.map(project => 
  `- ${project.name} (Cliente: ${project.client.name})`
).join('\n')}

🎯 TIPOS DE CONTEÚDO ESPECIALIZADOS:
- Artigos de Blog (1500-3000 palavras)
- Guias e Tutoriais Completos
- Listicles e Rankings
- Cases de Sucesso e Estudos
- Reviews e Comparativos
- Conteúdo Sazonal e Tendências
- FAQ e Respostas Comuns
- Infográficos e Conteúdo Visual
- Webinars e Vídeo Conteúdo
- E-books e Lead Magnets

📊 ESTRATÉGIAS DE CONTEÚDO:
- SEO-friendly com palavras-chave
- Orientado para conversão
- Educativo e informativo
- Engajamento nas redes sociais
- Authority building
- Problem-solving focused
- Storytelling aplicado
- Data-driven content
- User-generated content
- Evergreen vs. Trending

🎨 FORMATOS VARIADOS:
- Como fazer / Tutoriais
- X melhores / Top listas
- Mitos vs. Verdades
- Antes e Depois
- Ferramentas e Recursos
- Previsões e Tendências
- Entrevistas e Depoimentos
- Checklists e Templates
- Erros Comuns a Evitar
- Dicas e Estratégias
`

    console.log('💡 Assistente de Ideias: Gerando ideias de conteúdo para o nicho...')

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Você é um Assistente Especializado em Geração de Ideias de Conteúdo para diferentes nichos de mercado.

FUNÇÃO PRINCIPAL:
- Quando o usuário fornecer um NICHO específico, gere múltiplas ideias de conteúdo relevantes e engajantes
- Varie formatos, ângulos e tipos de conteúdo
- Foque em ideias que geram tráfego, engajamento e conversões
- Considere diferentes estágios do funil de vendas

ESTRUTURA DE RESPOSTA:
1. **Análise do Nicho** (50-100 palavras)
2. **Ideias por Categoria** (5-7 categorias com 3-5 ideias cada)
3. **Calendário Editorial Sugerido** (Cronograma mensal)
4. **Palavras-chave Principais** (SEO targeting)
5. **Tipos de CTA Recomendados** (Calls-to-action)

CATEGORIAS DE IDEIAS:
📚 **Educacional/Tutorial**
- Como fazer X passo a passo
- Guias completos para iniciantes
- Tutoriais avançados

🏆 **Listas e Rankings**
- As X melhores ferramentas/estratégias
- Top 10 erros a evitar
- Ranking de soluções

💡 **Dicas e Estratégias**
- X dicas para melhorar Y
- Estratégias secretas de Z
- Hacks e truques profissionais

📊 **Cases e Exemplos**
- Como empresa X conseguiu resultado Y
- Estudos de caso detalhados
- Antes e depois de transformações

🔍 **Análises e Reviews**
- Review detalhado da ferramenta X
- Comparativo: X vs Y vs Z
- Análise de tendências do mercado

❓ **FAQ e Resolução de Problemas**
- Respostas para dúvidas comuns
- Soluções para problemas frequentes
- Troubleshooting guias

📅 **Tendências e Previsões**
- O futuro do nicho X
- Tendências para 2024/2025
- Novidades e inovações

FORMATO PARA CADA IDEIA:
📝 **Título da Ideia de Conteúdo**
- **Formato:** Blog post / Vídeo / Infográfico / E-book
- **Objetivo:** Educar / Converter / Engajar / Gerar leads
- **Público:** Iniciante / Intermediário / Avançado
- **Palavras-chave:** Principais termos SEO
- **CTA sugerido:** Ação específica para o leitor

IMPORTANTE: Gere ideias específicas e acionáveis que realmente agreguem valor ao nicho fornecido.`
        },
        {
          role: "user",
          content: `${contentIdeasContext}

NICHO FORNECIDO: ${message}

Gere ideias variadas e específicas de conteúdo para este nicho. Inclua diferentes formatos e objetivos para maximizar o alcance e conversão.`
        }
      ],
      temperature: 0.8,
      max_tokens: 2500
    })

    const response = completion.choices[0].message.content

    return NextResponse.json({
      success: true,
      response: response || 'Desculpe, não consegui gerar as ideias. Tente novamente.',
      metadata: {
        agencyName: agency?.name,
        totalClients: clients.length,
        totalProjects: projects.length,
        contentFormats: [
          'Blog Posts',
          'Guias e Tutoriais',
          'Listicles',
          'Cases de Sucesso',
          'Reviews',
          'Infográficos',
          'Vídeo Conteúdo',
          'E-books'
        ]
      }
    })

  } catch (error) {
    console.error('❌ Erro no Assistente de Ideias:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do assistente. Tente novamente.'
    }, { status: 500 })
  }
}
