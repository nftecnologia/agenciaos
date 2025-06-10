import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { markupgoClient } from '@/lib/markupgo'
import { generateBusinessTipsTemplate, generateClientResultsTemplate, defaultBrandConfig } from '@/lib/instagram-templates'

const generateCarouselSchema = z.object({
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
  topic: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { templateType, slides, brandConfig = defaultBrandConfig, topic } = generateCarouselSchema.parse(body)

    console.log('🎨 Gerando carrossel com MarkupGo:', { templateType, slidesCount: slides.length, topic })

    // Configurar template apropriado
    const mergedBrandConfig = { ...defaultBrandConfig, ...brandConfig }
    
    // Preparar slides com dados completos
    const slideContents = slides.map((slide, index) => ({
      title: slide.title || `Slide ${index + 1}`,
      subtitle: slide.subtitle,
      content: slide.content || '',
      ctaText: slide.ctaText,
      slideNumber: index + 1,
      totalSlides: slides.length
    }))

    // Gerar templates HTML
    let htmlTemplates: string[]
    
    if (templateType === 'business-tips') {
      htmlTemplates = generateBusinessTipsTemplate(slideContents, mergedBrandConfig)
    } else {
      htmlTemplates = generateClientResultsTemplate(slideContents, mergedBrandConfig)
    }

    // Gerar imagens com MarkupGo
    console.log('📸 Iniciando geração de imagens...')
    const markupgoResults = await markupgoClient.generateCarousel(htmlTemplates)
    
    // Filtrar apenas imagens geradas com sucesso
    const successfulImages = markupgoResults.filter(result => result.url && result.url !== '')
    
    if (successfulImages.length === 0) {
      console.error('❌ Nenhuma imagem foi gerada com sucesso')
      return NextResponse.json({
        success: false,
        error: 'Falha ao gerar imagens. Tente novamente em alguns instantes.'
      }, { status: 500 })
    }

    console.log(`✅ Geradas ${successfulImages.length}/${htmlTemplates.length} imagens`)
    
    return NextResponse.json({
      success: true,
      data: {
        templateType,
        totalSlides: slides.length,
        imagesGenerated: successfulImages.length,
        images: successfulImages.map(result => ({
          id: result.id,
          url: result.url,
          format: result.format,
          width: result.width,
          height: result.height
        })),
        message: `Carrossel gerado com sucesso! ${successfulImages.length}/${htmlTemplates.length} imagens prontas.`
      }
    })

  } catch (error) {
    console.error('❌ Erro ao gerar carrossel:', error)
    
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
    templates: [
      {
        id: 'business-tips',
        name: 'Dicas de Negócio',
        description: 'Carrossel com dicas e insights para negócios',
        slides: [
          { title: 'Título Principal', subtitle: 'Número de dicas' },
          { title: 'Dica 1', content: 'Conteúdo da primeira dica' },
          { title: 'Dica 2', content: 'Conteúdo da segunda dica' },
          { title: 'Dica 3', content: 'Conteúdo da terceira dica' },
          { title: 'Call to Action', content: 'Mensagem final', ctaText: 'Entre em contato' }
        ]
      },
      {
        id: 'client-results',
        name: 'Resultados do Cliente',
        description: 'Case de sucesso com antes/depois',
        slides: [
          { title: 'Desafio do Cliente', content: 'Descrição do problema' },
          { title: 'Nossa Solução', content: 'Estratégia aplicada' },
          { title: 'Resultados Obtidos', content: 'Números e conquistas' },
          { title: 'Trabalhe Conosco', content: 'Convite para novos clientes', ctaText: 'Solicitar orçamento' }
        ]
      }
    ]
  })
}
