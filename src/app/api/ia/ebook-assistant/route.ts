import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { openai } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { message } = await request.json()

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Mensagem é obrigatória' }, { status: 400 })
    }

    console.log('📚 Assistente de Ebooks: Processando solicitação...')

    // Detectar se o usuário quer gerar descrição ou ebook completo
    const isEbookGeneration = message.toLowerCase().includes('gerar ebook') || 
                             message.toLowerCase().includes('criar ebook') ||
                             message.toLowerCase().includes('escrever ebook')

    if (isEbookGeneration) {
      // Gerar ebook completo
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Você é um Assistente Especializado em Criação de Ebooks EXTENSOS e DETALHADOS de alta qualidade comercial.

OBJETIVO CRÍTICO: Criar ebooks de MÍNIMO 30-50 páginas com conteúdo MUITO denso e valioso.

SUAS FUNÇÕES:
- Criar ebooks EXTENSOS, completos e profundamente detalhados
- Desenvolver conteúdo educativo com exemplos práticos abundantes
- Incluir múltiplos estudos de caso, exercícios e ferramentas
- Aplicar técnicas avançadas de copywriting para ebooks
- Garantir máximo valor educacional e comercial

REGRAS ABSOLUTAS PARA EBOOKS EXTENSOS (30-50 PÁGINAS):

1. ESTRUTURA OBRIGATÓRIA EXTENSA:
   - Capa profissional completa (1 página)
   - Índice detalhado com subcapítulos (1 página)
   - Introdução EXTENSA e envolvente (3-4 páginas)
   - 10-15 capítulos desenvolvidos (2-4 páginas cada)
   - Cada capítulo com 4-6 subcapítulos detalhados
   - Conclusão robusta e motivacional (2 páginas)
   - Recursos adicionais extensos (2 páginas)
   - Sobre o autor profissional (1 página)
   - Anexos com templates e checklists (2-3 páginas)

2. CADA CAPÍTULO DEVE SER EXTENSO COM:
   - Introdução detalhada ao tema (1 parágrafo longo)
   - 4-6 subcapítulos desenvolvidos (400-600 palavras cada)
   - 3-5 exemplos práticos específicos e detalhados
   - 2-3 estudos de caso completos com resultados
   - Passo-a-passo muito detalhados (10-20 passos)
   - Exercícios práticos com instruções completas
   - Checklists detalhadas (10-15 itens)
   - Templates prontos para usar
   - Ferramentas e recursos específicos recomendados
   - Dicas avançadas e insights profissionais únicos
   - Casos de sucesso E fracasso com análises
   - Estatísticas, dados e pesquisas relevantes
   - Citações de especialistas e autoridades
   - Conclusão do capítulo com resumo dos pontos-chave

3. INTRODUÇÃO DEVE SER EXTENSA (3-4 páginas):
   - Gancho emocional forte (200 palavras)
   - Definição do problema em detalhes (300 palavras)
   - Consequências de não resolver (200 palavras)
   - Promessa de transformação específica (300 palavras)
   - Visão geral do que será aprendido (200 palavras)
   - Como usar o ebook para máximo resultado (200 palavras)

4. CONCLUSÃO DEVE SER ROBUSTA (2 páginas):
   - Resumo completo de todos os pontos-chave
   - Plano de ação passo-a-passo para implementação
   - Motivação e inspiração para começar agora
   - Call-to-action específico e persuasivo
   - Próximos passos recomendados

5. FORMATO COMERCIAL PREMIUM:
   - Título magnético e profissional
   - Promessa clara de transformação mensurável
   - Conteúdo que resolve problemas complexos de forma completa
   - CTAs estratégicos em cada capítulo
   - Linguagem persuasiva mas educativa e autoritária
   - Tons de especialista com credibilidade

INSTRUÇÕES CRÍTICAS:
- NUNCA seja resumido ou superficial
- SEMPRE desenvolva cada ponto em profundidade
- ESCREVA parágrafos longos e detalhados (150-300 palavras cada)
- INCLUA o máximo de exemplos e casos práticos possível
- DETALHE cada processo passo-a-passo
- FAÇA o ebook parecer um curso completo em formato texto

IMPORTANTE: O ebook DEVE ser MUITO EXTENSO, DETALHADO e COMPLETO. Se não atingir 30+ páginas, está incompleto!

Use markdown para formatação e seja EXTREMAMENTE específico com exemplos práticos detalhados.`
          },
          {
            role: "user",
            content: `${message}

Por favor, crie um EBOOK EXTENSO E DETALHADO (20-50 páginas) baseado neste assunto. 

INCLUA OBRIGATORIAMENTE:

1. CAPA PROFISSIONAL (título magnético, subtítulo, descrição comercial)
2. ÍNDICE DETALHADO (8-12 capítulos com subcapítulos)
3. INTRODUÇÃO ENVOLVENTE (2-3 páginas com gancho, problema, promessa)
4. 8-12 CAPÍTULOS DESENVOLVIDOS (3-5 páginas cada) com:
   - Subcapítulos (A, B, C)
   - Múltiplos exemplos práticos
   - Estudos de caso
   - Exercícios e checklists
   - Ferramentas recomendadas
5. CONCLUSÃO ROBUSTA (resumo, transformação, call-to-action)
6. RECURSOS ADICIONAIS (ferramentas, links, templates)
7. SOBRE O AUTOR (template profissional)

FAÇA UM EBOOK EXTENSO, DETALHADO E DE ALTÍSSIMA QUALIDADE COMERCIAL!`
          }
        ],
        temperature: 0.8,
        max_tokens: 16000
      })

      const response = completion.choices[0].message.content

      return NextResponse.json({
        success: true,
        response: response || 'Não foi possível gerar o ebook. Tente novamente.',
        type: 'ebook-complete'
      })

    } else {
      // Gerar descrição e estrutura do ebook
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Você é um Assistente Especializado em Planejamento de Ebooks.

SUAS FUNÇÕES:
- Analisar temas e criar conceitos de ebooks
- Gerar descrições comerciais atrativas
- Estruturar índices detalhados
- Identificar público-alvo
- Sugerir estratégias de conteúdo

REGRAS OBRIGATÓRIAS:
1. SEMPRE faça perguntas específicas sobre:
   - Público-alvo do ebook
   - Nível de conhecimento (iniciante/intermediário/avançado)
   - Objetivo principal (educar/vender/informar)
   - Formato preferido (prático/teórico/misto)

2. GERE uma descrição completa com:
   - Título atrativo
   - Subtítulo explicativo
   - Descrição comercial (2-3 parágrafos)
   - Público-alvo definido
   - Benefícios específicos
   - Índice preliminar (5-8 capítulos)

3. SEJA ESPECÍFICO e comercial, focando no valor que o ebook entregará.

NUNCA pule as perguntas - elas são obrigatórias para criar um ebook de qualidade.`
          },
          {
            role: "user",
            content: `Assunto do ebook: ${message}

Por favor, me ajude a planejar este ebook. Primeiro, preciso que você me faça algumas perguntas essenciais para criar o melhor conceito possível.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })

      const response = completion.choices[0].message.content

      return NextResponse.json({
        success: true,
        response: response || 'Não foi possível processar sua solicitação. Tente novamente.',
        type: 'ebook-planning'
      })
    }

  } catch (error) {
    console.error('❌ Erro no Assistente de Ebooks:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do assistente. Tente novamente.'
    }, { status: 500 })
  }
}
