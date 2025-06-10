const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Criando dados de teste...')

  // Verificar se já existe usuário de teste
  const existingUser = await prisma.user.findUnique({
    where: { email: 'admin@agencia.com' }
  })

  if (existingUser) {
    console.log('✅ Usuário de teste já existe:', existingUser.email)
    console.log('📋 Para testar os assistentes IA:')
    console.log('- Email: admin@agencia.com')
    console.log('- Senha: 123456')
    return
  }

  // Primeiro, limpar dados existentes (ordem importante devido às foreign keys)
  console.log('🧹 Limpando dados existentes...')
  await prisma.task.deleteMany()
  await prisma.board.deleteMany()
  await prisma.revenue.deleteMany()
  await prisma.expense.deleteMany()
  await prisma.project.deleteMany()
  await prisma.client.deleteMany()
  
  // Remover usuários que não são owners de agência
  await prisma.user.deleteMany({
    where: {
      ownedAgency: null
    }
  })

  // Remover agências e depois usuários owners
  const agencies = await prisma.agency.findMany()
  for (const agency of agencies) {
    await prisma.agency.delete({
      where: { id: agency.id }
    })
    await prisma.user.delete({
      where: { id: agency.ownerId }
    }).catch(() => {}) // Ignorar se usuário já foi deletado
  }

  // Criar usuário primeiro (sem agencyId)
  console.log('👤 Criando usuário...')
  const hashedPassword = await bcrypt.hash('123456', 12)
  const user = await prisma.user.create({
    data: {
      id: 'user-demo',
      email: 'admin@agencia.com',
      name: 'Admin Demo',
      password: hashedPassword,
      role: 'OWNER'
      // agencyId será atualizado depois
    }
  })

  // Criar agência com o usuário como owner
  console.log('🏢 Criando agência...')
  const agency = await prisma.agency.create({
    data: {
      id: 'agency-demo',
      name: 'Agência Demo',
      slug: 'agencia-demo',
      ownerId: user.id,
      plan: 'PRO'
    }
  })

  // Atualizar usuário com agencyId
  await prisma.user.update({
    where: { id: user.id },
    data: { agencyId: agency.id }
  })

  console.log('✅ Usuário criado:', user.email)

  // Criar clientes
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        agencyId: agency.id,
        name: 'Tech Startup Ltda',
        email: 'contato@techstartup.com',
        company: 'Tech Startup',
        phone: '(11) 99999-9999'
      }
    }),
    prisma.client.create({
      data: {
        agencyId: agency.id,
        name: 'E-commerce Plus',
        email: 'vendas@ecommerceplus.com',
        company: 'E-commerce Plus',
        phone: '(11) 88888-8888'
      }
    }),
    prisma.client.create({
      data: {
        agencyId: agency.id,
        name: 'Restaurante Sabor',
        email: 'chef@restaurantesabor.com',
        company: 'Restaurante Sabor',
        phone: '(11) 77777-7777'
      }
    })
  ])

  console.log('✅ Clientes criados:', clients.length)

  // Criar projetos
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        agencyId: agency.id,
        clientId: clients[0].id,
        name: 'Site Corporativo Tech Startup',
        description: 'Desenvolvimento de site institucional com foco em conversão',
        status: 'IN_PROGRESS',
        budget: 15000,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-03-15')
      }
    }),
    prisma.project.create({
      data: {
        agencyId: agency.id,
        clientId: clients[1].id,
        name: 'E-commerce E-commerce Plus',
        description: 'Loja virtual completa com integração de pagamento',
        status: 'IN_PROGRESS',
        budget: 25000,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-05-01')
      }
    }),
    prisma.project.create({
      data: {
        agencyId: agency.id,
        clientId: clients[2].id,
        name: 'App Delivery Restaurante',
        description: 'Aplicativo mobile para delivery',
        status: 'PLANNING',
        budget: 18000,
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-06-01')
      }
    })
  ])

  console.log('✅ Projetos criados:', projects.length)

  // Criar boards
  const boards = await Promise.all([
    prisma.board.create({
      data: {
        projectId: projects[0].id,
        name: 'To Do',
        position: 1,
        color: '#ef4444'
      }
    }),
    prisma.board.create({
      data: {
        projectId: projects[0].id,
        name: 'Em Progresso',
        position: 2,
        color: '#f59e0b'
      }
    }),
    prisma.board.create({
      data: {
        projectId: projects[0].id,
        name: 'Concluído',
        position: 3,
        color: '#10b981'
      }
    })
  ])

  // Criar tasks
  await Promise.all([
    prisma.task.create({
      data: {
        projectId: projects[0].id,
        boardId: boards[0].id,
        assignedTo: user.id,
        title: 'Wireframes das páginas principais',
        description: 'Criar wireframes para home, sobre e contato',
        priority: 'HIGH',
        dueDate: new Date('2024-02-15'),
        position: 1
      }
    }),
    prisma.task.create({
      data: {
        projectId: projects[0].id,
        boardId: boards[1].id,
        assignedTo: user.id,
        title: 'Desenvolvimento da homepage',
        description: 'Implementar layout responsivo da homepage',
        priority: 'HIGH',
        dueDate: new Date('2024-02-20'),
        position: 1
      }
    }),
    prisma.task.create({
      data: {
        projectId: projects[1].id,
        boardId: boards[0].id,
        title: 'Integração de pagamento',
        description: 'Implementar gateway de pagamento',
        priority: 'URGENT',
        dueDate: new Date('2024-02-10'),
        position: 1
      }
    })
  ])

  console.log('✅ Tasks criadas')

  // Criar receitas
  await Promise.all([
    prisma.revenue.create({
      data: {
        agencyId: agency.id,
        clientId: clients[0].id,
        projectId: projects[0].id,
        description: 'Primeira parcela - Site Tech Startup',
        amount: 7500,
        category: 'Desenvolvimento Web',
        isRecurring: false,
        date: new Date('2024-01-20')
      }
    }),
    prisma.revenue.create({
      data: {
        agencyId: agency.id,
        clientId: clients[1].id,
        projectId: projects[1].id,
        description: 'Sinal - E-commerce Plus',
        amount: 12500,
        category: 'E-commerce',
        isRecurring: false,
        date: new Date('2024-02-05')
      }
    }),
    prisma.revenue.create({
      data: {
        agencyId: agency.id,
        clientId: clients[0].id,
        description: 'Consultoria SEO mensal',
        amount: 2000,
        category: 'Consultoria',
        isRecurring: true,
        date: new Date('2024-02-01')
      }
    }),
    prisma.revenue.create({
      data: {
        agencyId: agency.id,
        clientId: clients[1].id,
        description: 'Manutenção mensal',
        amount: 1500,
        category: 'Manutenção',
        isRecurring: true,
        date: new Date('2024-02-01')
      }
    })
  ])

  console.log('✅ Receitas criadas')

  // Criar despesas
  await Promise.all([
    prisma.expense.create({
      data: {
        agencyId: agency.id,
        description: 'Licença Adobe Creative Suite',
        amount: 300,
        category: 'Software',
        date: new Date('2024-02-01')
      }
    }),
    prisma.expense.create({
      data: {
        agencyId: agency.id,
        description: 'Hospedagem servidores',
        amount: 250,
        category: 'Infraestrutura',
        date: new Date('2024-02-01')
      }
    }),
    prisma.expense.create({
      data: {
        agencyId: agency.id,
        description: 'Freelancer Designer',
        amount: 1800,
        category: 'Recursos Humanos',
        date: new Date('2024-02-10')
      }
    }),
    prisma.expense.create({
      data: {
        agencyId: agency.id,
        description: 'Material de escritório',
        amount: 150,
        category: 'Escritório',
        date: new Date('2024-02-05')
      }
    })
  ])

  console.log('✅ Despesas criadas')

  console.log('🎉 Dados de teste criados com sucesso!')
  console.log('')
  console.log('📋 Resumo:')
  console.log('- Email: admin@agencia.com')
  console.log('- Senha: 123456')
  console.log('- Agência: Agência Demo')
  console.log('- Clientes: 3')
  console.log('- Projetos: 3')
  console.log('- Receitas: R$ 23.500,00')
  console.log('- Despesas: R$ 2.500,00')
  console.log('- Lucro: R$ 21.000,00')
}

main()
  .catch((e) => {
    console.error('❌ Erro ao criar dados de teste:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
