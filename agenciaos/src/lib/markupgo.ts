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
  private maxRetries: number = 3
  private retryDelay: number = 1000 // 1 segundo inicial

  constructor() {
    this.apiKey = process.env.MARKUPGO_API_KEY!
    this.baseUrl = process.env.MARKUPGO_API_URL!
    
    if (!this.apiKey) {
      throw new Error('MARKUPGO_API_KEY não está configurada')
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = this.maxRetries
  ): Promise<T> {
    let lastError: Error
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Tentativa ${attempt}/${maxRetries} - MarkupGo`)
        return await operation()
      } catch (error) {
        lastError = error as Error
        
        // Se não é erro temporário, não retry
        if (error instanceof Error && !this.isRetryableError(error)) {
          console.error(`❌ Erro não recuperável: ${error.message}`)
          throw error
        }
        
        if (attempt === maxRetries) {
          console.error(`❌ Todas as ${maxRetries} tentativas falharam`)
          break
        }
        
        // Backoff exponencial: 1s, 2s, 4s...
        const delayMs = this.retryDelay * Math.pow(2, attempt - 1)
        console.log(`⏳ Aguardando ${delayMs}ms antes da próxima tentativa...`)
        await this.delay(delayMs)
      }
    }
    
    throw lastError!
  }

  private isRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase()
    
    // Erros que justificam retry
    const retryablePatterns = [
      '503', // Service Unavailable
      '502', // Bad Gateway
      '504', // Gateway Timeout
      '500', // Internal Server Error (temporário)
      'timeout',
      'network',
      'connection',
      'econnreset',
      'enotfound'
    ]
    
    return retryablePatterns.some(pattern => message.includes(pattern))
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

    return await this.retryWithBackoff(async () => {
      try {
        const response = await fetch(`${this.baseUrl}/image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey
          },
          body: JSON.stringify(request),
          // Timeout de 30 segundos
          signal: AbortSignal.timeout(30000)
        })

        if (!response.ok) {
          const error = await response.text()
          const errorMessage = `MarkupGo API error: ${response.status} - ${error}`
          
          // Log detalhado do erro
          console.error('❌ MarkupGo Error Details:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            error: error
          })
          
          throw new Error(errorMessage)
        }

        const result = await response.json()
        console.log('✅ MarkupGo: Imagem gerada com sucesso')
        return result
        
      } catch (error) {
        if (error instanceof Error) {
          console.error(`❌ MarkupGo Request Failed: ${error.message}`)
          
          // Se é timeout, marcar como retry
          if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
            throw new Error('MarkupGo timeout - service unavailable')
          }
        }
        throw error
      }
    })
  }

  async generateCarousel(slides: string[]): Promise<MarkupGoResponse[]> {
    console.log(`🖼️ Gerando ${slides.length} imagens via MarkupGo...`)
    const results: MarkupGoResponse[] = []
    
    // Processar slides sequencialmente para evitar sobrecarga
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i]
      console.log(`📄 Processando slide ${i + 1}/${slides.length}`)
      
      try {
        const result = await this.generateImage(slide)
        results.push(result)
        
        // Delay entre slides para não sobrecarregar o serviço
        if (i < slides.length - 1) {
          await this.delay(500) // 500ms entre slides
        }
        
      } catch (error) {
        console.error(`❌ Falha no slide ${i + 1}:`, error)
        
        // Em caso de erro em um slide, continuar com os outros
        // mas registrar o erro
        results.push({
          id: `error-${i}`,
          url: '', // URL vazia indica erro
          format: 'png',
          size: 0,
          width: 1080,
          height: 1080,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      }
    }
    
    const successCount = results.filter(r => r.url !== '').length
    console.log(`✅ MarkupGo: ${successCount}/${slides.length} imagens geradas`)
    
    return results
  }

  // Método para verificar se o serviço está disponível
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey
        },
        signal: AbortSignal.timeout(5000) // 5s timeout
      })
      
      return response.ok
    } catch (error) {
      console.log('⚠️ MarkupGo health check falhou:', error)
      return false
    }
  }
}

export const markupgoClient = new MarkupGoClient()
