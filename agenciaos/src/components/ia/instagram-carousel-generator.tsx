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
  Loader2
} from 'lucide-react'

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
    try {
      const response = await fetch('/api/instagram/generate-carousel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateType: selectedTemplate,
          slides,
          brandConfig
        })
      })

      const result = await response.json()

      if (result.success) {
        setGeneratedImages(result.data.images)
      } else {
        console.error('Erro ao gerar carrossel:', result.error)
        alert('Erro ao gerar carrossel: ' + result.error)
      }
    } catch (error) {
      console.error('Erro na requisição:', error)
      alert('Erro na requisição. Tente novamente.')
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadAll = () => {
    generatedImages.forEach((image, index) => {
      downloadImage(image.url, `carousel-slide-${index + 1}.png`)
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Instagram className="h-6 w-6 text-pink-500" />
            Instagram Carousel Generator
          </h2>
          <p className="text-muted-foreground">
            Crie carrosséis profissionais para Instagram em minutos
          </p>
        </div>
        {generatedImages.length > 0 && (
          <Button onClick={downloadAll} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Baixar Todos
          </Button>
        )}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Configurações e Templates */}
        <div className="col-span-3">
          {/* Seletor de Template */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">Template</CardTitle>
              <CardDescription>
                Escolha um modelo para começar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTemplate && (
                <div className="mt-3">
                  <Badge variant="secondary" className="text-xs">
                    {templates.find(t => t.id === selectedTemplate)?.description}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Configurações de Marca */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Branding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="agencyName">Nome da Agência</Label>
                <Input
                  id="agencyName"
                  value={brandConfig.agencyName}
                  onChange={(e) => setBrandConfig({...brandConfig, agencyName: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="contactInfo">Contato</Label>
                <Input
                  id="contactInfo"
                  value={brandConfig.contactInfo}
                  onChange={(e) => setBrandConfig({...brandConfig, contactInfo: e.target.value})}
                  placeholder="@agencia.digital"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="primaryColor">Cor Principal</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={brandConfig.primaryColor}
                      onChange={(e) => setBrandConfig({...brandConfig, primaryColor: e.target.value})}
                      className="w-12 h-8 p-1"
                    />
                    <Input
                      value={brandConfig.primaryColor}
                      onChange={(e) => setBrandConfig({...brandConfig, primaryColor: e.target.value})}
                      className="flex-1 text-xs"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="secondaryColor">Cor Secundária</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={brandConfig.secondaryColor}
                      onChange={(e) => setBrandConfig({...brandConfig, secondaryColor: e.target.value})}
                      className="w-12 h-8 p-1"
                    />
                    <Input
                      value={brandConfig.secondaryColor}
                      onChange={(e) => setBrandConfig({...brandConfig, secondaryColor: e.target.value})}
                      className="flex-1 text-xs"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Editor de Slides */}
        <div className="col-span-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Editor de Slides</CardTitle>
                  <CardDescription>
                    {slides.length} slide{slides.length !== 1 ? 's' : ''} - Edite o conteúdo
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={addSlide} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Slide
                  </Button>
                  <Button 
                    onClick={generateCarousel} 
                    disabled={!selectedTemplate || slides.length === 0 || isGenerating}
                    size="sm"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4 mr-2" />
                    )}
                    {isGenerating ? 'Gerando...' : 'Gerar Carrossel'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={previewSlide.toString()} onValueChange={(value) => setPreviewSlide(parseInt(value))}>
                <TabsList className="grid w-full grid-cols-auto">
                  {slides.map((_, index) => (
                    <TabsTrigger key={index} value={index.toString()} className="flex-1">
                      Slide {index + 1}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {slides.map((slide, index) => (
                  <TabsContent key={index} value={index.toString()} className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Slide {index + 1}</h4>
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
                    
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor={`title-${index}`}>Título</Label>
                        <Input
                          id={`title-${index}`}
                          value={slide.title || ''}
                          onChange={(e) => handleSlideChange(index, 'title', e.target.value)}
                          placeholder="Título do slide"
                        />
                      </div>
                      
                      {index === 0 && (
                        <div>
                          <Label htmlFor={`subtitle-${index}`}>Subtítulo</Label>
                          <Input
                            id={`subtitle-${index}`}
                            value={slide.subtitle || ''}
                            onChange={(e) => handleSlideChange(index, 'subtitle', e.target.value)}
                            placeholder="Subtítulo ou descrição"
                          />
                        </div>
                      )}
                      
                      <div>
                        <Label htmlFor={`content-${index}`}>Conteúdo</Label>
                        <Textarea
                          id={`content-${index}`}
                          value={slide.content || ''}
                          onChange={(e) => handleSlideChange(index, 'content', e.target.value)}
                          placeholder="Conteúdo principal do slide"
                          rows={3}
                        />
                      </div>
                      
                      {index === slides.length - 1 && (
                        <div>
                          <Label htmlFor={`cta-${index}`}>Call to Action</Label>
                          <Input
                            id={`cta-${index}`}
                            value={slide.ctaText || ''}
                            onChange={(e) => handleSlideChange(index, 'ctaText', e.target.value)}
                            placeholder="Ex: Entre em contato"
                          />
                        </div>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Preview e Resultados */}
        <div className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview & Download
              </CardTitle>
              <CardDescription>
                Visualize e baixe as imagens geradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedImages.length > 0 ? (
                <div className="space-y-4">
                  {/* Preview Principal */}
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      src={generatedImages[previewSlide]?.url} 
                      alt={`Slide ${previewSlide + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Navegação de Slides */}
                  <div className="flex gap-2 overflow-x-auto">
                    {generatedImages.map((image, index) => (
                      <div key={image.id} className="flex-shrink-0">
                        <button
                          onClick={() => setPreviewSlide(index)}
                          className={`w-16 h-16 rounded border-2 overflow-hidden ${
                            previewSlide === index ? 'border-primary' : 'border-gray-200'
                          }`}
                        >
                          <img 
                            src={image.url} 
                            alt={`Slide ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {/* Download Individual */}
                  <div className="space-y-2">
                    <Button 
                      onClick={() => downloadImage(
                        generatedImages[previewSlide].url, 
                        `carousel-slide-${previewSlide + 1}.png`
                      )}
                      className="w-full"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar Slide {previewSlide + 1}
                    </Button>
                    
                    <div className="text-xs text-muted-foreground text-center">
                      {generatedImages[previewSlide]?.format.toUpperCase()} • 1080x1080 • {(generatedImages[previewSlide]?.size / 1024 / 1024).toFixed(1)}MB
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200">
                  <div className="text-center text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Preview aparecerá aqui</p>
                    <p className="text-xs">Selecione um template e gere o carrossel</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
