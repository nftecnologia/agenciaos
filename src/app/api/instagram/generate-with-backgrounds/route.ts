import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { runwareClient } from '@/lib/runware'
import { markupgoClient } from '@/lib/markupgo'
import { generateBusinessTipsTemplate, generateClientResultsTemplate, defaultBrandConfig } from '@/lib/instagram-templates'

const generateWithBackgroundsSchema = z.object({
  templateType: z.enum(['business-tips', 'client-results']),
  slides: z.array(z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    content: z.string().optional(),
    ctaText: z.string().optional(),
  })),
  brandConfig: z.object({
    primaryColor: z.string().default('#667eea'),
    secondaryColor: z.string().default('#764ba2'),
    logoUrl: z.string().optional(),
    fontFamily: z.string().default('Inter'),
    contactInfo: z.string().default('@agencia.digital'),
    agencyName: z.string().default('Agência Digital'),
    useAIBackgrounds: z.boolean().optional(),
    backgroundStyle: z.enum(['professional', 'modern', 'colorful', 'minimalist']).optional(),
  }).optional(),
  topic: z.string()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { templateType, slides, brandConfig = defaultBrandConfig, topic } = generateWithBackgroundsSchema.parse(body)

    console.log('🎨 Gerando carrossel com backgrounds Runware:', { templateType, slidesCount: slides.length, topic })

    // Configurar template apropriado
    const mergedBrandConfig = { ...defaultBrandConfig, ...brandConfig }
    
    // Passo 1: Gerar backgrounds com Runware
    console.log('🖼️ Gerando backgrounds com Runware...')
    const backgroundUrls = await runwareClient.generateCarouselBackgrounds(topic, slides.length)
    
    // Passo 2: Preparar slides com backgrounds
    const slideContents = slides.map((slide, index) => ({
      title: slide.title || `Slide ${index + 1}`,
      subtitle: slide.subtitle,
      content: slide.content || '',
      ctaText: slide.ctaText,
      slideNumber: index + 1,
      totalSlides: slides.length,
      backgroundUrl: backgroundUrls[index] || undefined // Usar background se disponível
    }))

    // Passo 3: Gerar templates HTML com backgrounds
    let htmlTemplates: string[]
    
    if (templateType === 'business-tips') {
      htmlTemplates = generateBusinessTipsTemplate(slideContents, mergedBrandConfig)
    } else {
      htmlTemplates = generateClientResultsTemplate(slideContents, mergedBrandConfig)
    }

    // Passo 4: Gerar imagens finais com MarkupGo
    console.log('📸 Gerando imagens finais com MarkupGo...')
    const markupgoResults = await markupgoClient.generateCarousel(htmlTemplates)
    
    // Filtrar apenas imagens geradas com sucesso
    const successfulImages = markupgoResults.filter(result => result.url && result.url !== '')
    
    if (successfulImages.length === 0) {
      console.error('❌ Nenhuma imagem foi gerada com sucesso')
      return NextResponse.json({
        success: false,
        error: 'Falha ao gerar imagens finais. Tente novamente em alguns instantes.'
      }, { status: 500 })
    }

    const backgroundsGenerated = backgroundUrls.filter(url => url !== '').length
    console.log(`✅ Carrossel completo: ${backgroundsGenerated}/${slides.length} backgrounds + ${successfulImages.length}/${htmlTemplates.length} imagens finais`)
    
    return NextResponse.json({
      success: true,
      data: {
        templateType,
        totalSlides: slides.length,
        backgroundsGenerated,
        imagesGenerated: successfulImages.length,
        backgroundUrls: backgroundUrls,
        images: successfulImages.map(result => ({
          id: result.id,
          url: result.url,
          format: result.format,
          width: result.width,
          height: result.height
        })),
        message: `Carrossel premium gerado! ${backgroundsGenerated} backgrounds AI + ${successfulImages.length} imagens finais.`
      }
    })

  } catch (error) {
    console.error('❌ Erro ao gerar carrossel com backgrounds:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Dados inválidos',
          details: error.errors 
        },
        { status: 400 }
      )
    }

    // Erro específico do Runware
    if (error instanceof Error && error.message.includes('Runware')) {
      return NextResponse.json({
        success: false,
        error: 'Serviço de geração de backgrounds temporariamente indisponível. Tente novamente em alguns minutos.',
        details: error.message
      }, { status: 503 })
    }

    // Erro específico do MarkupGo
    if (error instanceof Error && error.message.includes('MarkupGo')) {
      return NextResponse.json({
        success: false,
        error: 'Serviço de geração de imagens temporariamente indisponível. Tente novamente em alguns minutos.',
        details: error.message
      }, { status: 503 })
    }

    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Instagram Carousel Generator with AI Backgrounds',
    features: [
      'Runware.ai background generation',
      'MarkupGo HTML to image conversion',
      'Professional templates',
      'Customizable brand configuration'
    ],
    models: [
      'civitai:4384@130072 (Realistic Vision)',
      'More models available on request'
    ]
  })
}
