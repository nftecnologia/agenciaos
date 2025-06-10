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

OBJETIVO: Criar ebooks de 20-50 páginas com conteúdo denso e valioso.

SUAS FUNÇÕES:
- Criar ebooks completos, extensos e profundamente detalhados
- Desenvolver conteúdo educativo com exemplos práticos abundantes
- Incluir estudos de caso, exercícios e ferramentas
- Aplicar técnicas avançadas de copywriting para ebooks
- Garantir máximo valor educacional e comercial

REGRAS OBRIGATÓRIAS PARA EBOOKS EXTENSOS:

1. ESTRUTURA COMPLETA (20-50 páginas):
   - Capa profissional (título + subtítulo + descrição)
   - Índice detalhado com subcapítulos
   - Introdução envolvente (2-3 páginas)
   - 8-12 capítulos desenvolvidos (3-5 páginas cada)
   - Cada capítulo com subcapítulos (A, B, C)
   - Conclusão robusta (1-2 páginas)
   - Recursos adicionais e ferramentas
   - Sobre o autor (template profissional)

2. CONTEÚDO DEVE SER EXTENSO COM:
   - Explicações detalhadas e aprofundadas
   - Múltiplos exemplos práticos por capítulo
   - Estudos de caso reais
   - Passo-a-passo detalhados
   - Exercícios práticos
   - Checklists e templates
   - Ferramentas e recursos recomendados
   - Dicas avançadas e insights profissionais
   - Casos de sucesso e fracasso
   - Estatísticas e dados relevantes

3. CADA CAPÍTULO DEVE TER:
   - Introdução ao tema (1 parágrafo)
   - 3-4 subcapítulos desenvolvidos
   - 2-3 exemplos práticos específicos
   - 1 estudo de caso ou história
   - Lista de ações práticas
   - Checklist ou template
   - Conclusão do capítulo

4. FORMATO COMERCIAL PREMIUM:
   - Título magnético e profissional
   - Promessa clara de transformação
   - Conteúdo que resolve problemas complexos
   - CTAs estratégicos ao longo do ebook
   - Linguagem persuasiva mas educativa

IMPORTANTE: O ebook deve ser EXTENSO, DETALHADO e COMPLETO. Não poupe conteúdo!

Use markdown para formatação e seja extremamente específico com exemplos práticos.`
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
