'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, BookOpen, BarChart3, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SignOutButton } from './SignOutButton'
type UserRole = 'PARENT' | 'CHILD' | 'EDUCATOR' | 'ADMIN'

export interface SidebarUser {
  name: string
  email: string
  role: UserRole
}

const ROLE_LABEL: Record<UserRole, string> = {
  ADMIN: 'Administrator',
  EDUCATOR: 'Educator',
  PARENT: 'Parent',
  CHILD: 'Student',
}

type NavItem = { label: string; href: string; icon: React.ReactNode }

function getNavItems(role: UserRole): NavItem[] {
  switch (role) {
    case 'ADMIN':
      return [
        { label: 'Overview',  href: '/admin',            icon: <LayoutDashboard className="h-4 w-4" /> },
        { label: 'Users',     href: '/admin/users',      icon: <Users className="h-4 w-4" /> },
        { label: 'Content',   href: '/admin/content',    icon: <BookOpen className="h-4 w-4" /> },
        { label: 'Analytics', href: '/admin/analytics',  icon: <BarChart3 className="h-4 w-4" /> },
      ]
    case 'EDUCATOR':
      return [
        { label: 'Overview',  href: '/educator',          icon: <LayoutDashboard className="h-4 w-4" /> },
        { label: 'Lessons',   href: '/educator/lessons',  icon: <BookOpen className="h-4 w-4" /> },
        { label: 'Students',  href: '/educator/students', icon: <Users className="h-4 w-4" /> },
      ]
    case 'PARENT':
      return [
        { label: 'Overview',  href: '/parent',           icon: <LayoutDashboard className="h-4 w-4" /> },
        { label: 'Children',  href: '/parent/children',  icon: <Heart className="h-4 w-4" /> },
      ]
    case 'CHILD':
      return [
        { label: 'Library', href: '/library', icon: <BookOpen className="h-4 w-4" /> },
      ]
  }
}

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function Sidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname()
  const navItems = getNavItems(user.role)

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-[var(--alya-purple-light)] bg-white">
      {/* Brand */}
      <div className="px-6 py-5">
        <Link href="/">
          <span
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--alya-purple)' }}
          >
            Alya
          </span>
        </Link>
        <p className="mt-0.5 text-[11px] font-medium uppercase tracking-widest text-gray-400">
          {ROLE_LABEL[user.role]}
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-4 pb-4">
        {navItems.map(({ label, href, icon }) => {
          // Root paths (/admin, /educator, /parent) use exact match to avoid
          // highlighting "Overview" when on a sub-page like /admin/users
          const isRoot = href.split('/').length === 2
          const isActive = isRoot ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                isActive
                  ? 'bg-[var(--alya-purple-light)] text-[var(--alya-purple)]'
                  : 'text-gray-600 hover:bg-[var(--alya-purple-pale)] hover:text-[var(--alya-purple)]'
              )}
            >
              {icon}
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-[var(--alya-purple-light)] p-4">
        <div className="mb-2 flex items-center gap-3 px-1">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ background: 'var(--alya-purple)' }}
          >
            {initials(user.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[var(--alya-purple-dark)]">
              {user.name}
            </p>
            <p className="truncate text-xs text-gray-400">{user.email}</p>
          </div>
        </div>
        <SignOutButton />
      </div>
    </aside>
  )
}
