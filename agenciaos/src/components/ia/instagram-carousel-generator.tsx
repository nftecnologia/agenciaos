'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Instagram, 
  Download, 
  Wand2, 
  Sparkles,
  Brain,
  Loader2,
  Eye,
  CheckCircle
} from 'lucide-react'

interface SlideContent {
  title?: string
  subtitle?: string
  content?: string
  ctaText?: string
}

interface GeneratedImage {
  slideNumber: number
  url: string
}

export function InstagramCarouselGenerator() {
  const [topic, setTopic] = useState('')
  const [audience, setAudience] = useState('')
  const [tone, setTone] = useState('profissional')
  const [slides, setSlides] = useState<SlideContent[]>([])
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingImages, setIsGeneratingImages] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  const generateContent = async () => {
    if (!topic.trim()) {
      alert('Por favor, descreva o assunto do seu carrossel')
      return
    }
    
    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/instagram/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          audience,
          tone,
          template: 'educativo'
        })
      })

      const result = await response.json()

      if (result.success) {
        setSlides(result.data.slides)
        setCurrentStep(2)
      } else {
        alert('Erro ao gerar conteúdo: ' + result.error)
      }
    } catch (error) {
      console.error('Erro na requisição:', error)
      alert('Erro na requisição. Tente novamente.')
    } finally {
      setIsGenerating(false)
    }
  }

  const generateImages = async () => {
    if (slides.length === 0) return
    
    setIsGeneratingImages(true)
    setCurrentStep(3)
    
    try {
      const response = await fetch('/api/instagram/generate-carousel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateType: 'business-tips',
          slides,
          brandConfig: {
            primaryColor: '#667eea',
            secondaryColor: '#764ba2',
            fontFamily: 'Inter',
            contactInfo: '@agencia.digital',
            agencyName: 'Agência Digital'
          },
          topic
        })
      })

      const result = await response.json()

      if (result.success) {
        setGeneratedImages(result.data.images)
        setCurrentStep(4)
      } else {
        alert('Erro ao gerar imagens: ' + result.error)
        setCurrentStep(2)
      }
    } catch (error) {
      console.error('Erro na requisição:', error)
      alert('Erro na requisição. Tente novamente.')
      setCurrentStep(2)
    } finally {
      setIsGeneratingImages(false)
    }
  }

  const downloadImage = (url: string, index: number) => {
    const link = document.createElement('a')
    link.href = url
    link.download = `carousel-slide-${index + 1}.png`
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadAll = () => {
    generatedImages.forEach((image, index) => {
      setTimeout(() => {
        downloadImage(image.url, index)
      }, index * 500) // Delay entre downloads
    })
  }

  const resetGenerator = () => {
    setTopic('')
    setAudience('')
    setTone('profissional')
    setSlides([])
    setGeneratedImages([])
    setCurrentStep(1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full text-lg font-semibold shadow-lg">
            <Instagram className="h-6 w-6" />
            <span>Instagram Carousel Generator</span>
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            Crie Carrosséis Profissionais em
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent"> Minutos</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transforme suas ideias em carrosséis incríveis para Instagram com nossa IA avançada
          </p>
        </div>

        {/* Content Generator */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              Geração de Conteúdo por IA
            </CardTitle>
            <CardDescription>
              Descreva seu assunto e deixe a IA criar o conteúdo perfeito
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="topic" className="text-sm font-medium">Assunto do Carrossel</Label>
              <Textarea
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ex: 5 estratégias de marketing digital para pequenas empresas, dicas de vendas no Instagram, como aumentar seguidores..."
                rows={4}
                className="text-base resize-none"
              />
            </div>
            
            <Button 
              onClick={generateContent}
              disabled={!topic.trim() || isGenerating}
              className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              size="lg"
            >
              {isGenerating ? (
                <Wand2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Brain className="h-5 w-5 mr-2" />
              )}
              {isGenerating ? 'Gerando Conteúdo...' : 'Gerar Conteúdo com IA'}
            </Button>
            
            {isGenerating && (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 text-purple-700">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  <span className="text-sm font-medium">Nossa IA está criando conteúdo personalizado para você...</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Slides Gerados */}
        {slides.length > 0 && (
          <Card className="w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Conteúdo Gerado ({slides.length} slides)
                  </CardTitle>
                  <CardDescription>
                    Revise o conteúdo e gere as imagens
                  </CardDescription>
                </div>
                <Button 
                  onClick={generateImages}
                  disabled={isGeneratingImages}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                >
                  {isGeneratingImages ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4 mr-2" />
                  )}
                  {isGeneratingImages ? 'Gerando Imagens...' : 'Gerar Imagens'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {slides.map((slide, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        Slide {index + 1}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{slide.title}</h3>
                      {slide.subtitle && (
                        <p className="text-gray-600 font-medium">{slide.subtitle}</p>
                      )}
                      <p className="text-gray-700">{slide.content}</p>
                      {slide.ctaText && (
                        <p className="text-blue-600 font-medium">📢 {slide.ctaText}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {isGeneratingImages && (
                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 text-green-700">
                    <Sparkles className="h-4 w-4 animate-pulse" />
                    <span className="text-sm font-medium">Gerando imagens profissionais para cada slide...</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Imagens Geradas */}
        {generatedImages.length > 0 && (
          <Card className="w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5 text-purple-500" />
                    Carrossel Pronto! ({generatedImages.length} imagens)
                  </CardTitle>
                  <CardDescription>
                    Suas imagens estão prontas para download
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={downloadAll} className="bg-gradient-to-r from-purple-500 to-pink-500">
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Todas
                  </Button>
                  <Button onClick={resetGenerator} variant="outline">
                    Novo Carrossel
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {generatedImages.map((image, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                      <img 
                        src={image.url} 
                        alt={`Slide ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement
                          const sibling = target.nextElementSibling as HTMLElement
                          target.style.display = 'none'
                          if (sibling) sibling.style.display = 'flex'
                        }}
                      />
                      <div className="hidden w-full h-full bg-gray-200 items-center justify-center">
                        <Eye className="h-8 w-8 text-gray-400" />
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium">Slide {index + 1}</p>
                      <p className="text-xs text-gray-500 mb-2">{slides[index]?.title}</p>
                      <Button 
                        onClick={() => downloadImage(image.url, index)}
                        size="sm" 
                        className="w-full"
                        variant="outline"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Baixar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Indicators */}
        {currentStep > 1 && (
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progresso</span>
              <span className="text-sm text-gray-500">Passo {currentStep} de 4</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span className={currentStep >= 1 ? 'text-purple-600 font-medium' : ''}>Tema</span>
              <span className={currentStep >= 2 ? 'text-purple-600 font-medium' : ''}>Conteúdo</span>
              <span className={currentStep >= 3 ? 'text-purple-600 font-medium' : ''}>Imagens</span>
              <span className={currentStep >= 4 ? 'text-purple-600 font-medium' : ''}>Download</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
