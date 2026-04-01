import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

// Role → allowed path prefixes
const ROLE_PATHS: Record<string, string[]> = {
  ADMIN:    ['/admin'],
  EDUCATOR: ['/educator'],
  PARENT:   ['/parent'],
  CHILD:    ['/library', '/lesson', '/my-path', '/progress', '/profile'],
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  return <>{children}</>
}

export { ROLE_PATHS }
