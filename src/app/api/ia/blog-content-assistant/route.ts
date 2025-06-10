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

    // Buscar dados da agência para personalizar o conteúdo
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

    // Preparar contexto para geração de conteúdo de blog
    const blogContext = `
CONTEXTO DA AGÊNCIA PARA CRIAÇÃO DE CONTEÚDO DE BLOG:

🏢 DADOS DA AGÊNCIA:
- Nome: ${agency?.name || 'Agência'}
- Proprietário: ${agency?.owner?.name || 'Não informado'}
- Especialização: Marketing Digital e Criação de Conteúdo

👥 CLIENTES ATIVOS:
${clients.map(client => 
  `- ${client.name} (${client.company || 'Pessoa Física'}) - Segmento: ${client.phone || 'Não informado'}`
).join('\n')}

📋 PROJETOS EM ANDAMENTO:
${projects.map(project => 
  `- ${project.name} (Cliente: ${project.client.name}) - Orçamento: R$ ${Number(project.budget || 0).toLocaleString('pt-BR')}`
).join('\n')}

🎯 ESPECIALIDADES EM BLOG CONTENT:
- Artigos de Marketing Digital
- Posts sobre Estratégias de Negócios
- Conteúdo sobre Empreendedorismo
- Tutoriais e Guias Práticos
- Cases de Sucesso e Estudos de Caso
- Tendências do Mercado Digital
- SEO e Content Marketing
- Redes Sociais e Engajamento
- E-commerce e Vendas Online
- Produtividade e Gestão

📊 ESTRUTURAS DE BLOG RECOMENDADAS:
- Introdução envolvente com hook
- Desenvolvimento com subtítulos (H2, H3)
- Listas e bullets para facilitar leitura
- Exemplos práticos e casos reais
- Call-to-Action estratégico
- Conclusão que engaja comentários
- Meta description otimizada
- Palavras-chave naturalmente inseridas
`

    console.log('✍️ Assistente de Blog: Gerando conteúdo completo...')

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Você é um Assistente Especializado em Geração de Conteúdo para Blog, focado em marketing digital e negócios.

INSTRUÇÕES PRINCIPAIS:
- Quando o usuário fornecer NICHO + TÍTULO, gere um artigo de blog COMPLETO e profissional
- Estruture o conteúdo com introdução, desenvolvimento em tópicos, exemplos práticos e conclusão
- Use subtítulos (##) para organizar o texto
- Inclua bullets e listas quando apropriado
- Mantenha tom profissional mas acessível
- Foque em entregar valor real ao leitor

ESTRUTURA PADRÃO DO ARTIGO:
1. **Introdução** - Hook + Promessa de valor (100-150 palavras)
2. **Desenvolvimento** - 3-5 tópicos principais com subtítulos (800-1200 palavras)
3. **Exemplos Práticos** - Cases, dicas ou tutoriais (200-300 palavras)
4. **Conclusão** - Resumo + Call-to-Action (100-150 palavras)
5. **Meta Description** - 150-160 caracteres otimizada para SEO

TIPOS DE CONTEÚDO ESPECIALIZADOS:
- **Guias Completos**: Como fazer X em Y passos
- **Listicles**: X melhores formas/ferramentas/estratégias
- **Cases de Sucesso**: Como empresa X conseguiu resultado Y
- **Comparativos**: X vs Y - Qual escolher?
- **Tendências**: O futuro do nicho X em 2024/2025
- **Tutoriais**: Passo a passo detalhado
- **Análises**: Analisando estratégia/ferramenta/método

OTIMIZAÇÃO SEO:
- Palavra-chave principal no título e subtítulos
- Densidade de palavra-chave entre 1-2%
- Subtítulos organizados hierarquicamente
- Links internos quando apropriado
- CTA claro no final

IMPORTANTE: Se o usuário não especificar NICHO + TÍTULO claramente, faça perguntas para obter essas informações essenciais.`
        },
        {
          role: "user",
          content: `${blogContext}

SOLICITAÇÃO DO USUÁRIO: ${message}

Gere um conteúdo de blog completo e profissional baseado na solicitação. Se faltarem informações (nicho ou título), solicite essas informações específicas.`
        }
      ],
      temperature: 0.7,
      max_tokens: 3000
    })

    const response = completion.choices[0].message.content

    return NextResponse.json({
      success: true,
      response: response || 'Desculpe, não consegui gerar o conteúdo. Tente novamente.',
      metadata: {
        agencyName: agency?.name,
        totalClients: clients.length,
        totalProjects: projects.length,
        contentTypes: [
          'Guias Completos',
          'Listicles',
          'Cases de Sucesso',
          'Tutoriais',
          'Análises de Mercado',
          'Tendências'
        ]
      }
    })

  } catch (error) {
    console.error('❌ Erro no Assistente de Blog:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do assistente. Tente novamente.'
    }, { status: 500 })
  }
}
