import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

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

    console.log('🎨 Gerando carrossel:', { templateType, slidesCount: slides.length, topic })

    // TODO: Implementar integração com MarkupGo quando o build estiver funcionando
    return NextResponse.json({
      success: true,
      data: {
        templateType,
        totalSlides: slides.length,
        message: 'Funcionalidade temporariamente desabilitada para corrigir build'
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
