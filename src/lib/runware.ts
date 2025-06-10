interface RunwareImageRequest {
  taskType: 'imageInference'
  taskUUID: string
  textPrompt: string
  modelId?: string
  numberResults?: number
  height?: number
  width?: number
  steps?: number
  CFGScale?: number
  seed?: number
}

interface RunwareResponse {
  taskType: string
  imageUUID: string
  imageURL: string
  taskUUID: string
}

export class RunwareClient {
  private apiKey: string
  private baseUrl: string = 'https://api.runware.ai/v1'

  constructor() {
    this.apiKey = process.env.RUNWARE_API_KEY!
    
    if (!this.apiKey) {
      throw new Error('RUNWARE_API_KEY não está configurada')
    }
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c == 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  async generateImage(prompt: string, options?: {
    modelId?: string
    width?: number
    height?: number
    steps?: number
  }): Promise<string> {
    const request: RunwareImageRequest = {
      taskType: 'imageInference',
      taskUUID: this.generateUUID(),
      textPrompt: prompt,
      modelId: options?.modelId || 'civitai:4384@130072', // Realistic Vision model
      numberResults: 1,
      height: options?.height || 1080,
      width: options?.width || 1080,
      steps: options?.steps || 25,
      CFGScale: 7,
      seed: Math.floor(Math.random() * 1000000)
    }

    console.log('🎨 Runware: Gerando imagem com prompt:', prompt)

    try {
      const response = await fetch(`${this.baseUrl}/image/inference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify([request])
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('❌ Runware API Error:', {
          status: response.status,
          error: error
        })
        throw new Error(`Runware API error: ${response.status} - ${error}`)
      }

      const results: RunwareResponse[] = await response.json()
      
      if (!results || results.length === 0) {
        throw new Error('Nenhuma imagem foi gerada')
      }

      const result = results[0]
      console.log('✅ Runware: Imagem gerada com sucesso:', result.imageUUID)
      
      return result.imageURL

    } catch (error) {
      console.error('❌ Runware Error:', error)
      throw error
    }
  }

  async generateCarouselBackgrounds(topic: string, slideCount: number): Promise<string[]> {
    console.log(`🖼️ Runware: Gerando ${slideCount} backgrounds para "${topic}"`)
    
    // Prompts otimizados para diferentes tipos de slides
    const basePrompts = [
      `Professional modern gradient background for Instagram post about ${topic}, minimalist design, clean, corporate style, 4k`,
      `Abstract geometric background pattern for social media about ${topic}, professional colors, gradient, modern design`,
      `Clean minimal background for Instagram carousel about ${topic}, subtle textures, professional gradient`,
      `Modern business background for social media post about ${topic}, abstract shapes, professional color scheme`,
      `Premium minimal background design for Instagram about ${topic}, clean gradients, professional look`
    ]

    const results: string[] = []

    try {
      // Gerar imagens sequencialmente para evitar rate limit
      for (let i = 0; i < slideCount; i++) {
        const promptIndex = i % basePrompts.length
        const prompt = basePrompts[promptIndex]
        
        try {
          const imageUrl = await this.generateImage(prompt)
          results.push(imageUrl)
          
          // Delay entre requests
          if (i < slideCount - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
          
        } catch (error) {
          console.error(`❌ Falha no background ${i + 1}:`, error)
          // Continuar sem background para este slide
          results.push('')
        }
      }

      const successCount = results.filter(url => url !== '').length
      console.log(`✅ Runware: ${successCount}/${slideCount} backgrounds gerados`)
      
      return results

    } catch (error) {
      console.error('❌ Erro ao gerar backgrounds:', error)
      // Retornar array vazio para usar backgrounds padrão
      return new Array(slideCount).fill('')
    }
  }

  // Método para verificar se o serviço está disponível
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      })
      
      return response.ok
    } catch (error) {
      console.log('⚠️ Runware health check falhou:', error)
      return false
    }
  }
}

export const runwareClient = new RunwareClient()
