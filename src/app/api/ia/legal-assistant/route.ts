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

    // Buscar dados da agência e clientes para personalizar contratos
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

    // Preparar contexto jurídico para a IA
    const legalContext = `
INFORMAÇÕES DA AGÊNCIA PARA CONTRATOS:

🏢 DADOS DA AGÊNCIA:
- Nome: ${agency?.name || 'Agência'}
- Proprietário: ${agency?.owner?.name || 'Não informado'}
- Email: ${agency?.owner?.email || 'Não informado'}

👥 CLIENTES CADASTRADOS:
${clients.map(client => 
  `- ${client.name} (${client.company || 'Pessoa Física'}) - ${client.email}`
).join('\n')}

📋 PROJETOS RECENTES:
${projects.map(project => 
  `- ${project.name} (Cliente: ${project.client.name}) - Orçamento: R$ ${Number(project.budget || 0).toLocaleString('pt-BR')}`
).join('\n')}

💼 SERVIÇOS COMUNS DA AGÊNCIA:
- Marketing Digital
- Desenvolvimento Web
- Gestão de Redes Sociais
- SEO e SEM
- Design Gráfico
- Consultoria em Marketing
- E-commerce
- Criação de Conteúdo

📋 TIPOS DE CONTRATOS DISPONÍVEIS:
- Contrato de Prestação de Serviços de Marketing Digital
- Contrato de Desenvolvimento de Website
- Contrato de Gestão de Redes Sociais
- Contrato de Consultoria em Marketing
- Contrato de SEO e Marketing de Conteúdo
- Contrato de Design e Identidade Visual
- Contrato de E-commerce e Loja Virtual
`

    console.log('🤖 Assistente Jurídico: Analisando solicitação legal...')

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Você é um Assistente Jurídico especializado em contratos de prestação de serviços para agências de marketing digital.

Sua função é:
- Elaborar contratos completos e juridicamente válidos
- Personalizar contratos com dados específicos da agência e cliente
- Explicar cláusulas contratuais importantes
- Sugerir termos e condições adequados para cada tipo de serviço
- Orientar sobre aspectos legais de contratos de marketing
- Adaptar contratos conforme a legislação brasileira
- Incluir cláusulas de proteção para a agência
- Definir prazos, valores e condições de pagamento

IMPORTANTE: Sempre inclua disclaimers legais apropriados e sugira revisão por advogado quando necessário.
Use linguagem jurídica adequada mas compreensível.
Personalize os contratos com os dados fornecidos da agência e clientes.`
        },
        {
          role: "user",
          content: `${legalContext}

SOLICITAÇÃO DO USUÁRIO: ${message}

Por favor, analise a solicitação e forneça assistência jurídica especializada em contratos de marketing digital.`
        }
      ],
      temperature: 0.3, // Menor temperatura para maior precisão jurídica
      max_tokens: 2000
    })

    const response = completion.choices[0].message.content

    return NextResponse.json({
      success: true,
      response: response || 'Desculpe, não consegui gerar uma resposta. Tente novamente.',
      metadata: {
        agencyName: agency?.name,
        totalClients: clients.length,
        totalProjects: projects.length,
        contractTypes: [
          'Marketing Digital',
          'Desenvolvimento Web', 
          'Gestão de Redes Sociais',
          'SEO e Consultoria',
          'Design e Identidade Visual'
        ]
      }
    })

  } catch (error) {
    console.error('❌ Erro no Assistente Jurídico:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do assistente. Tente novamente.'
    }, { status: 500 })
  }
}
