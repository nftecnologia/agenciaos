import { prisma } from './db'

export async function testDatabaseConnection() {
  try {
    // Tenta fazer uma query simples para testar a conexão
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Conexão com banco de dados funcionando!')
    return true
  } catch (error) {
    console.error('❌ Erro na conexão com banco de dados:', error)
    return false
  } finally {
    await prisma.$disconnect()
  }
} 