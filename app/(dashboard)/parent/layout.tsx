import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { PageShell } from '@/components/layout/PageShell'

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) redirect('/login')
  if (session.user.role !== 'PARENT') redirect('/')

  return (
    <PageShell
      user={{
        name:  session.user.name  ?? 'Parent',
        email: session.user.email ?? '',
        role:  session.user.role,
      }}
    >
      {children}
    </PageShell>
  )
}
