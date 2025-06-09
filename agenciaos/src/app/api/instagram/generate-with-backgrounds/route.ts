import { NextRequest, NextResponse } from 'next/server'
import { DALLEService } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { slides, topic, backgroundStyle = 'professional' } = await request.json()

    if (!slides || !Array.isArray(slides) || slides.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Slides são obrigatórios'
      }, { status: 400 })
    }

    if (!topic?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Tópico é obrigatório para gerar backgrounds'
      }, { status: 400 })
    }

    console.log(`🎨 Iniciando geração de ${slides.length} backgrounds DALL-E`)

    // Gerar backgrounds contextuais para cada slide
    const backgroundUrls = await DALLEService.generateCarouselBackgrounds({
      topic,
      slides: slides.map((slide: { title: string }) => ({ title: slide.title })),
      style: backgroundStyle
    })

    // Combinar slides com backgrounds gerados
    const slidesWithBackgrounds = slides.map((slide: { title: string; content?: string; subtitle?: string; ctaText?: string }, index: number) => ({
      ...slide,
      backgroundUrl: backgroundUrls[index] || null
    }))

    const successCount = backgroundUrls.filter(url => url !== null).length
    
    return NextResponse.json({
      success: true,
      data: {
        slides: slidesWithBackgrounds,
        backgroundsGenerated: successCount,
        totalSlides: slides.length
      }
    })

  } catch (error) {
    console.error('❌ Erro ao gerar backgrounds DALL-E:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    }, { status: 500 })
  }
}
