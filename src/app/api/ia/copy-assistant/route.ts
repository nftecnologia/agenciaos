import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { openai } from '@/lib/openai'
import { db } from '@/lib/db'

// Função para detectar se a solicitação é genérica e precisa de qualificação
function isGenericCopyRequest(message: string): boolean {
  const genericKeywords = [
    'crie uma headline',
    'faça um copy',
    'escreva um texto',
    'preciso de uma copy',
    'crie um anúncio',
    'faça um post',
    'escreva um email',
    'crie um cta',
    'headline magnética',
    'copy persuasivo',
    'texto para',
    'anúncio para'
  ]
  
  const specificKeywords = [
    'produto:',
    'serviço:',
    'público:',
    'cliente:',
    'idade:',
    'problema:',
    'benefício:',
    'preço:',
    'vende',
    'para pessoas que',
    'meu cliente',
    'nosso produto',
    'oferecemos'
  ]
  
  const messageLower = message.toLowerCase()
  
  // Se tem palavras genéricas mas não tem específicas, precisa qualificação
  const hasGeneric = genericKeywords.some(keyword => messageLower.includes(keyword))
  const hasSpecific = specificKeywords.some(keyword => messageLower.includes(keyword))
  
  // Também verifica se a mensagem é muito curta (menos de 50 caracteres)
  const isTooShort = message.length < 50
  
  return (hasGeneric && !hasSpecific) || isTooShort
}

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

    console.log('✍️ Assistente de Copy: Analisando solicitação...')

    // Detectar se é uma solicitação genérica que precisa de qualificação
    const needsQualification = isGenericCopyRequest(message)

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Você é um Assistente de Copy especializado em copywriting e textos persuasivos para marketing digital.

COMPORTAMENTO INTELIGENTE:
- Se a solicitação for genérica (sem detalhes sobre produto, público, objetivo), faça perguntas de qualificação ANTES de criar a copy
- Se já tiver informações suficientes, crie a copy diretamente
- Sempre personalize baseado nas respostas do cliente

PERGUNTAS DE QUALIFICAÇÃO (faça 3-5 mais relevantes):
1. **Produto/Serviço**: O que exatamente você está vendendo/promovendo?
2. **Público-alvo**: Quem é seu cliente ideal? (idade, gênero, interesses, problemas)
3. **Objetivo**: Qual ação você quer que as pessoas façam? (comprar, se inscrever, baixar, agendar)
4. **Plataforma**: Onde será usado? (Facebook Ads, Instagram, Google Ads, email, site)
5. **Dores/Desejos**: Que problema seu produto resolve? Que desejo realiza?
6. **Diferenciais**: O que torna seu produto único da concorrência?
7. **Tom de voz**: Como quer falar com seu público? (formal, casual, divertido, autoritário)
8. **Orçamento/Prazo**: Há urgência ou escassez real para mencionar?

TÉCNICAS DE COPY:
- AIDA (Atenção, Interesse, Desejo, Ação)
- Gatilhos: escassez, urgência, autoridade, prova social
- Benefícios em vez de características
- Headlines curiosas que geram cliques
- CTAs específicos e persuasivos
- Copy emocional que conecta com dores e desejos
- Storytelling quando apropriado
- Números e dados para credibilidade

IMPORTANTE: Uma copy eficaz começa com perguntas certas. Quanto mais você souber sobre produto, público e objetivo, melhor será o resultado.`
        },
        {
          role: "user",
          content: `${copyContext}

SOLICITAÇÃO: ${message}

${needsQualification ? 
  'Esta solicitação parece genérica. Faça as perguntas de qualificação mais importantes para criar uma copy eficaz.' : 
  'Crie uma copy persuasiva baseada nas informações fornecidas.'
}`
        }
      ],
      temperature: 0.7,
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
