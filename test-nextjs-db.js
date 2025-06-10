// Teste que simula exatamente o ambiente Next.js
const { PrismaClient } = require('@prisma/client')
require('dotenv').config({ path: '.env.local' })

async function testNextJSAuth() {
  console.log('🧪 Testando conexão no contexto Next.js...')
  
  try {
    // Simular exatamente o que fazemos no NextAuth
    console.log('🔧 DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 30) + '...')
    console.log('🔧 NODE_ENV:', process.env.NODE_ENV)
    
    const authPrisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    })
    
    console.log('🔌 Conectando ao banco...')
    await authPrisma.$connect()
    
    console.log('🔍 Buscando usuário nicolas.fer.oli@gmail.com...')
    const user = await authPrisma.user.findUnique({
      where: {
        email: 'nicolas.fer.oli@gmail.com',
      },
    })
    
    if (user) {
      console.log('✅ Usuário encontrado:', user.email)
      console.log('🔑 Tem senha?', !!user.password)
    } else {
      console.log('❌ Usuário não encontrado')
    }
    
    await authPrisma.$disconnect()
    console.log('✅ Teste concluído com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro no teste NextJS:')
    console.error('Tipo:', error.constructor.name)
    console.error('Mensagem:', error.message)
    console.error('Code:', error.code)
    
    if (error.message.includes('password authentication failed')) {
      console.log('\n🔧 Diagnóstico:')
      console.log('1. URL completa:', process.env.DATABASE_URL)
      console.log('2. Arquivo .env.local está sendo lido?')
      console.log('3. Verificar se a senha está correta no Neon console')
    }
  }
}

testNextJSAuth()
