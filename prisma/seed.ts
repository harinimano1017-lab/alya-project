import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create the main module
  const module = await prisma.module.create({
    data: {
      slug: 'lip-learning',
      title: 'Lip Learning Module',
      description: 'Learn through lip reading, sign language and images',
      orderIndex: 1,
      isPublished: true,
      subModules: {
        create: {
          slug: 'animals',
          title: 'Animals',
          description: 'Learn animal names',
          orderIndex: 1,
          isPublished: true,
          lessons: {
            create: [
              { slug: 'cat', wordText: 'CAT', orderIndex: 1, isPublished: true },
              { slug: 'dog', wordText: 'DOG', orderIndex: 2, isPublished: true },
              { slug: 'fish', wordText: 'FISH', orderIndex: 3, isPublished: true },
              { slug: 'bird', wordText: 'BIRD', orderIndex: 4, isPublished: true },
              { slug: 'lion', wordText: 'LION', orderIndex: 5, isPublished: true },
              { slug: 'elephant', wordText: 'ELEPHANT', orderIndex: 6, isPublished: true },
            ]
          }
        }
      }
    }
  })

  console.log('✅ Module created:', module.title)
  console.log('✅ Animals sub-module created with 6 lessons')
  console.log('🌱 Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })