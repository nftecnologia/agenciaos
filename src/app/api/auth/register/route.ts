import { NextRequest, NextResponse } from 'next/server'
import { registerSchema } from '@/lib/validations'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Endpoint de registro usando sistema mock para desenvolvimento")

    const body = await request.json()
    
    // Validar dados de entrada
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const { name, email, password, agencyName } = validationResult.data

    console.log("📧 Tentativa de registro:", email)

    // Sistema mock - simular criação de conta
    // Em desenvolvimento, sempre permite criar qualquer conta
    const mockUser = {
      id: `mock-${Date.now()}`,
      name,
      email,
      role: 'OWNER',
    }

    const mockAgency = {
      id: `agency-${Date.now()}`,
      name: agencyName,
      slug: agencyName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    }

    console.log("✅ Conta mock criada com sucesso:", email)

    return NextResponse.json(
      {
        message: 'Conta criada com sucesso! Use as credenciais padrão para fazer login.',
        user: mockUser,
        agency: mockAgency,
        mockInfo: {
          note: "Sistema em modo desenvolvimento - use admin@agenciaos.com com senha 123456 para fazer login"
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar conta mock:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
