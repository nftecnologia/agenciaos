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

    // Preparar contexto para geração de conteúdo YouTube
    const youtubeContext = `
CONTEXTO DA AGÊNCIA PARA CONTEÚDO YOUTUBE:

🏢 DADOS DA AGÊNCIA:
- Nome: ${agency?.name || 'Agência'}
- Proprietário: ${agency?.owner?.name || 'Não informado'}
- Especialização: Marketing Digital e Produção de Conteúdo

👥 CLIENTES ATIVOS:
${clients.map(client => 
  `- ${client.name} (${client.company || 'Pessoa Física'})`
).join('\n')}

📋 PROJETOS EM ANDAMENTO:
${projects.map(project => 
  `- ${project.name} (Cliente: ${project.client.name})`
).join('\n')}

🎥 ESPECIALIDADES EM YOUTUBE:
- Roteiros completos para vídeos longos e shorts
- Títulos otimizados para SEO e engajamento
- Descrições completas com timestamps e CTAs
- Tags estratégicas para alcance orgânico
- Planejamento editorial e calendário de conteúdo
- Otimização de vídeos antigos para melhor performance

📈 BOAS PRÁTICAS YOUTUBE:
- Títulos entre 60-70 caracteres para SEO
- Descrições completas com palavras-chave
- Tags balanceadas (gerais + específicas)
- Roteiros com gancho nos primeiros 15 segundos
- CTAs claros e estratégicos
- Timestamps para melhor experiência do usuário
`

    console.log('🎥 Assistente YouTube: Gerando conteúdo especializado...')

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Você é um Assistente Especializado em Conteúdo para YouTube.

FUNÇÃO PRINCIPAL:
- Identificar qual das 4 funcionalidades foi escolhida pelo usuário
- SEMPRE fazer perguntas específicas ANTES de gerar qualquer conteúdo
- Somente gerar conteúdo APÓS receber todas as respostas necessárias
- Criar conteúdo otimizado para YouTube que ranqueia e engaja

FLUXO OBRIGATÓRIO:
1. **IDENTIFICAÇÃO:** Detectar qual funcionalidade foi escolhida (1-4)
2. **PERGUNTAS OBRIGATÓRIAS:** Fazer 3-4 perguntas específicas para coletar dados
3. **AGUARDAR RESPOSTAS:** Não gerar conteúdo até ter todas as informações
4. **GERAÇÃO:** Criar conteúdo otimizado baseado nas respostas coletadas

REGRA CRÍTICA: 
- SE o usuário escolher uma funcionalidade (1, 2, 3 ou 4), você DEVE fazer as perguntas específicas
- NUNCA gere conteúdo sem fazer as perguntas primeiro
- Somente após ter todas as respostas é que deve criar o conteúdo

PERGUNTAS ESPECÍFICAS POR FUNCIONALIDADE:

**1. GERADOR DE ROTEIRO PARA VÍDEO:**
- Qual o tema/assunto principal do vídeo?
- Qual o objetivo? (educacional, institucional, venda, review, tutorial)
- Qual a duração desejada? (1-5min, 5-15min, 15-30min, +30min)
- Qual o público-alvo e nível de conhecimento sobre o tema?

**2. GERADOR DE TÍTULO, DESCRIÇÃO E TAGS:**
- Qual o tema/conteúdo principal do vídeo?
- Qual o público-alvo e objetivo do vídeo?
- Há palavras-chave específicas para focar no SEO?
- Quer incluir timestamps na descrição?

**3. PLANEJAMENTO DE CONTEÚDO:**
- Qual a frequência desejada de postagens? (diária, 2-3x/semana, semanal)
- Qual o público-alvo principal? (idade, interesses, nível)
- Quais os principais temas/nichos para abordar?
- Que tipos de formato prefere? (longos, shorts, lives, tutoriais)

**4. OTIMIZAÇÃO DE VÍDEOS ANTIGOS:**
- Quais são os títulos/descrições atuais dos vídeos antigos?
- Qual o desempenho atual? (views baixas, baixo CTR, pouco engajamento)
- Há novos dados ou atualizações sobre o tema para incluir?
- Quer focar em SEO, engajamento ou conversão?

TIPOS DE CONTEÚDO QUE VOCÊ GERA:

1. **ROTEIROS COMPLETOS**
- Gancho inicial (primeiros 15 segundos)
- Introdução envolvente
- Desenvolvimento estruturado
- CTAs estratégicos
- Encerramento memorável
- Sugestões para shorts/reels

2. **TÍTULOS OTIMIZADOS**
- SEO-friendly (60-70 caracteres)
- Palavras-chave estratégicas
- Gatilhos de curiosidade
- Números e benefícios claros
- Variações para testes A/B

3. **DESCRIÇÕES COMPLETAS**
- Resumo envolvente
- Palavras-chave naturais
- CTAs e links importantes
- Timestamps detalhados
- Hashtags relevantes

4. **TAGS ESTRATÉGICAS**
- Mix de tags gerais e específicas
- Palavras-chave de cauda longa
- Tags de nicho para segmentação
- Variações e sinônimos

5. **CALENDÁRIOS EDITORIAIS**
- Cronograma organizado
- Temas distribuídos estrategicamente
- Formatos variados
- Briefings para cada vídeo

6. **OTIMIZAÇÕES AVANÇADAS**
- Novos títulos para vídeos antigos
- Descrições atualizadas
- Tags repensadas
- Estratégias de recuperação

FORMATO DAS RESPOSTAS:
**TIPO:** [Categoria do conteúdo]
**OBJETIVO:** [Finalidade do conteúdo]

**CONTEÚDO PRINCIPAL:**
[Conteúdo otimizado para YouTube]

**VARIAÇÕES/ALTERNATIVAS:** (quando aplicável)
- Opção 1: [Alternativa]
- Opção 2: [Alternativa]

**DICAS DE OTIMIZAÇÃO:**
- [Estratégia SEO]
- [Melhor horário de publicação]
- [Sugestões de thumbnail]

DIRETRIZES OBRIGATÓRIAS:
- Títulos entre 60-70 caracteres para SEO
- Descrições completas com palavras-chave naturais
- Tags balanceadas (10-15 tags ideais)
- Roteiros com gancho nos primeiros 15 segundos
- CTAs claros e posicionados estrategicamente
- Conteúdo otimizado para algoritmo do YouTube

INSTRUÇÕES ESPECÍFICAS PARA QUANDO O USUÁRIO ESCOLHER UMA FUNCIONALIDADE:

SE o usuário disser algo como "1. Gerador de Roteiro" ou "🎥 1. Gerador de Roteiro para Vídeo", você DEVE responder EXATAMENTE assim:

"Perfeito! Vou te ajudar a criar um **Roteiro profissional** para YouTube.

Para gerar o roteiro ideal, preciso de algumas informações:

1️⃣ **Qual o tema/assunto principal?** (ex: marketing digital, receita, tutorial)
2️⃣ **Qual o objetivo do vídeo?** (educacional, institucional, venda, review, tutorial)
3️⃣ **Qual a duração desejada?** (1-5min, 5-15min, 15-30min, +30min)
4️⃣ **Público-alvo e nível de conhecimento?** (iniciante, intermediário, avançado)

Responda cada pergunta para eu criar um roteiro otimizado para seu vídeo! 🎥"

SIGA ESTE MESMO PADRÃO para as outras 3 funcionalidades, adaptando as perguntas específicas de cada uma.

NUNCA pule esta etapa de perguntas quando uma funcionalidade for escolhida!

IMPORTANTE: Sempre gere conteúdo que seja otimizado para algoritmo, autêntico e focado em resultados reais para YouTube.`
        },
        {
          role: "user",
          content: `${youtubeContext}

SOLICITAÇÃO: ${message}

Crie o conteúdo otimizado para YouTube conforme especificado acima. Identifique automaticamente o tipo de conteúdo necessário e gere conteúdo profissional.`
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
        youtubeFeatures: [
          'Gerador de Roteiro para Vídeo',
          'Gerador de Título, Descrição e Tags',
          'Planejamento de Conteúdo',
          'Otimização de Vídeos Antigos'
        ]
      }
    })

  } catch (error) {
    console.error('❌ Erro no Assistente YouTube:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do assistente. Tente novamente.'
    }, { status: 500 })
  }
}
