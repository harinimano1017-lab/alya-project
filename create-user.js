const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {
      password: hashedPassword,
      role: 'EDUCATOR',
      name: 'Test Teacher'
    },
    create: {
      email: 'test@example.com',
      name: 'Test Teacher',
      password: hashedPassword,
      role: 'EDUCATOR',
      authProviderId: 'local-test-' + Date.now()
    }
  })
  
  console.log('Successfully created test educator:', user.email)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
