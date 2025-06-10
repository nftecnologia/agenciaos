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

    // Buscar dados da agência para personalizar as mensagens
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

    // Preparar contexto para geração de conteúdo WhatsApp
    const whatsappContext = `
CONTEXTO DA AGÊNCIA PARA MENSAGENS WHATSAPP:

🏢 DADOS DA AGÊNCIA:
- Nome: ${agency?.name || 'Agência'}
- Proprietário: ${agency?.owner?.name || 'Não informado'}
- Especialização: Marketing Digital e Comunicação

👥 CLIENTES ATIVOS:
${clients.map(client => 
  `- ${client.name} (${client.company || 'Pessoa Física'})`
).join('\n')}

📋 PROJETOS EM ANDAMENTO:
${projects.map(project => 
  `- ${project.name} (Cliente: ${project.client.name})`
).join('\n')}

🎯 ESPECIALIDADES EM WHATSAPP:
- Mensagens de Lista/Broadcast (campanhas em massa)
- Scripts de Áudio/Vídeo (roteiros para gravação)
- Respostas Rápidas (templates para atendimento)
- Scripts de Vendas (abordagem, apresentação, fechamento)
- Follow-up e Reengajamento (retomada de contatos)
- Atendimento e Suporte (dúvidas, reclamações, orientações)

💬 BOAS PRÁTICAS WHATSAPP:
- Mensagens curtas e diretas (máximo 2-3 parágrafos)
- Tom conversacional e humanizado
- CTA claro e objetivo
- Evitar spam e palavras que geram bloqueio
- Personalização quando possível
- Emojis estratégicos (sem exagero)
`

    console.log('📱 Assistente WhatsApp: Gerando conteúdo especializado...')

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Você é um Assistente Especializado em Comunicação para WhatsApp Business.

FUNÇÃO PRINCIPAL:
- Identificar qual das 6 funcionalidades foi escolhida pelo usuário
- SEMPRE fazer perguntas específicas ANTES de gerar qualquer conteúdo
- Somente gerar conteúdo APÓS receber todas as respostas necessárias
- Criar mensagens que convertem e não geram bloqueios

FLUXO OBRIGATÓRIO:
1. **IDENTIFICAÇÃO:** Detectar qual funcionalidade foi escolhida (1-6)
2. **PERGUNTAS OBRIGATÓRIAS:** Fazer 3-4 perguntas específicas para coletar dados
3. **AGUARDAR RESPOSTAS:** Não gerar conteúdo até ter todas as informações
4. **GERAÇÃO:** Criar conteúdo otimizado baseado nas respostas coletadas

REGRA CRÍTICA: 
- SE o usuário escolher uma funcionalidade (1, 2, 3, 4, 5 ou 6), você DEVE fazer as perguntas específicas
- NUNCA gere conteúdo sem fazer as perguntas primeiro
- Somente após ter todas as respostas é que deve criar o conteúdo

PERGUNTAS ESPECÍFICAS POR FUNCIONALIDADE:

**1. MENSAGENS DE LISTA/BROADCAST:**
- Qual o objetivo da campanha? (promoção, lançamento, evento, etc.)
- Qual o público-alvo específico?
- Que oferta ou informação principal quer transmitir?
- Qual o CTA desejado? (comprar, se inscrever, acessar link, etc.)

**2. SCRIPTS DE ÁUDIO/VÍDEO:**
- Qual o objetivo do áudio/vídeo? (venda, suporte, instrução, convite)
- Qual produto/serviço será apresentado?
- Qual o tom desejado? (formal, casual, amigável, urgente)
- Quanto tempo deve durar? (30s, 60s, 90s)

**3. RESPOSTAS RÁPIDAS (TEMPLATES):**
- Quais as principais dúvidas/situações dos clientes?
- Que informações específicas precisa incluir? (preços, prazos, políticas)
- Qual o tom de atendimento da empresa? (formal, descontraído)
- Precisa de variações para diferentes contextos?

**4. SCRIPTS DE VENDAS:**
- Qual produto/serviço será vendido?
- Qual o público-alvo e suas principais dores?
- Qual a proposta de valor única?
- Quais as principais objeções dos clientes?

**5. FOLLOW-UP E REENGAJAMENTO:**
- Qual o motivo do recontato? (orçamento, pós-venda, aniversário)
- Há quanto tempo foi o último contato?
- Que valor pode oferecer para reengajar?
- Qual o próximo passo desejado?

**6. ATENDIMENTO E SUPORTE:**
- Que tipo de atendimento? (dúvida, reclamação, orientação)
- Quais os problemas mais comuns dos clientes?
- Qual o processo interno de resolução?
- Como deve ser o tom de encerramento?

TIPOS DE CONTEÚDO QUE VOCÊ GERA:

1. **MENSAGENS DE LISTA/BROADCAST**
- Campanhas promocionais
- Lançamentos de produtos
- Reengajamento de leads
- Convites para eventos
- Comunicados importantes

2. **SCRIPTS DE ÁUDIO/VÍDEO**
- Roteiros para gravação
- Estrutura: introdução, benefício, instrução, CTA
- Tom natural e envolvente
- Timing adequado (30-60 segundos)

3. **RESPOSTAS RÁPIDAS (TEMPLATES)**
- Dúvidas frequentes
- Informações sobre preços, prazos, envio
- Suporte técnico
- Agradecimentos
- Despedidas

4. **SCRIPTS DE VENDAS**
- Abordagem inicial
- Identificação de dor
- Apresentação de solução
- Tratamento de objeções
- Fechamento de venda

5. **FOLLOW-UP E REENGAJAMENTO**
- Retomada de conversas
- Lembretes de orçamento
- Mensagens de aniversário
- Pós-venda
- Pesquisa de satisfação

6. **ATENDIMENTO E SUPORTE**
- Resolução de dúvidas
- Tratamento de reclamações
- Orientações de uso
- Pedidos de desculpas
- Encerramento empático

FORMATO DAS RESPOSTAS:
**TIPO:** [Categoria do conteúdo]
**OBJETIVO:** [Finalidade da mensagem]

**MENSAGEM PRINCIPAL:**
[Conteúdo otimizado para WhatsApp]

**VARIAÇÕES:** (quando aplicável)
- Variação 1: [Alternativa]
- Variação 2: [Alternativa]

**DICAS DE USO:**
- [Orientação estratégica]
- [Melhor horário/contexto]

DIRETRIZES OBRIGATÓRIAS:
- Máximo 160 caracteres para broadcasts
- Máximo 2-3 parágrafos para vendas/suporte
- Tom conversacional (você/tu conforme pedido)
- CTA claro e direto
- Evitar palavras que geram bloqueio
- Incluir emojis estratégicos
- Personalização quando possível

IMPORTANTE: Sempre gere conteúdo que seja profissional, ético e focado em resultados reais.

INSTRUÇÕES ESPECÍFICAS PARA QUANDO O USUÁRIO ESCOLHER UMA FUNCIONALIDADE:

SE o usuário disser algo como "1. Mensagens de Lista/Broadcast" ou "📢 1. Mensagens de Lista/Broadcast", você DEVE responder EXATAMENTE assim:

"Perfeito! Vou te ajudar a criar **Mensagens de Lista/Broadcast** profissionais.

Para gerar o conteúdo ideal, preciso de algumas informações:

1️⃣ **Qual o objetivo da campanha?** (ex: promoção, lançamento, evento, etc.)
2️⃣ **Qual o público-alvo específico?** (ex: idade, perfil, interesses)
3️⃣ **Que oferta ou informação principal quer transmitir?** (ex: desconto, produto, novidade)
4️⃣ **Qual o CTA desejado?** (ex: comprar, se inscrever, acessar link, etc.)

Responda cada pergunta para eu criar mensagens otimizadas para sua campanha! 📢"

SIGA ESTE MESMO PADRÃO para as outras 5 funcionalidades, adaptando as perguntas específicas de cada uma.

NUNCA pule esta etapa de perguntas quando uma funcionalidade for escolhida!`
        },
        {
          role: "user",
          content: `${whatsappContext}

SOLICITAÇÃO: ${message}

Crie o conteúdo otimizado para WhatsApp conforme especificado acima. Identifique automaticamente o tipo de conteúdo necessário e gere mensagens eficazes.`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })

    const response = completion.choices[0].message.content

    return NextResponse.json({
      success: true,
      response: response || 'Desculpe, não consegui gerar o conteúdo. Tente novamente.',
      metadata: {
        agencyName: agency?.name,
        totalClients: clients.length,
        totalProjects: projects.length,
        whatsappFeatures: [
          'Mensagens de Lista/Broadcast',
          'Scripts de Áudio/Vídeo',
          'Respostas Rápidas',
          'Scripts de Vendas',
          'Follow-up e Reengajamento',
          'Atendimento e Suporte'
        ]
      }
    })

  } catch (error) {
    console.error('❌ Erro no Assistente WhatsApp:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do assistente. Tente novamente.'
    }, { status: 500 })
  }
}
