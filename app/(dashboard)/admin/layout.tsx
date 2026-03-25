import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { PageShell } from '@/components/layout/PageShell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/')

  return (
    <PageShell
      user={{
        name:  session.user.name  ?? 'Admin',
        email: session.user.email ?? '',
        role:  session.user.role,
      }}
    >
      {children}
    </PageShell>
  )
}
