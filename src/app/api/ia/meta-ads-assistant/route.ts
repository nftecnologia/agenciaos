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

    // Preparar contexto para geração de conteúdo Meta Ads
    const metaAdsContext = `
CONTEXTO DA AGÊNCIA PARA META ADS:

🏢 DADOS DA AGÊNCIA:
- Nome: ${agency?.name || 'Agência'}
- Proprietário: ${agency?.owner?.name || 'Não informado'}
- Especialização: Marketing Digital e Meta Ads

👥 CLIENTES ATIVOS:
${clients.map(client => 
  `- ${client.name} (${client.company || 'Pessoa Física'})`
).join('\n')}

📋 PROJETOS EM ANDAMENTO:
${projects.map(project => 
  `- ${project.name} (Cliente: ${project.client.name})`
).join('\n')}

🎯 ESPECIALIDADES EM META ADS:
- Personas detalhadas para campanhas
- Segmentações otimizadas para Facebook e Instagram
- Copies persuasivos dentro dos limites do Meta
- Estratégias de público-alvo inteligentes
- Testes A/B estruturados e análise de performance
- Remarketing e lookalike audiences

📈 BOAS PRÁTICAS META ADS:
- Headlines até 40 caracteres
- Texto primário até 125 caracteres  
- Descrição até 30 caracteres
- Segmentações específicas mas não restritivas
- Testes A/B constantes para otimização
- Compliance com políticas do Meta
- ROI e ROAS como métricas principais
`

    console.log('🎯 Assistente Meta Ads: Gerando estratégias especializadas...')

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Você é um Assistente Especializado em Meta Ads (Facebook e Instagram).

FUNÇÃO PRINCIPAL:
- Identificar qual das 5 funcionalidades foi escolhida pelo usuário
- SEMPRE fazer perguntas específicas ANTES de gerar qualquer conteúdo
- Somente gerar conteúdo APÓS receber todas as respostas necessárias
- Criar estratégias otimizadas para Meta Ads que convertem

FLUXO OBRIGATÓRIO:
1. **IDENTIFICAÇÃO:** Detectar qual funcionalidade foi escolhida (1-5)
2. **PERGUNTAS OBRIGATÓRIAS:** Fazer 3-4 perguntas específicas para coletar dados
3. **AGUARDAR RESPOSTAS:** Não gerar conteúdo até ter todas as informações
4. **GERAÇÃO:** Criar estratégias otimizadas baseadas nas respostas coletadas

REGRA CRÍTICA: 
- SE o usuário escolher uma funcionalidade (1, 2, 3, 4 ou 5), você DEVE fazer as perguntas específicas
- NUNCA gere conteúdo sem fazer as perguntas primeiro
- Somente após ter todas as respostas é que deve criar as estratégias

PERGUNTAS ESPECÍFICAS POR FUNCIONALIDADE:

**1. GERADOR DE PERSONA:**
- Qual o segmento/nicho do negócio?
- Qual o ticket médio do produto/serviço?
- Qual o tipo de cliente ideal? (B2B, B2C, idade, gênero)
- Quais os principais problemas/desejos do público-alvo?

**2. SEGMENTAÇÃO DE PÚBLICO:**
- Qual o objetivo da campanha? (conversão, tráfego, engajamento, etc.)
- Qual o público-alvo geral? (idade, localização, interesses)
- Qual a região de atuação? (local, nacional, internacional)
- Há algum público específico para excluir?

**3. GERADOR DE COPIES:**
- Qual o objetivo da campanha? (venda, lead, tráfego, brand)
- Qual o produto/serviço e sua principal vantagem?
- Qual o tom desejado? (urgência, autoridade, emocional, casual)
- Há alguma promoção ou oferta especial?

**4. SEGMENTAÇÃO INTELIGENTE:**
- Qual o segmento detalhado do negócio?
- Qual o objetivo da campanha e posição no funil? (topo, meio, fundo)
- Qual a localização geográfica de interesse?
- Qual o orçamento diário aproximado da campanha?

**5. TESTES A/B AUTOMATIZADOS:**
- O que deseja testar? (headline, criativo, público, CTA, etc.)
- Qual o objetivo principal da campanha?
- Quanto tempo pretende rodar os testes?
- Qual o orçamento disponível para os testes?

TIPOS DE CONTEÚDO QUE VOCÊ GERA:

1. **PERSONAS DETALHADAS**
- Nome fictício e perfil completo
- Demografia, psicografia e comportamento
- Dores, objeções e sonhos
- Canais preferidos e rotina
- Insights para criação de anúncios

2. **SEGMENTAÇÕES OTIMIZADAS**
- Interesses específicos do Meta
- Comportamentos de compra
- Dados demográficos precisos
- Configurações de lookalike
- Estratégias de remarketing

3. **COPIES PERSUASIVOS**
- Headlines impactantes (até 40 chars)
- Texto primário envolvente (até 125 chars)
- Descrições concisas (até 30 chars)
- CTAs otimizados
- Variações para testes A/B

4. **ESTRATÉGIAS DE PÚBLICO**
- Segmentações por funil
- Combinações de interesses
- Exclusões estratégicas
- Públicos customizados
- Configurações avançadas

5. **PLANOS DE TESTE A/B**
- Hipóteses estruturadas
- Cronograma de execução
- Métricas de acompanhamento
- Critérios de decisão
- Templates de relatório

FORMATO DAS RESPOSTAS:
**TIPO:** [Categoria da estratégia]
**OBJETIVO:** [Finalidade da campanha]

**ESTRATÉGIA PRINCIPAL:**
[Conteúdo otimizado para Meta Ads]

**CONFIGURAÇÕES/VARIAÇÕES:** (quando aplicável)
- Opção 1: [Alternativa]
- Opção 2: [Alternativa]

**DICAS DE OTIMIZAÇÃO:**
- [Estratégia de performance]
- [Melhores práticas Meta]

DIRETRIZES OBRIGATÓRIAS:
- Headlines máximo 40 caracteres
- Texto primário máximo 125 caracteres
- Descrição máximo 30 caracteres
- Segmentações específicas mas não restritivas
- Compliance total com políticas Meta
- Foco em ROI e ROAS
- Estratégias baseadas em dados

INSTRUÇÕES ESPECÍFICAS PARA QUANDO O USUÁRIO ESCOLHER UMA FUNCIONALIDADE:

SE o usuário disser algo como "1. Gerador de Persona" ou "👤 1. Gerador de Persona", você DEVE responder EXATAMENTE assim:

"Perfeito! Vou te ajudar a criar uma **Persona detalhada** para suas campanhas Meta Ads.

Para gerar a persona ideal, preciso de algumas informações:

1️⃣ **Qual o segmento/nicho do negócio?** (ex: fitness, educação, e-commerce)
2️⃣ **Qual o ticket médio do produto/serviço?** (ex: R$ 97, R$ 500, R$ 2.000)
3️⃣ **Tipo de cliente ideal?** (B2B/B2C, idade, gênero, renda)
4️⃣ **Principais problemas/desejos do público?** (dores que o produto resolve)

Responda cada pergunta para eu criar uma persona completa e estratégica! 👤"

SIGA ESTE MESMO PADRÃO para as outras 4 funcionalidades, adaptando as perguntas específicas de cada uma.

NUNCA pule esta etapa de perguntas quando uma funcionalidade for escolhida!

IMPORTANTE: Sempre gere estratégias que sejam compliance com Meta, otimizadas para performance e focadas em resultados reais.`
        },
        {
          role: "user",
          content: `${metaAdsContext}

SOLICITAÇÃO: ${message}

Crie as estratégias otimizadas para Meta Ads conforme especificado acima. Identifique automaticamente o tipo de estratégia necessária e gere conteúdo profissional.`
        }
      ],
      temperature: 0.7,
      max_tokens: 2500
    })

    const response = completion.choices[0].message.content

    return NextResponse.json({
      success: true,
      response: response || 'Desculpe, não consegui gerar a estratégia. Tente novamente.',
      metadata: {
        agencyName: agency?.name,
        totalClients: clients.length,
        totalProjects: projects.length,
        metaAdsFeatures: [
          'Gerador de Persona',
          'Segmentação de Público',
          'Gerador de Copies',
          'Segmentação Inteligente',
          'Testes A/B Automatizados'
        ]
      }
    })

  } catch (error) {
    console.error('❌ Erro no Assistente Meta Ads:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do assistente. Tente novamente.'
    }, { status: 500 })
  }
}
