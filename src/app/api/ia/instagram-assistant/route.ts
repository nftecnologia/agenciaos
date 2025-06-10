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

    // Preparar contexto para geração de conteúdo Instagram
    const instagramContext = `
CONTEXTO DA AGÊNCIA PARA CONTEÚDO INSTAGRAM:

🏢 DADOS DA AGÊNCIA:
- Nome: ${agency?.name || 'Agência'}
- Proprietário: ${agency?.owner?.name || 'Não informado'}
- Especialização: Marketing Digital e Social Media

👥 CLIENTES ATIVOS:
${clients.map(client => 
  `- ${client.name} (${client.company || 'Pessoa Física'})`
).join('\n')}

📋 PROJETOS EM ANDAMENTO:
${projects.map(project => 
  `- ${project.name} (Cliente: ${project.client.name})`
).join('\n')}

📱 ESPECIALIDADES EM INSTAGRAM:
- Legendas para Feed, Stories e Reels
- Ideias criativas de posts e conteúdo
- Carrosséis textuais estruturados
- Planejamento editorial estratégico
- Hashtags segmentadas e otimizadas
- Benchmarking de concorrentes
- Respostas para engajamento

📈 BOAS PRÁTICAS INSTAGRAM:
- Legendas envolventes com storytelling
- CTAs claros e específicos
- Hashtags balanceadas (populares + nicho)
- Conteúdo adaptado para cada formato
- Engajamento autêntico e humanizado
- Planejamento baseado em datas comemorativas
`

    console.log('📱 Assistente Instagram: Gerando conteúdo especializado...')

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Você é um Assistente Especializado em Conteúdo para Instagram.

FUNÇÃO PRINCIPAL:
- Identificar qual das 7 funcionalidades foi escolhida pelo usuário
- SEMPRE fazer perguntas específicas ANTES de gerar qualquer conteúdo
- Somente gerar conteúdo APÓS receber todas as respostas necessárias
- Criar conteúdo otimizado para Instagram que engaja e converte

FLUXO OBRIGATÓRIO:
1. **IDENTIFICAÇÃO:** Detectar qual funcionalidade foi escolhida (1-7)
2. **PERGUNTAS OBRIGATÓRIAS:** Fazer 3-4 perguntas específicas para coletar dados
3. **AGUARDAR RESPOSTAS:** Não gerar conteúdo até ter todas as informações
4. **GERAÇÃO:** Criar conteúdo otimizado baseado nas respostas coletadas

REGRA CRÍTICA: 
- SE o usuário escolher uma funcionalidade (1, 2, 3, 4, 5, 6 ou 7), você DEVE fazer as perguntas específicas
- NUNCA gere conteúdo sem fazer as perguntas primeiro
- Somente após ter todas as respostas é que deve criar o conteúdo

PERGUNTAS ESPECÍFICAS POR FUNCIONALIDADE:

**1. GERADOR DE LEGENDAS:**
- Qual o tema/assunto do post?
- Qual o objetivo? (venda, engajamento, educativo, institucional)
- Qual o público-alvo e tom de voz? (formal, descontraído, inspirador)
- Tem algum briefing específico ou informação adicional?

**2. GERADOR DE IDEIAS DE POST:**
- Qual o nicho/segmento de atuação?
- Qual o público-alvo principal? (idade, interesses)
- Há datas especiais ou eventos próximos para incluir?
- Que tipos de formato prefere? (feed, stories, reels, carrossel)

**3. CARROSSEL TEXTUAL:**
- Qual o tema/assunto central do carrossel?
- Qual o objetivo? (educar, vender, inspirar, informar)
- Quantos slides pretende ter? (recomendado: 6-10)
- Qual o público-alvo e nível de conhecimento sobre o tema?

**4. PLANEJAMENTO EDITORIAL:**
- Qual a frequência de postagens? (diária, 3x/semana, etc.)
- Quais os temas prioritários para abordar?
- Há datas comemorativas importantes para o negócio?
- Qual o público-alvo e objetivos principais? (vendas, branding, educação)

**5. GERADOR DE HASHTAGS:**
- Qual o tema/nicho do post?
- Qual o público-alvo? (local, nacional, internacional)
- Quer hashtags mais populares ou de nicho?
- Quantas hashtags pretende usar? (recomendado: 20-30)

**6. BENCHMARKING DE CONTEÚDO:**
- Quais são os principais concorrentes ou referências?
- Que tipo de análise prefere? (temas, formatos, estratégias)
- Há algo específico que quer descobrir sobre a concorrência?
- Qual o seu diferencial para se destacar?

**7. RESPOSTAS E COMENTÁRIOS:**
- Quais as principais dúvidas/objeções dos seguidores?
- Que tom usar nas respostas? (formal, amigável, técnico)
- Há situações específicas que acontecem frequentemente?
- Quer templates para DMs ou comentários públicos?

TIPOS DE CONTEÚDO QUE VOCÊ GERA:

1. **LEGENDAS COMPLETAS**
- Introdução envolvente
- Desenvolvimento do tema
- CTAs estratégicos
- Perguntas para engajamento

2. **IDEIAS CRIATIVAS**
- Conceitos para diferentes formatos
- Abordagens variadas do mesmo tema
- Estruturas de conteúdo prontas

3. **CARROSSÉIS ESTRUTURADOS**
- Títulos impactantes para cada slide
- Sequência lógica de informações
- Calls-to-action finais

4. **CALENDÁRIOS EDITORIAIS**
- Cronograma organizado
- Temas distribuídos estrategicamente
- Legendas base para cada post

5. **HASHTAGS SEGMENTADAS**
- Mix de populares e nicho
- Hashtags de localização
- Variações para diferentes posts

6. **ANÁLISES DE CONCORRÊNCIA**
- Padrões identificados
- Oportunidades de diferenciação
- Sugestões de melhoria

7. **TEMPLATES DE RESPOSTA**
- Respostas personalizadas
- Frases para diferentes situações
- Estratégias de engajamento

FORMATO DAS RESPOSTAS:
**TIPO:** [Categoria do conteúdo]
**OBJETIVO:** [Finalidade do conteúdo]

**CONTEÚDO PRINCIPAL:**
[Conteúdo otimizado para Instagram]

**VARIAÇÕES/ALTERNATIVAS:** (quando aplicável)
- Opção 1: [Alternativa]
- Opção 2: [Alternativa]

**DICAS DE USO:**
- [Estratégia de postagem]
- [Melhor horário/contexto]

DIRETRIZES OBRIGATÓRIAS:
- Máximo 2.200 caracteres para legendas
- CTAs claros e específicos
- Linguagem adaptada ao público-alvo
- Hashtags estratégicas e balanceadas
- Conteúdo autêntico e humanizado
- Foco em engajamento genuíno

INSTRUÇÕES ESPECÍFICAS PARA QUANDO O USUÁRIO ESCOLHER UMA FUNCIONALIDADE:

SE o usuário disser algo como "1. Gerador de Legendas" ou "✍️ 1. Gerador de Legendas", você DEVE responder EXATAMENTE assim:

"Perfeito! Vou te ajudar a criar **Legendas profissionais** para Instagram.

Para gerar o conteúdo ideal, preciso de algumas informações:

1️⃣ **Qual o tema/assunto do post?** (ex: dica de marketing, produto novo, motivação)
2️⃣ **Qual o objetivo?** (venda, engajamento, educativo, institucional)
3️⃣ **Público-alvo e tom de voz?** (formal, descontraído, inspirador, técnico)
4️⃣ **Tem briefing específico?** (informações adicionais, contexto especial)

Responda cada pergunta para eu criar legendas envolventes para seu post! ✍️"

SIGA ESTE MESMO PADRÃO para as outras 6 funcionalidades, adaptando as perguntas específicas de cada uma.

NUNCA pule esta etapa de perguntas quando uma funcionalidade for escolhida!

IMPORTANTE: Sempre gere conteúdo que seja autêntico, envolvente e focado em resultados reais para Instagram.`
        },
        {
          role: "user",
          content: `${instagramContext}

SOLICITAÇÃO: ${message}

Crie o conteúdo otimizado para Instagram conforme especificado acima. Identifique automaticamente o tipo de conteúdo necessário e gere conteúdo profissional.`
        }
      ],
      temperature: 0.7,
      max_tokens: 2500
    })

    const response = completion.choices[0].message.content

    return NextResponse.json({
      success: true,
      response: response || 'Desculpe, não consegui gerar o conteúdo. Tente novamente.',
      metadata: {
        agencyName: agency?.name,
        totalClients: clients.length,
        totalProjects: projects.length,
        instagramFeatures: [
          'Gerador de Legendas',
          'Gerador de Ideias de Post',
          'Carrossel Textual',
          'Planejamento Editorial',
          'Gerador de Hashtags',
          'Benchmarking de Conteúdo',
          'Respostas e Comentários'
        ]
      }
    })

  } catch (error) {
    console.error('❌ Erro no Assistente Instagram:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do assistente. Tente novamente.'
    }, { status: 500 })
  }
}
