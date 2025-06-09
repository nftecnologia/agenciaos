import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { topic, audience, tone, template } = await request.json()

    if (!topic?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Assunto do carrossel é obrigatório'
      }, { status: 400 })
    }

    // Definir número de slides baseado no template
    const slideCount = template === 'dicas-negocio' ? 7 : 5

    // Criar prompt personalizado baseado no tom de voz
    const tonePrompts = {
      profissional: 'Tom profissional e autoritativo, focado em expertise e credibilidade',
      casual: 'Tom casual e amigável, como uma conversa entre amigos',
      inspirador: 'Tom motivacional e inspirador, que encoraja ação',
      educativo: 'Tom didático e educacional, focado em ensinar',
      vendas: 'Tom persuasivo focado em conversão e vendas'
    }

    const audienceContext = audience ? `para o público: ${audience}` : 'para o público geral'
    const toneContext = tonePrompts[tone as keyof typeof tonePrompts] || tonePrompts.profissional

    const prompt = `
Você é um especialista em marketing digital e criação de conteúdo para Instagram. 
Crie um carrossel educativo sobre: "${topic}" ${audienceContext}.

Instruções específicas:
- ${toneContext}
- Crie EXATAMENTE ${slideCount} slides
- O primeiro slide deve ser uma introdução/capa chamativa
- Os slides intermediários devem ter dicas/estratégias numeradas
- O último slide deve ter uma CHAMADA ATRATIVA (não apenas "Call to Action")
- Cada slide deve ter título conciso (máximo 50 caracteres)
- O conteúdo deve ser prático e acionável
- Use linguagem brasileira e relevante para o mercado brasileiro

IMPORTANTE para o último slide:
- Use títulos atrativos como: "Vamos conversar?", "Que tal começar hoje?", "Pronts para o próximo passo?", "Transforme seu negócio agora!", "Resultados que você merece"
- NUNCA use apenas "Call to Action" como título

Formato de resposta (JSON):
{
  "slides": [
    {
      "title": "Título do Slide 1",
      "subtitle": "Subtítulo apenas para o primeiro slide",
      "content": "Conteúdo detalhado do slide"
    },
    {
      "title": "1. Primeira Dica",
      "content": "Explicação da primeira dica"
    },
    ...
    {
      "title": "Vamos conversar?",
      "content": "Texto motivando ação",
      "ctaText": "Entre em contato conosco!"
    }
  ]
}

Responda APENAS com o JSON válido, sem texto adicional.
`

    // Chamar OpenAI para gerar conteúdo
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Você é um especialista em marketing digital e criação de conteúdo para Instagram. Sempre responda com JSON válido."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })

    const aiResponse = completion.choices[0].message.content

    if (!aiResponse) {
      return NextResponse.json({
        success: false,
        error: 'Não foi possível gerar conteúdo'
      }, { status: 500 })
    }

    try {
      // Tentar fazer parse do JSON da resposta da IA
      const parsedContent = JSON.parse(aiResponse)
      
      if (!parsedContent.slides || !Array.isArray(parsedContent.slides)) {
        throw new Error('Formato de resposta inválido')
      }

      // Validar e limpar os slides
      const validatedSlides = parsedContent.slides.map((slide: { title?: string; subtitle?: string; content?: string; ctaText?: string }, index: number) => ({
        title: slide.title || `Slide ${index + 1}`,
        subtitle: index === 0 ? slide.subtitle : undefined,
        content: slide.content || '',
        ctaText: index === parsedContent.slides.length - 1 ? slide.ctaText : undefined
      }))

      return NextResponse.json({
        success: true,
        data: {
          slides: validatedSlides
        }
      })

    } catch (parseError) {
      console.error('Erro ao fazer parse da resposta da IA:', parseError)
      console.error('Resposta da IA:', aiResponse)
      
      // Fallback: criar slides básicos manualmente
      const fallbackSlides = [
        {
          title: `${topic.split(' ').slice(0, 3).join(' ')}`,
          subtitle: 'Estratégias que funcionam',
          content: `Descubra as melhores práticas sobre ${topic.toLowerCase()}`
        },
        {
          title: '1. Primeira Estratégia',
          content: `Primeira dica importante sobre ${topic.toLowerCase()}`
        },
        {
          title: '2. Segunda Estratégia',
          content: `Segunda dica valiosa sobre ${topic.toLowerCase()}`
        },
        {
          title: '3. Terceira Estratégia',
          content: `Terceira estratégia eficaz sobre ${topic.toLowerCase()}`
        },
        {
          title: 'Vamos conversar?',
          content: 'Que tal aplicar essas estratégias no seu negócio?',
          ctaText: 'Entre em contato conosco!'
        }
      ]

      return NextResponse.json({
        success: true,
        data: {
          slides: fallbackSlides
        }
      })
    }

  } catch (error) {
    console.error('Erro ao gerar conteúdo:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    }, { status: 500 })
  }
}
