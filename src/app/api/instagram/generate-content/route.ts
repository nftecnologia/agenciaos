import { NextRequest, NextResponse } from 'next/server'
import { OpenAIService } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { topic, audience, tone, template } = await request.json()

    if (!topic?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Assunto do carrossel é obrigatório'
      }, { status: 400 })
    }

    console.log('🎨 Gerando conteúdo com OpenAI para:', { topic, audience, tone, template })

    // Gerar conteúdo usando OpenAI
    const result = await OpenAIService.generateCarouselContent(topic)

    if (result.slides && result.slides.length > 0) {
      return NextResponse.json({
        success: true,
        data: {
          slides: result.slides,
          message: 'Conteúdo gerado com sucesso pela IA!'
        }
      })
    } else {
      // Fallback caso a API falhe
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
          slides: fallbackSlides,
          message: 'Conteúdo gerado com template padrão'
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
