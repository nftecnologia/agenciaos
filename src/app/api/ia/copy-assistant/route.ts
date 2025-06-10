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

    // Buscar dados da agência e clientes para personalizar copies
    const [agency, clients, projects] = await Promise.all([
      db.agency.findUnique({
        where: { id: session.user.agencyId },
        include: { owner: true }
      }),
      db.client.findMany({
        where: { agencyId: session.user.agencyId },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      db.project.findMany({
        where: { agencyId: session.user.agencyId },
        include: { client: true },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ])

    // Preparar contexto de copywriting para a IA
    const copyContext = `
CONTEXTO DA AGÊNCIA PARA COPYWRITING:

🏢 DADOS DA AGÊNCIA:
- Nome: ${agency?.name || 'Agência'}
- Proprietário: ${agency?.owner?.name || 'Não informado'}
- Especialização: Marketing Digital e Comunicação

👥 CLIENTES ATIVOS:
${clients.map(client => 
  `- ${client.name} (${client.company || 'Pessoa Física'}) - Segmento: ${client.phone || 'Não informado'}`
).join('\n')}

📋 PROJETOS EM ANDAMENTO:
${projects.map(project => 
  `- ${project.name} (Cliente: ${project.client.name}) - Orçamento: R$ ${Number(project.budget || 0).toLocaleString('pt-BR')}`
).join('\n')}

🎯 TIPOS DE COPY MAIS SOLICITADOS:
- Headlines para anúncios Facebook/Instagram
- Copy para Google Ads (título + descrição)
- Textos para landing pages
- CTAs (calls to action) persuasivos
- Emails de marketing e nutrição
- Posts para redes sociais
- Scripts para vídeos de vendas
- Textos para stories e reels
- Copy para funis de vendas
- Headlines para blog posts

📊 SEGMENTOS DOS CLIENTES:
- E-commerce e Loja Virtual
- Consultoria e Serviços Profissionais
- Saúde e Bem-estar
- Educação e Cursos Online
- Tecnologia e Software
- Moda e Lifestyle
- Alimentação e Restaurantes
- Imobiliário e Construção

🧠 ESTRATÉGIAS DE COPYWRITING:
- Método AIDA (Atenção, Interesse, Desejo, Ação)
- Storytelling e narrativas envolventes
- Gatilhos mentais (escassez, autoridade, prova social)
- Copy emocional vs. racional
- Headlines magnéticas
- Objections handling
- Urgência e escassez
- Benefícios vs. características
`

    console.log('✍️ Assistente de Copy: Criando texto persuasivo...')

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Você é um Assistente de Copy especializado em copywriting e textos persuasivos para marketing digital.

Sua função é:
- Criar headlines magnéticas e irresistíveis
- Desenvolver copies para anúncios (Facebook, Instagram, Google Ads)
- Escrever textos persuasivos para landing pages
- Criar CTAs (calls to action) que convertem
- Desenvolver emails de marketing eficazes
- Criar copy para posts de redes sociais
- Aplicar gatilhos mentais e técnicas de persuasão
- Adaptar tom de voz para diferentes públicos
- Usar storytelling para envolver a audiência
- Otimizar textos para conversão

TÉCNICAS ESSENCIAIS:
- AIDA (Atenção, Interesse, Desejo, Ação)
- Gatilhos: escassez, urgência, autoridade, prova social
- Benefícios em vez de características
- Headlines curiosas que geram cliques
- CTAs específicos e persuasivos
- Copy emocional que conecta com dores e desejos
- Uso de números e dados quando relevante
- Linguagem do público-alvo

IMPORTANTE: Sempre adapte o tom de voz ao cliente e público-alvo específico. Use linguagem persuasiva mas autêntica. Foque na conversão e resultados.`
        },
        {
          role: "user",
          content: `${copyContext}

SOLICITAÇÃO DO COPYWRITER: ${message}

Por favor, crie um copy persuasivo e eficaz baseado na solicitação, usando as melhores práticas de copywriting.`
        }
      ],
      temperature: 0.7, // Temperatura média para criatividade equilibrada
      max_tokens: 2000
    })

    const response = completion.choices[0].message.content

    return NextResponse.json({
      success: true,
      response: response || 'Desculpe, não consegui gerar o copy. Tente novamente.',
      metadata: {
        agencyName: agency?.name,
        totalClients: clients.length,
        totalProjects: projects.length,
        copyTypes: [
          'Headlines Magnéticas',
          'Copy para Anúncios',
          'Landing Pages', 
          'CTAs Persuasivos',
          'Email Marketing',
          'Posts Redes Sociais'
        ]
      }
    })

  } catch (error) {
    console.error('❌ Erro no Assistente de Copy:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do assistente. Tente novamente.'
    }, { status: 500 })
  }
}
