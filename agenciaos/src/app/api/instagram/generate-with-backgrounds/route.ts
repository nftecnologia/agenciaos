import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { slides, topic, style = 'professional' } = await request.json()

    if (!slides || !Array.isArray(slides) || slides.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Slides são obrigatórios'
      }, { status: 400 })
    }

    console.log('🎨 Gerando backgrounds para:', { 
      slideCount: slides.length, 
      topic, 
      style 
    })

    // Fallback: retornar URLs de placeholder para cada slide
    const mockBackgrounds = slides.map((_, index) => ({
      slideIndex: index,
      backgroundUrl: `https://via.placeholder.com/1080x1080/667eea/ffffff?text=Slide+${index + 1}`,
      style: style,
      generated: false,
      message: 'Background placeholder gerado (DALL-E temporariamente desabilitado)'
    }))

    // TODO: Reintegrar DALL-E quando o build estiver funcionando
    return NextResponse.json({
      success: true,
      data: {
        backgrounds: mockBackgrounds,
        totalGenerated: slides.length,
        style: style,
        message: 'Backgrounds placeholder gerados com sucesso'
      }
    })

  } catch (error) {
    console.error('Erro ao gerar backgrounds:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    }, { status: 500 })
  }
}
