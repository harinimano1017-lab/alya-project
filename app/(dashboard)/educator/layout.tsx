import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { PageShell } from '@/components/layout/PageShell'

export default async function EducatorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) redirect('/login')
  if (session.user.role !== 'EDUCATOR') redirect('/')

  return (
    <PageShell
      user={{
        name:  session.user.name  ?? 'Educator',
        email: session.user.email ?? '',
        role:  session.user.role,
      }}
    >
      {children}
    </PageShell>
  )
}
