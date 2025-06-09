'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Instagram, 
  Download, 
  Eye, 
  Wand2, 
  Plus, 
  Trash2, 
  Palette,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  ArrowRight,
  Zap,
  CheckCircle,
  Star,
  Play,
  Edit,
  Brain,
  RefreshCw
} from 'lucide-react'

// Componente para geração de conteúdo por IA
function AIContentGenerator({ onContentGenerated, template }: {
  onContentGenerated: (slides: SlideContent[], topic?: string) => void
  template: string
}) {
  const [topic, setTopic] = useState('')
  const [audience, setAudience] = useState('')
  const [tone, setTone] = useState('profissional')
  const [isGenerating, setIsGenerating] = useState(false)

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
          template
        })
      })

      const result = await response.json()

      if (result.success) {
        onContentGenerated(result.data.slides, topic)
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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="topic" className="text-sm font-medium">Assunto do Carrossel</Label>
          <Textarea
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ex: 5 estratégias de marketing digital para pequenas empresas, dicas de vendas no Instagram, como aumentar seguidores..."
            rows={3}
            className="text-base resize-none"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="audience" className="text-sm font-medium">Público-Alvo (Opcional)</Label>
            <Input
              id="audience"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="Ex: Empreendedores, Pequenas empresas..."
              className="h-12 text-base"
            />
          </div>
          
          <div>
            <Label htmlFor="tone" className="text-sm font-medium">Tom de Voz</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="profissional">🎯 Profissional</SelectItem>
                <SelectItem value="casual">😊 Casual</SelectItem>
                <SelectItem value="inspirador">✨ Inspirador</SelectItem>
                <SelectItem value="educativo">📚 Educativo</SelectItem>
                <SelectItem value="vendas">💰 Focado em Vendas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <Button 
        onClick={generateContent}
        disabled={!topic.trim() || isGenerating}
        className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        size="lg"
      >
        {isGenerating ? (
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
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
    </div>
  )
}

interface SlideContent {
  title?: string
  subtitle?: string
  content?: string
  ctaText?: string
}

interface BrandConfig {
  primaryColor: string
  secondaryColor: string
  logoUrl?: string
  fontFamily: string
  contactInfo: string
  agencyName: string
  useAIBackgrounds?: boolean
  backgroundStyle?: 'professional' | 'modern' | 'colorful' | 'minimalist'
}

interface GeneratedImage {
  slideNumber: number
  id: string
  url: string
  format: string
  size: number
  width: number
  height: number
  createdAt: string
}

interface Template {
  id: string
  name: string
  description: string
  slides: SlideContent[]
}

export function InstagramCarouselGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [templates, setTemplates] = useState<Template[]>([])
  const [slides, setSlides] = useState<SlideContent[]>([])
  const [brandConfig, setBrandConfig] = useState<BrandConfig>({
    primaryColor: '#667eea',
    secondaryColor: '#764ba2',
    fontFamily: 'Inter',
    contactInfo: '@agencia.digital',
    agencyName: 'Agência Digital'
  })
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewSlide, setPreviewSlide] = useState(0)
  const [currentStep, setCurrentStep] = useState(1)
  const [carouselTopic, setCarouselTopic] = useState<string>('') // Para DALL-E

  // Carregar templates disponíveis
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/instagram/generate-carousel')
        const data = await response.json()
        setTemplates(data.templates)
      } catch (error) {
        console.error('Erro ao carregar templates:', error)
      }
    }
    fetchTemplates()
  }, [])

  // Carregar slides do template selecionado
  useEffect(() => {
    if (selectedTemplate) {
      const template = templates.find(t => t.id === selectedTemplate)
      if (template) {
        setSlides(template.slides)
        setGeneratedImages([])
        setCurrentStep(2)
      }
    }
  }, [selectedTemplate, templates])

  const handleSlideChange = (index: number, field: keyof SlideContent, value: string) => {
    const newSlides = [...slides]
    newSlides[index] = { ...newSlides[index], [field]: value }
    setSlides(newSlides)
  }

  const addSlide = () => {
    setSlides([...slides, { title: '', content: '' }])
  }

  const removeSlide = (index: number) => {
    if (slides.length > 1) {
      const newSlides = slides.filter((_, i) => i !== index)
      setSlides(newSlides)
      if (previewSlide >= newSlides.length) {
        setPreviewSlide(Math.max(0, newSlides.length - 1))
      }
    }
  }

  const generateCarousel = async () => {
    if (!selectedTemplate || slides.length === 0) return

    setIsGenerating(true)
    setCurrentStep(4)
    
    try {
      const response = await fetch('/api/instagram/generate-carousel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateType: selectedTemplate,
          slides,
          brandConfig,
          topic: carouselTopic // Tópico para DALL-E gerar backgrounds contextuais
        })
      })

      const result = await response.json()

      if (result.success) {
        setGeneratedImages(result.data.images)
        setCurrentStep(5)
      } else {
        console.error('Erro ao gerar carrossel:', result.error)
        alert('Erro ao gerar carrossel: ' + result.error)
        setCurrentStep(3)
      }
    } catch (error) {
      console.error('Erro na requisição:', error)
      alert('Erro na requisição. Tente novamente.')
      setCurrentStep(3)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadImage = async (url: string, filename: string) => {
    try {
      // Fetch da imagem e criar blob para download local
      const response = await fetch(url)
      if (!response.ok) throw new Error('Falha ao baixar imagem')
      
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Limpar URL object
      URL.revokeObjectURL(objectUrl)
    } catch (error) {
      console.error('Erro ao baixar imagem:', error)
      alert('Erro ao baixar a imagem. Tente clicar com o botão direito e "Salvar imagem como..."')
    }
  }

  const downloadAll = async () => {
    for (let i = 0; i < generatedImages.length; i++) {
      const image = generatedImages[i]
      await downloadImage(image.url, `carousel-slide-${i + 1}.png`)
      // Pequena pausa entre downloads para evitar sobrecarregar o browser
      if (i < generatedImages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
  }

  const resetGenerator = () => {
    setSelectedTemplate('')
    setSlides([])
    setGeneratedImages([])
    setCurrentStep(1)
    setPreviewSlide(0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Hero */}
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

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-8">
            {[
              { step: 1, title: 'Template', icon: Eye },
              { step: 2, title: 'Conteúdo', icon: Edit },
              { step: 3, title: 'Personalização', icon: Palette },
              { step: 4, title: 'Geração', icon: Wand2 },
              { step: 5, title: 'Download', icon: Download }
            ].map(({ step, title, icon: Icon }, index) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                  ${currentStep >= step 
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-400'
                  }
                `}>
                  {currentStep > step ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <div className="ml-3">
                  <div className={`text-sm font-medium ${currentStep >= step ? 'text-gray-900' : 'text-gray-400'}`}>
                    Passo {step}
                  </div>
                  <div className={`text-xs ${currentStep >= step ? 'text-gray-600' : 'text-gray-400'}`}>
                    {title}
                  </div>
                </div>
                {index < 4 && (
                  <ArrowRight className={`h-4 w-4 mx-6 ${currentStep > step ? 'text-purple-500' : 'text-gray-300'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Content Area */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Side - Configuration */}
            <div className="space-y-6">
              {/* Step 1: Template Selection */}
              <Card className={`border-2 transition-all ${currentStep === 1 ? 'border-purple-500 shadow-lg' : 'border-gray-200'}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-purple-500" />
                    Escolha um Template
                  </CardTitle>
                  <CardDescription>
                    Selecione um modelo profissional para começar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="✨ Selecione um template incrível" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id} className="py-3">
                          <div className="flex items-center gap-3">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <div>
                              <div className="font-medium">{template.name}</div>
                              <div className="text-xs text-gray-500">{template.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {selectedTemplate && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-medium text-green-700">Template selecionado!</span>
                      </div>
                      <p className="text-sm text-green-600 mt-1">
                        {templates.find(t => t.id === selectedTemplate)?.description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Step 2: AI Content Generation */}
              {selectedTemplate && (
                <Card className={`border-2 transition-all ${currentStep === 2 ? 'border-purple-500 shadow-lg' : 'border-gray-200'}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      Geração de Conteúdo por IA
                    </CardTitle>
                    <CardDescription>
                      Descreva seu assunto e deixe a IA criar o conteúdo perfeito
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <AIContentGenerator 
                      onContentGenerated={(generatedSlides, topic) => {
                        setSlides(generatedSlides)
                        setCarouselTopic(topic || '')
                        setCurrentStep(3)
                      }}
                      template={selectedTemplate}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Step 2b: Manual Content Editor */}
              {selectedTemplate && slides.length > 0 && (
                <Card className={`border-2 transition-all ${currentStep >= 2 ? 'border-gray-200' : 'border-gray-200'}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Edit className="h-5 w-5 text-purple-500" />
                          Editor de Conteúdo (Opcional)
                        </CardTitle>
                        <CardDescription>
                          {slides.length} slide{slides.length !== 1 ? 's' : ''} configurados - Edite se necessário
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={addSlide} size="sm" variant="outline">
                          <Plus className="h-4 w-4 mr-1" />
                          Adicionar
                        </Button>
                        <Button onClick={() => setCurrentStep(3)} size="sm">
                          Próximo
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={previewSlide.toString()} onValueChange={(value) => setPreviewSlide(parseInt(value))}>
                      <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${slides.length}, 1fr)` }}>
                        {slides.map((_, index) => (
                          <TabsTrigger key={index} value={index.toString()}>
                            Slide {index + 1}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      
                      {slides.map((slide, index) => (
                        <TabsContent key={index} value={index.toString()} className="space-y-4 mt-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-lg">Slide {index + 1}</h4>
                            {slides.length > 1 && (
                              <Button 
                                onClick={() => removeSlide(index)} 
                                size="sm" 
                                variant="ghost"
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                              <div>
                                <Label htmlFor={`title-${index}`} className="text-sm font-medium">Título Principal</Label>
                                <Input
                                  id={`title-${index}`}
                                  value={slide.title || ''}
                                  onChange={(e) => handleSlideChange(index, 'title', e.target.value)}
                                  placeholder="Ex: 5 Dicas de Marketing Digital"
                                  className="h-12 text-base"
                                />
                              </div>
                              
                              {index === 0 && (
                                <div>
                                  <Label htmlFor={`subtitle-${index}`} className="text-sm font-medium">Subtítulo</Label>
                                  <Input
                                    id={`subtitle-${index}`}
                                    value={slide.subtitle || ''}
                                    onChange={(e) => handleSlideChange(index, 'subtitle', e.target.value)}
                                    placeholder="Ex: Para impulsionar seu negócio"
                                    className="h-12 text-base"
                                  />
                                </div>
                              )}
                              
                              <div>
                                <Label htmlFor={`content-${index}`} className="text-sm font-medium">Conteúdo</Label>
                                <Textarea
                                  id={`content-${index}`}
                                  value={slide.content || ''}
                                  onChange={(e) => handleSlideChange(index, 'content', e.target.value)}
                                  placeholder="Descreva o conteúdo principal deste slide..."
                                  rows={4}
                                  className="text-base resize-none"
                                />
                              </div>
                              
                              {index === slides.length - 1 && (
                                <div>
                                  <Label htmlFor={`cta-${index}`} className="text-sm font-medium">Call to Action</Label>
                                  <Input
                                    id={`cta-${index}`}
                                    value={slide.ctaText || ''}
                                    onChange={(e) => handleSlideChange(index, 'ctaText', e.target.value)}
                                    placeholder="Ex: Entre em contato conosco!"
                                    className="h-12 text-base"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Brand Customization */}
              {currentStep >= 3 && (
                <Card className={`border-2 transition-all ${currentStep === 3 ? 'border-purple-500 shadow-lg' : 'border-gray-200'}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Palette className="h-5 w-5 text-purple-500" />
                          Personalização da Marca
                        </CardTitle>
                        <CardDescription>
                          Configure as cores e informações da sua marca
                        </CardDescription>
                      </div>
                      <Button 
                        onClick={generateCarousel}
                        disabled={!selectedTemplate || slides.length === 0 || isGenerating}
                        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                      >
                        {isGenerating ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Zap className="h-4 w-4 mr-2" />
                        )}
                        {isGenerating ? 'Gerando...' : 'Gerar Carrossel'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="agencyName" className="text-sm font-medium">Nome da Agência</Label>
                        <Input
                          id="agencyName"
                          value={brandConfig.agencyName}
                          onChange={(e) => setBrandConfig({...brandConfig, agencyName: e.target.value})}
                          className="h-12 text-base"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="contactInfo" className="text-sm font-medium">Contato/Instagram</Label>
                        <Input
                          id="contactInfo"
                          value={brandConfig.contactInfo}
                          onChange={(e) => setBrandConfig({...brandConfig, contactInfo: e.target.value})}
                          placeholder="@agencia.digital"
                          className="h-12 text-base"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="primaryColor" className="text-sm font-medium">Cor Principal</Label>
                        <div className="flex gap-3 mt-1">
                          <Input
                            id="primaryColor"
                            type="color"
                            value={brandConfig.primaryColor}
                            onChange={(e) => setBrandConfig({...brandConfig, primaryColor: e.target.value})}
                            className="w-16 h-12 p-1 cursor-pointer"
                          />
                          <Input
                            value={brandConfig.primaryColor}
                            onChange={(e) => setBrandConfig({...brandConfig, primaryColor: e.target.value})}
                            className="flex-1 h-12 font-mono"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="secondaryColor" className="text-sm font-medium">Cor Secundária</Label>
                        <div className="flex gap-3 mt-1">
                          <Input
                            id="secondaryColor"
                            type="color"
                            value={brandConfig.secondaryColor}
                            onChange={(e) => setBrandConfig({...brandConfig, secondaryColor: e.target.value})}
                            className="w-16 h-12 p-1 cursor-pointer"
                          />
                          <Input
                            value={brandConfig.secondaryColor}
                            onChange={(e) => setBrandConfig({...brandConfig, secondaryColor: e.target.value})}
                            className="flex-1 h-12 font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Runware AI Background Generation */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
                      <div className="flex items-center gap-3 mb-4">
                        <ImageIcon className="h-5 w-5 text-cyan-600" />
                        <h3 className="font-semibold text-gray-900">🎨 Backgrounds com IA (Runware AI)</h3>
                        <Badge variant="secondary" className="bg-cyan-100 text-cyan-700">NOVO!</Badge>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="useAIBackgrounds"
                            checked={brandConfig.useAIBackgrounds || false}
                            onChange={(e) => setBrandConfig({
                              ...brandConfig, 
                              useAIBackgrounds: e.target.checked,
                              backgroundStyle: brandConfig.backgroundStyle || 'professional'
                            })}
                            className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                          />
                          <Label htmlFor="useAIBackgrounds" className="text-sm font-medium cursor-pointer">
                            Gerar backgrounds contextuais com Runware AI
                          </Label>
                        </div>
                        
                        {brandConfig.useAIBackgrounds && (
                          <div className="space-y-3 pl-7">
                            <div>
                              <Label htmlFor="backgroundStyle" className="text-sm font-medium">Estilo dos Backgrounds</Label>
                              <Select 
                                value={brandConfig.backgroundStyle || 'professional'} 
                                onValueChange={(value: any) => setBrandConfig({
                                  ...brandConfig, 
                                  backgroundStyle: value
                                })}
                              >
                                <SelectTrigger className="h-10 text-sm mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="professional">💼 Corporativo (sutil e elegante)</SelectItem>
                                  <SelectItem value="minimalist">⚪ Limpo (fundo bem claro)</SelectItem>
                                  <SelectItem value="modern">🎨 Criativo (formas suaves)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="text-xs text-gray-600 bg-white p-3 rounded border">
                              <strong>💡 Dica:</strong> A IA criará backgrounds únicos e contextuais para cada slide, 
                              baseados no conteúdo e estilo escolhido. Isso tornará seu carrossel mais atrativo e profissional!
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Generate Button - Mais visível */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <Button 
                        onClick={generateCarousel}
                        disabled={!selectedTemplate || slides.length === 0 || isGenerating}
                        className="w-full h-14 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-lg font-semibold"
                        size="lg"
                      >
                        {isGenerating ? (
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        ) : (
                          <Zap className="h-5 w-5 mr-2" />
                        )}
                        {isGenerating ? 'Gerando Carrossel...' : '🚀 Gerar Carrossel Agora'}
                      </Button>
                      
                      {brandConfig.useAIBackgrounds && (
                        <p className="text-xs text-center text-gray-500 mt-2">
                          ✨ Backgrounds contextuais serão gerados automaticamente
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Side - Preview & Results */}
            <div className="space-y-6">
              <Card className="border-2 border-gray-200 h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-purple-500" />
                    Preview & Download
                  </CardTitle>
                  <CardDescription>
                    {generatedImages.length > 0 
                      ? `${generatedImages.length} slides gerados com sucesso!`
                      : 'Visualize seu carrossel aqui'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {generatedImages.length > 0 ? (
                    <div className="space-y-6">
                      {/* Preview Principal */}
                      <div className="relative">
                        <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-lg">
                          <img 
                            src={generatedImages[previewSlide]?.url} 
                            alt={`Slide ${previewSlide + 1}`}
                            className="w-full h-full object-cover transition-transform hover:scale-105"
                          />
                        </div>
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                          {previewSlide + 1}/{generatedImages.length}
                        </div>
                      </div>
                      
                      {/* Navegação de Slides */}
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {generatedImages.map((image, index) => (
                          <button
                            key={image.id}
                            onClick={() => setPreviewSlide(index)}
                            className={`flex-shrink-0 w-20 h-20 rounded-lg border-3 overflow-hidden transition-all hover:scale-105 ${
                              previewSlide === index 
                                ? 'border-purple-500 shadow-lg ring-2 ring-purple-300' 
                                : 'border-gray-200 hover:border-purple-300'
                            }`}
                          >
                            <img 
                              src={image.url} 
                              alt={`Slide ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="space-y-3">
                        <Button 
                          onClick={() => downloadImage(
                            generatedImages[previewSlide].url, 
                            `carousel-slide-${previewSlide + 1}.png`
                          )}
                          className="w-full h-12 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                          size="lg"
                        >
                          <Download className="h-5 w-5 mr-2" />
                          Baixar Slide {previewSlide + 1}
                        </Button>
                        
                        <Button 
                          onClick={downloadAll}
                          variant="outline"
                          className="w-full h-12 border-2"
                          size="lg"
                        >
                          <Download className="h-5 w-5 mr-2" />
                          Baixar Todos os Slides
                        </Button>
                        
                        <Button 
                          onClick={resetGenerator}
                          variant="ghost"
                          className="w-full h-12 text-gray-600 hover:text-gray-900"
                        >
                          <Plus className="h-5 w-5 mr-2" />
                          Criar Novo Carrossel
                        </Button>
                      </div>
                      
                      {/* File Info */}
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="text-sm text-gray-600">
                          <div className="font-medium">Informações do Arquivo</div>
                          <div className="mt-1 space-y-1">
                            <div>{generatedImages[previewSlide]?.format.toUpperCase()} • 1080x1080px</div>
                            <div>{(generatedImages[previewSlide]?.size / 1024 / 1024).toFixed(1)}MB • Pronto para Instagram</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Empty State */}
                      <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                        <div className="text-center text-gray-500">
                          <div className="relative">
                            <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            {isGenerating && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                              </div>
                            )}
                          </div>
                          <p className="text-lg font-medium mb-2">
                            {isGenerating ? 'Gerando seu carrossel...' : 'Preview aparecerá aqui'}
                          </p>
                          <p className="text-sm">
                            {isGenerating 
                              ? 'Aguarde enquanto criamos suas imagens'
                              : 'Configure seu template e conteúdo para visualizar'
                            }
                          </p>
                        </div>
                      </div>
                      
                      {/* Getting Started Guide */}
                      {!isGenerating && (
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Play className="h-5 w-5 text-blue-500" />
                            Como começar:
                          </h3>
                          <div className="space-y-2 text-sm text-gray-700">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span>Escolha um template profissional</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <span>Adicione seu conteúdo exclusivo</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                              <span>Personalize cores e marca</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>Gere e baixe suas imagens</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
