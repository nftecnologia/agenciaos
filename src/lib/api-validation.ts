import { NextRequest, NextResponse } from 'next/server'
import { z, ZodError } from 'zod'
import { AppError, getSafeErrorMessage, getErrorInfo } from '@/lib/errors'

// Tipo para resposta de erro padronizada
export interface ApiError {
  error: string
  details?: Array<{
    field: string
    message: string
  }>
}

// Função para validar body da requisição
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const body = await request.json()
    const validatedData = schema.parse(body)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
      
      return {
        success: false,
        response: NextResponse.json(
          {
            error: 'Dados de entrada inválidos',
            details
          } as ApiError,
          { status: 400 }
        )
      }
    }
    
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Erro ao processar dados da requisição' } as ApiError,
        { status: 400 }
      )
    }
  }
}

// Função para validar query parameters
export function validateQueryParams<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; response: NextResponse } {
  try {
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())
    const validatedData = schema.parse(params)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
      
      return {
        success: false,
        response: NextResponse.json(
          {
            error: 'Parâmetros de consulta inválidos',
            details
          } as ApiError,
          { status: 400 }
        )
      }
    }
    
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Erro ao processar parâmetros da requisição' } as ApiError,
        { status: 400 }
      )
    }
  }
}

// Função para validar parâmetros de rota
export function validateRouteParams<T>(
  params: Record<string, string | string[]>,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; response: NextResponse } {
  try {
    const validatedData = schema.parse(params)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
      
      return {
        success: false,
        response: NextResponse.json(
          {
            error: 'Parâmetros de rota inválidos',
            details
          } as ApiError,
          { status: 400 }
        )
      }
    }
    
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Erro ao processar parâmetros da rota' } as ApiError,
        { status: 400 }
      )
    }
  }
}

// Função helper para criar resposta de sucesso padronizada
export function createSuccessResponse<T>(
  data: T,
  status: number = 200,
  message?: string
): NextResponse {
  const response: { data: T; message?: string } = { data }
  if (message) {
    response.message = message
  }
  
  return NextResponse.json(response, { status })
}

// Função helper para criar resposta de erro padronizada
export function createErrorResponse(
  error: string,
  status: number = 500,
  details?: Array<{ field: string; message: string }>
): NextResponse {
  const response: ApiError = { error }
  if (details) {
    response.details = details
  }
  
  return NextResponse.json(response, { status })
}

// Wrapper para handlers de API com validação automática
export function withValidation<TBody = unknown, TQuery = unknown, TParams = unknown>(
  handler: (
    request: NextRequest,
    context: {
      body?: TBody
      query?: TQuery
      params?: TParams
    }
  ) => Promise<NextResponse>,
  options?: {
    bodySchema?: z.ZodSchema<TBody>
    querySchema?: z.ZodSchema<TQuery>
    paramsSchema?: z.ZodSchema<TParams>
  }
) {
  return async (
    request: NextRequest,
    context: { params?: Record<string, string | string[]> } = {}
  ): Promise<NextResponse> => {
    try {
      const validationContext: {
        body?: TBody
        query?: TQuery
        params?: TParams
      } = {}

      // Validar body se schema fornecido e método permite body
      if (options?.bodySchema && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        const bodyValidation = await validateRequestBody(request, options.bodySchema)
        if (!bodyValidation.success) {
          return bodyValidation.response
        }
        validationContext.body = bodyValidation.data
      }

      // Validar query parameters se schema fornecido
      if (options?.querySchema) {
        const queryValidation = validateQueryParams(request, options.querySchema)
        if (!queryValidation.success) {
          return queryValidation.response
        }
        validationContext.query = queryValidation.data
      }

      // Validar parâmetros de rota se schema fornecido
      if (options?.paramsSchema && context.params) {
        const paramsValidation = validateRouteParams(context.params, options.paramsSchema)
        if (!paramsValidation.success) {
          return paramsValidation.response
        }
        validationContext.params = paramsValidation.data
      }

      return await handler(request, validationContext)
    } catch (error) {
      console.error('Erro no handler da API:', error)
      
      // Usar tratamento de erro padronizado
      if (error instanceof AppError) {
        const errorInfo = getErrorInfo(error)
        return createErrorResponse(
          getSafeErrorMessage(error),
          errorInfo.statusCode
        )
      }
      
      return createErrorResponse('Erro interno do servidor', 500)
    }
  }
}
