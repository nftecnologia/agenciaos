'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Instagram, Download, Loader2, Sparkles, Check } from 'lucide-react'

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
  const [generatedCarousel, setGeneratedCarousel] = useState<GeneratedCarousel | null>(null)
  const [showResults, setShowResults] = useState(false)

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

      const response = await fetch('/api/instagram/generate-carousel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateType: 'professional',
          slides,
          brandConfig: {
            primaryColor: '#667eea',
            secondaryColor: '#764ba2',
            fontFamily: 'Inter',
            contactInfo: '@agencia.digital',
            agencyName: 'Agência Digital'
          }
        })
      })

      const result = await response.json()

      if (result.success) {
        const imageUrls = result.data.images.map((img: any) => img.url)
        setGeneratedCarousel(prev => prev ? { ...prev, images: imageUrls } : null)
      } else {
        console.error('Erro ao gerar imagens:', result.error)
        alert('Erro ao gerar imagens. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro na requisição:', error)
      alert('Erro na requisição. Tente novamente.')
    } finally {
      setIsGeneratingImages(false)
    }
  }

  const downloadSlide = (index: number) => {
    console.log(`Baixando slide ${index + 1}`)
    // Implementar download real
  }

  const downloadAll = () => {
    console.log('Baixando todos os slides')
    // Implementar download de todos
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {!showResults ? (
        <Card className="border-0 shadow-none bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <CardContent className="p-8 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-full text-sm font-medium">
              <Instagram className="h-4 w-4" />
              Instagram Carousel Generator
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold">
                Crie Carrosséis Profissionais em <span className="text-purple-600">Minutos</span>
              </h2>
              <p className="text-muted-foreground">
                Transforme suas ideias em carrosséis incríveis para Instagram com nossa IA avançada
              </p>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
              <div className="text-left space-y-2">
                <div className="flex items-start gap-2">
                  <div className="mt-1">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Geração de Conteúdo por IA</p>
                    <p className="text-sm text-muted-foreground">
                      Descreva seu assunto e deixe a IA criar o conteúdo perfeito
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-left block">
                  Assunto do Carrossel
                </label>
                <Textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="dicas de marketing"
                  className="min-h-[100px] resize-none"
                />
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

            {generatedCarousel && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">Conteúdo Gerado ({generatedCarousel.slides.length} slides)</span>
                </div>
                
                <Button
                  onClick={generateImages}
                  variant="outline"
                  className="w-full max-w-md"
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
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">Carrossel Pronto!</h3>
              <p className="text-muted-foreground">
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
                }}
              >
                Novo Carrossel
              </Button>
              <Button onClick={downloadAll}>
                <Download className="h-4 w-4 mr-2" />
                Baixar Todas
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {generatedCarousel?.slides.map((slide, index) => (
              <Card key={slide.id} className="overflow-hidden group cursor-pointer">
                <div className="aspect-square relative bg-gradient-to-br from-purple-600 to-pink-600 p-6 text-white">
                  <div className="h-full flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-medium opacity-80">{slide.slideNumber}</p>
                      <h4 className="text-lg font-bold mt-2 mb-3">{slide.title}</h4>
                      <p className="text-sm opacity-90 line-clamp-6">{slide.content}</p>
                    </div>
                    <div className="text-xs opacity-80">
                      @agencia.digital
                    </div>
                  </div>
                  
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
                  <p className="text-xs text-muted-foreground">{slide.slideNumber}</p>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex justify-center pt-4">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
              <span>Passo 4 de 4</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
