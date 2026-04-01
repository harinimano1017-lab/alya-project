import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import ProfileClient from './ProfileClient'

export default async function ProfilePage() {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) redirect('/login')

  // Find or create child profile
  let profile = await prisma.childProfile.findFirst({
    where: { userId }
  })

  // This relies strictly on child creation matching dashboard workflow logic
  if (!profile) {
    profile = await prisma.childProfile.create({
      data: {
        userId,
        name: 'My Child',
        dateOfBirth: new Date(),
        preferredLang: 'EN', // Default
      }
    })
  }

  // 1. Calculate Stats
  const lessonProgress = await prisma.lessonProgress.findMany({
    where: { childProfileId: profile.id, status: 'COMPLETED' },
    include: { lesson: { include: { subModule: { include: { module: true } } } } }
  })

  // Total completed
  const totalCompleted = lessonProgress.length

  // Modules started
  const uniqueModules = new Set(lessonProgress.map(p => p.lesson.subModule.module.id))
  const modulesStarted = uniqueModules.size

  // Calculate Streak
  // Get unique distinct dates
  const sortedDates = lessonProgress
    .map(p => p.completedAt)
    .filter((d): d is Date => d !== null)
    .sort((a, b) => b.getTime() - a.getTime()) // Newest first

  const uniqueDateStrings = Array.from(new Set(sortedDates.map(d => {
      // Use YYYY-MM-DD formatting relative to UTC
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`
  })))

  let streak = 0
  if (uniqueDateStrings.length > 0) {
    const today = new Date()
    const todayStr = `${today.getUTCFullYear()}-${String(today.getUTCMonth()+1).padStart(2,'0')}-${String(today.getUTCDate()).padStart(2,'0')}`
    
    // Check if the latest date is today or yesterday to continue streak
    let lastDateObj = new Date(uniqueDateStrings[0] + 'T00:00:00Z')
    let todayObj = new Date(todayStr + 'T00:00:00Z')
    
    // Difference between today and last completion in days
    const diffDays = (todayObj.getTime() - lastDateObj.getTime()) / (1000 * 3600 * 24)

    if (diffDays <= 1) {
      streak = 1
      for (let i = 1; i < uniqueDateStrings.length; i++) {
        const curr = new Date(uniqueDateStrings[i] + 'T00:00:00Z')
        const prev = new Date(uniqueDateStrings[i-1] + 'T00:00:00Z')
        const interval = (prev.getTime() - curr.getTime()) / (1000 * 3600 * 24)
        if (interval === 1) {
          streak++
        } else {
          break
        }
      }
    }
  }

  // Calculate Badges
  // Determine if all lessons completed for Animals, Fruits, Colors
  const moduleCompletion = await Promise.all(['animals', 'fruits', 'colors'].map(async (slug) => {
    const mod = await prisma.module.findUnique({
      where: { slug },
      include: { subModules: { include: { lessons: { where: { isPublished: true } } } } }
    })
    if (!mod) return { slug, earned: false }

    const allLessonIds = mod.subModules.flatMap(sm => sm.lessons.map(l => l.id))
    if (allLessonIds.length === 0) return { slug, earned: false }

    // How many of these did the kid complete?
    const completedForMod = lessonProgress.filter(p => allLessonIds.includes(p.lessonId)).length
    
    return {
      slug,
      earned: completedForMod >= allLessonIds.length
    }
  }))

  const isAnimalsComplete = moduleCompletion.find(m => m.slug === 'animals')?.earned || false
  const isColorsComplete = moduleCompletion.find(m => m.slug === 'colors')?.earned || false
  const isFruitsComplete = moduleCompletion.find(m => m.slug === 'fruits')?.earned || false

  const badges = [
    {
      id: 'first-step',
      title: 'First Step',
      emoji: '⭐',
      desc: 'You completed your first lesson!',
      earned: totalCompleted > 0
    },
    {
      id: 'animal-explorer',
      title: 'Animal Explorer',
      emoji: '🐾',
      desc: 'You learned all the animals!',
      earned: isAnimalsComplete
    },
    {
      id: 'color-master',
      title: 'Color Master',
      emoji: '🎨',
      desc: 'You know all the colors!',
      earned: isColorsComplete
    },
    {
      id: 'fruit-expert',
      title: 'Fruit Expert',
      emoji: '🍎',
      desc: 'You explored all the fruits!',
      earned: isFruitsComplete
    },
    {
      id: 'on-fire',
      title: 'On Fire',
      emoji: '🔥',
      desc: '3 days in a row — keep it up!',
      earned: streak >= 3
    },
    {
      id: 'super-learner',
      title: 'Super Learner',
      emoji: '🌟',
      desc: '10 lessons done — amazing!',
      earned: totalCompleted >= 10
    }
  ]

  return (
    <ProfileClient 
      profile={profile}
      stats={{
        lessonsCompleted: totalCompleted,
        modulesStarted,
        streak
      }}
      badges={badges}
    />
  )
}
