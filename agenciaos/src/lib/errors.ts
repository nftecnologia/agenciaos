// Classe base para erros da aplicação
export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly isOperational: boolean

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true
  ) {
    super(message)
    
    this.statusCode = statusCode
    this.code = code
    this.isOperational = isOperational
    
    // Manter o stack trace correto
    Error.captureStackTrace(this, this.constructor)
  }
}

// Erros específicos da aplicação
export class ValidationError extends AppError {
  constructor(message: string = 'Dados de entrada inválidos') {
    super(message, 400, 'VALIDATION_ERROR')
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Acesso negado: usuário não autenticado') {
    super(message, 401, 'AUTHENTICATION_ERROR')
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Acesso negado: permissões insuficientes') {
    super(message, 403, 'AUTHORIZATION_ERROR')
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Recurso não encontrado') {
    super(message, 404, 'NOT_FOUND_ERROR')
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflito: recurso já existe') {
    super(message, 409, 'CONFLICT_ERROR')
  }
}

export class TenantError extends AppError {
  constructor(message: string = 'Erro relacionado ao tenant') {
    super(message, 403, 'TENANT_ERROR')
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Erro interno do banco de dados') {
    super(message, 500, 'DATABASE_ERROR')
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string = 'Erro em serviço externo') {
    super(message, 502, 'EXTERNAL_SERVICE_ERROR')
  }
}

// Factory de erros comuns
export const appErrors = {
  // Autenticação e autorização
  UNAUTHENTICATED: new AuthenticationError(),
  UNAUTHORIZED: new AuthorizationError(),
  INVALID_CREDENTIALS: new AuthenticationError('Credenciais inválidas'),
  SESSION_EXPIRED: new AuthenticationError('Sessão expirada'),
  
  // Tenant
  TENANT_NOT_FOUND: new TenantError('Agência não encontrada'),
  TENANT_ACCESS_DENIED: new TenantError('Acesso negado para esta agência'),
  TENANT_LIMIT_EXCEEDED: new TenantError('Limite do plano excedido'),
  
  // Validação
  INVALID_INPUT: new ValidationError(),
  MISSING_REQUIRED_FIELD: new ValidationError('Campo obrigatório não informado'),
  INVALID_FORMAT: new ValidationError('Formato de dados inválido'),
  
  // Recursos
  USER_NOT_FOUND: new NotFoundError('Usuário não encontrado'),
  CLIENT_NOT_FOUND: new NotFoundError('Cliente não encontrado'),
  PROJECT_NOT_FOUND: new NotFoundError('Projeto não encontrado'),
  TASK_NOT_FOUND: new NotFoundError('Tarefa não encontrada'),
  
  // Conflitos
  EMAIL_ALREADY_EXISTS: new ConflictError('Este email já está em uso'),
  SLUG_ALREADY_EXISTS: new ConflictError('Este identificador já está em uso'),
  RESOURCE_IN_USE: new ConflictError('Recurso está sendo utilizado e não pode ser removido'),
  
  // Sistema
  DATABASE_CONNECTION: new DatabaseError('Falha na conexão com o banco de dados'),
  UNEXPECTED_ERROR: new AppError('Erro interno do servidor', 500, 'UNEXPECTED_ERROR'),
  RATE_LIMIT_EXCEEDED: new AppError('Muitas tentativas. Tente novamente mais tarde.', 429, 'RATE_LIMIT_EXCEEDED'),
  
  // Serviços externos
  AI_SERVICE_ERROR: new ExternalServiceError('Serviço de IA indisponível'),
  PAYMENT_SERVICE_ERROR: new ExternalServiceError('Serviço de pagamento indisponível'),
} as const

// Função para verificar se é um erro operacional
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational
  }
  return false
}

// Função para extrair informações do erro para logging
export function getErrorInfo(error: Error) {
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
      isOperational: error.isOperational,
      stack: error.stack,
    }
  }
  
  return {
    message: error.message,
    statusCode: 500,
    code: 'UNKNOWN_ERROR',
    isOperational: false,
    stack: error.stack,
  }
}

// Função para converter erro em resposta HTTP
export function errorToHttpResponse(error: Error) {
  const errorInfo = getErrorInfo(error)
  
  return {
    error: errorInfo.message,
    code: errorInfo.code,
    statusCode: errorInfo.statusCode,
  }
}

// Função para logging seguro de erros (sem informações sensíveis)
export function getSafeErrorMessage(error: Error): string {
  if (error instanceof AppError && error.isOperational) {
    return error.message
  }
  
  // Para erros não operacionais, retornar mensagem genérica
  return 'Erro interno do servidor'
}
