import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { markupgoClient } from '@/lib/markupgo'
import { DALLEService } from '@/lib/openai'
import { 
  generateBusinessTipsTemplate, 
  generateClientResultsTemplate,
  defaultBrandConfig,
  type BrandConfig 
} from '@/lib/instagram-templates'

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
    const { templateType, slides, brandConfig, topic } = generateCarouselSchema.parse(body)

    const finalBrandConfig: BrandConfig = {
      ...defaultBrandConfig,
      ...brandConfig
    }

    console.log('🎨 Iniciando geração de carrossel...')
    console.log('📝 Usar AI Backgrounds:', finalBrandConfig.useAIBackgrounds)
    console.log('🎭 Estilo:', finalBrandConfig.backgroundStyle)
    console.log('📋 Tópico:', topic)

    let backgroundImages: (string | null)[] = []
    
    if (finalBrandConfig.useAIBackgrounds && topic) {
      console.log('🎨 Gerando backgrounds com Runware AI...')
      
      try {
        backgroundImages = await DALLEService.generateCarouselBackgrounds({
          topic,
          slides: slides.map(slide => ({ 
            title: slide.title || '', 
            content: slide.content
          })),
          style: finalBrandConfig.backgroundStyle || 'professional'
        })
        
        const successCount = backgroundImages.filter(img => img !== null).length
        console.log(`✅ Runware AI: ${successCount}/${slides.length} backgrounds gerados`)
        
      } catch (error) {
        console.error('❌ Erro ao gerar backgrounds Runware AI:', error)
        backgroundImages = slides.map(() => null)
      }
    } else {
      backgroundImages = slides.map(() => null)
    }

    const slidesWithBackgrounds = slides.map((slide, index) => ({
      ...slide,
      backgroundUrl: backgroundImages[index] || undefined
    }))

    console.log('📄 Gerando templates HTML...')

    let htmlSlides: string[] = []
    
    switch (templateType) {
      case 'business-tips':
        htmlSlides = generateBusinessTipsTemplate(slidesWithBackgrounds, finalBrandConfig)
        break
      case 'client-results':
        htmlSlides = generateClientResultsTemplate(slidesWithBackgrounds, finalBrandConfig)
        break
      default:
        return NextResponse.json(
          { error: 'Template type não suportado' },
          { status: 400 }
        )
    }

    console.log('🖼️ Enviando para MarkupGo...')

    const results = await markupgoClient.generateCarousel(htmlSlides)

    console.log(`✅ MarkupGo: ${results.length} imagens geradas`)

    return NextResponse.json({
      success: true,
      data: {
        templateType,
        totalSlides: slides.length,
        aiBackgroundsUsed: finalBrandConfig.useAIBackgrounds || false,
        backgroundsGenerated: backgroundImages.filter(img => img !== null).length,
        images: results.map((result, index) => ({
          slideNumber: index + 1,
          id: result.id,
          url: result.url,
          format: result.format,
          size: result.size,
          width: result.width,
          height: result.height,
          createdAt: result.createdAt,
          hasAIBackground: backgroundImages[index] !== null
        }))
      }
    })

  } catch (error) {
    console.error('❌ Erro ao gerar carrossel:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
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
