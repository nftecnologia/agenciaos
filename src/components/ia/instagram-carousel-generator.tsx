'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Instagram, Download, Loader2, Sparkles, Check, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react'

interface SlideContent {
  id: number
  title: string
  content: string
  slideNumber: string
}

interface GeneratedCarousel {
  slides: SlideContent[]
  images?: string[]
}

export function InstagramCarouselGenerator() {
  const [topic, setTopic] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingImages, setIsGeneratingImages] = useState(false)
  const [useAIBackgrounds, setUseAIBackgrounds] = useState(true)
  const [generatedCarousel, setGeneratedCarousel] = useState<GeneratedCarousel | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [expandedSlides, setExpandedSlides] = useState<number[]>([])

  const toggleSlideExpansion = (slideId: number) => {
    setExpandedSlides(prev => 
      prev.includes(slideId) 
        ? prev.filter(id => id !== slideId)
        : [...prev, slideId]
    )
  }

  const generateCarousel = async () => {
    if (!topic.trim()) return

    setIsGenerating(true)
    setShowResults(false)

    try {
      // Primeiro, gerar o conteúdo
      const contentResponse = await fetch('/api/instagram/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic })
      })

      const contentResult = await contentResponse.json()

      if (contentResult.success) {
        const slides: SlideContent[] = contentResult.data.slides.map((slide: any, index: number) => ({
          id: index + 1,
          slideNumber: `Slide ${index + 1}`,
          title: slide.title,
          content: slide.content
        }))

        setGeneratedCarousel({ slides })
        setIsGenerating(false)
      } else {
        console.error('Erro ao gerar conteúdo:', contentResult.error)
        alert('Erro ao gerar conteúdo. Tente novamente.')
        setIsGenerating(false)
      }
    } catch (error) {
      console.error('Erro na requisição:', error)
      alert('Erro na requisição. Tente novamente.')
      setIsGenerating(false)
    }
  }

  const generateImages = async () => {
    if (!generatedCarousel) return

    setIsGeneratingImages(true)
    setShowResults(true)

    try {
      // Preparar os slides no formato esperado pela API
      const slides = generatedCarousel.slides.map(slide => ({
        title: slide.title,
        content: slide.content
      }))

      // Escolher API baseada na opção de backgrounds
      const apiEndpoint = useAIBackgrounds 
        ? '/api/instagram/generate-with-backgrounds'
        : '/api/instagram/generate-carousel'

      const requestBody = {
        templateType: 'business-tips',
        slides,
        brandConfig: {
          primaryColor: '#667eea',
          secondaryColor: '#764ba2',
          fontFamily: 'Inter',
          contactInfo: '@agencia.digital',
          agencyName: 'Agência Digital',
          useAIBackgrounds,
          backgroundStyle: 'professional'
        },
        ...(useAIBackgrounds && { topic }) // Adicionar tópico para backgrounds AI
      }

      console.log(`🎨 Usando ${useAIBackgrounds ? 'Runware + MarkupGo' : 'MarkupGo apenas'}`)

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      const result = await response.json()

      if (result.success && result.data && result.data.images) {
        const imageUrls = result.data.images.map((img: any) => img.url)
        setGeneratedCarousel(prev => prev ? { ...prev, images: imageUrls } : null)
        
        // Mostrar informação sobre backgrounds gerados
        if (useAIBackgrounds && result.data.backgroundsGenerated) {
          console.log(`✅ ${result.data.backgroundsGenerated} backgrounds AI + ${result.data.imagesGenerated} imagens finais`)
        }
      } else {
        console.error('Erro ao gerar imagens:', result.error || 'Resposta inválida da API')
        console.log('Resposta completa da API:', result)
        alert(`Erro ao gerar imagens${useAIBackgrounds ? ' com backgrounds AI' : ''}. Verifique o console para mais detalhes.`)
      }
    } catch (error) {
      console.error('Erro na requisição:', error)
      alert('Erro na requisição. Tente novamente.')
    } finally {
      setIsGeneratingImages(false)
    }
  }

  const downloadSlide = (index: number) => {
    if (generatedCarousel?.images?.[index]) {
      const link = document.createElement('a')
      link.href = generatedCarousel.images[index]
      link.download = `slide-${index + 1}.png`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const downloadAll = () => {
    if (generatedCarousel?.images) {
      generatedCarousel.images.forEach((_, index) => {
        setTimeout(() => downloadSlide(index), index * 100)
      })
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {!generatedCarousel ? (
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-8 space-y-6">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-full text-sm font-medium">
                <Instagram className="h-4 w-4" />
                Instagram Carousel Generator
              </div>

              <div>
                <h1 className="text-3xl font-bold">
                  Crie Carrosséis Profissionais em <span className="text-purple-600">Minutos</span>
                </h1>
                <p className="text-gray-600 mt-2">
                  Transforme suas ideias em carrosséis incríveis para Instagram com nossa IA avançada
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Geração de Conteúdo por IA</p>
                  <p className="text-sm text-gray-600">
                    Descreva seu assunto e deixe a IA criar o conteúdo perfeito
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 block text-left">
                  Assunto do Carrossel
                </label>
                <Textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="dicas de marketing"
                  className="min-h-[80px] resize-none border-gray-300 focus:border-purple-600 focus:ring-purple-600"
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="ai-backgrounds"
                  checked={useAIBackgrounds}
                  onChange={(e) => setUseAIBackgrounds(e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="ai-backgrounds" className="text-sm font-medium text-gray-700 cursor-pointer">
                  🎨 Usar backgrounds gerados por IA (Runware.ai)
                </label>
              </div>

              <Button 
                onClick={generateCarousel}
                disabled={!topic.trim() || isGenerating}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Gerando conteúdo...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Gerar Conteúdo com IA
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : !showResults ? (
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                <span className="font-medium">Conteúdo Gerado ({generatedCarousel.slides.length} slides)</span>
              </div>
              <Button
                onClick={generateImages}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={isGeneratingImages}
              >
                {isGeneratingImages ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando imagens...
                  </>
                ) : (
                  <>
                    <Instagram className="h-4 w-4 mr-2" />
                    Gerar Imagens
                  </>
                )}
              </Button>
            </div>

            <div className="text-sm text-gray-600 mb-4">
              Revise o conteúdo e gere as imagens
            </div>

            <div className="space-y-3">
              {generatedCarousel.slides.map((slide) => (
                <div key={slide.id} className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => toggleSlideExpansion(slide.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-purple-600">{slide.slideNumber}</span>
                      <h3 className="font-semibold text-left">{slide.title}</h3>
                    </div>
                    {expandedSlides.includes(slide.id) ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                  
                  {expandedSlides.includes(slide.id) && (
                    <div className="px-4 pb-4">
                      <p className="text-gray-600 whitespace-pre-wrap">{slide.content}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-center">
              <button
                onClick={() => {
                  setGeneratedCarousel(null)
                  setTopic('')
                  setExpandedSlides([])
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                <MessageSquare className="h-4 w-4 inline mr-1" />
                Entre em contato conosco!
              </button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">Carrossel Pronto!</h3>
              <p className="text-gray-600">
                Suas imagens estão prontas para download
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowResults(false)
                  setTopic('')
                  setGeneratedCarousel(null)
                  setExpandedSlides([])
                }}
              >
                Novo Carrossel
              </Button>
              <Button onClick={downloadAll} className="bg-purple-600 hover:bg-purple-700">
                <Download className="h-4 w-4 mr-2" />
                Baixar Todas
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {generatedCarousel?.images?.map((imageUrl, index) => (
              <Card key={index} className="overflow-hidden group cursor-pointer">
                <div className="aspect-square relative">
                  <img 
                    src={imageUrl} 
                    alt={`Slide ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => downloadSlide(index)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Baixar
                    </Button>
                  </div>
                </div>
                <div className="p-2 text-center">
                  <p className="text-xs text-gray-500">Slide {index + 1}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
