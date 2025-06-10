const { PrismaClient } = require('@prisma/client')

async function testConnection() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 Testando conexão com o banco Neon...')
    
    // Teste simples de conexão
    await prisma.$connect()
    console.log('✅ Conexão com o banco estabelecida com sucesso!')
    
    // Teste de consulta básica
    const userCount = await prisma.user.count()
    console.log(`📊 Número de usuários no banco: ${userCount}`)
    
    console.log('✅ Teste de conexão concluído com sucesso!')
    
  } catch (error) {
    console.log('❌ Erro na conexão com o banco:')
    console.error(error.message)
    
    if (error.message.includes('password authentication failed')) {
      console.log('\n🔧 Possíveis soluções:')
      console.log('1. Verificar se as credenciais no .env.local estão corretas')
      console.log('2. Verificar se o banco Neon está ativo')
      console.log('3. Verificar se a senha não expirou')
      console.log('4. Tentar resetar a senha no console do Neon')
    }
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
