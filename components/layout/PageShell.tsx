import { Sidebar, type SidebarUser } from './Sidebar'

interface PageShellProps {
  user: SidebarUser
  children: React.ReactNode
}

export function PageShell({ user, children }: PageShellProps) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--alya-bg)' }}>
      <Sidebar user={user} />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  )
}
