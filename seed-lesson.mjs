import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const module = await prisma.module.findFirst({
    include: { subModules: true }
  })
  
  if (!module || !module.subModules.length) {
    console.log("No modules found")
    return
  }

  const subModuleId = module.subModules[0].id
  const wordText = 'LION'
  const slug = `lion-demo-${Date.now()}`

  const lesson = await prisma.lesson.create({
    data: {
      wordText,
      slug,
      isPublished: true,
      subModuleId,
    }
  })

  // Create image
  const imgAsset = await prisma.mediaAsset.create({
    data: { s3Key: 'demo-img', cdnUrl: 'https://images.unsplash.com/photo-1614027164475-47209ed53a6a', mediaType: 'CONCEPT_IMAGE', mimeType: 'image/jpeg', uploadedById: 'demo' }
  })
  await prisma.lessonMedia.create({ data: { lessonId: lesson.id, mediaAssetId: imgAsset.id, panelType: 'CONCEPT_IMAGE' } })

  // Create Lip reading
  const lipAsset = await prisma.mediaAsset.create({
    data: { s3Key: 'demo-lip', cdnUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk', mediaType: 'LIP_READING_VIDEO', mimeType: 'video/youtube', uploadedById: 'demo' }
  })
  await prisma.lessonMedia.create({ data: { lessonId: lesson.id, mediaAssetId: lipAsset.id, panelType: 'LIP_READING_VIDEO' } })

  // Create Sign language
  const signAsset = await prisma.mediaAsset.create({
    data: { s3Key: 'demo-sign', cdnUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk', mediaType: 'SIGN_LANGUAGE_VIDEO', mimeType: 'video/youtube', uploadedById: 'demo' }
  })
  await prisma.lessonMedia.create({ data: { lessonId: lesson.id, mediaAssetId: signAsset.id, panelType: 'SIGN_LANGUAGE_VIDEO' } })

  console.log(`Successfully created demo lesson! Refresh your page to see it.`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
