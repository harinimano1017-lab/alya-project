import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()
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
  
  console.log('✅ Successfully created/updated test educator:', user.email)
  console.log('Password is: password123')
}

main()
  .catch((e) => {
    console.error('Error:', e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
