interface MarkupGoImageOptions {
  properties?: {
    format?: 'png' | 'jpeg' | 'webp'
    quality?: number
    omitBackground?: boolean
    width?: number
    height?: number
    clip?: boolean
  }
  emulatedMediaType?: 'screen' | 'print'
  waitDelay?: string
  waitForExpression?: string
  extraHttpHeaders?: Record<string, string>
  failOnHttpStatusCodes?: number[]
  failOnConsoleExceptions?: boolean
  skipNetworkIdleEvent?: boolean
  optimizeForSpeed?: boolean
}

interface MarkupGoHtmlSource {
  type: 'html'
  data: string
}

interface MarkupGoRequest {
  source: MarkupGoHtmlSource
  options?: MarkupGoImageOptions
}

interface MarkupGoResponse {
  id: string
  url: string
  format: string
  size: number
  width: number
  height: number
  createdAt: string
  updatedAt: string
}

export class MarkupGoClient {
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = process.env.MARKUPGO_API_KEY!
    this.baseUrl = process.env.MARKUPGO_API_URL!
    
    if (!this.apiKey) {
      throw new Error('MARKUPGO_API_KEY não está configurada')
    }
  }

  async generateImage(htmlContent: string, options?: MarkupGoImageOptions): Promise<MarkupGoResponse> {
    const request: MarkupGoRequest = {
      source: {
        type: 'html',
        data: htmlContent
      },
      options: {
        properties: {
          format: 'png',
          quality: 95,
          width: 1080,
          height: 1080,
          omitBackground: false,
          ...options?.properties
        },
        ...options
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`MarkupGo API error: ${response.status} - ${error}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Erro ao gerar imagem:', error)
      throw error
    }
  }

  async generateCarousel(slides: string[]): Promise<MarkupGoResponse[]> {
    const results: MarkupGoResponse[] = []
    
    for (const slide of slides) {
      const result = await this.generateImage(slide)
      results.push(result)
    }
    
    return results
  }
}

export const markupgoClient = new MarkupGoClient()
