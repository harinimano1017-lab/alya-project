'use client'

import { useUserStore } from '@/store/userStore'
import type { UserRole } from '@prisma/client'

interface RoleGuardProps {
  allow: UserRole[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RoleGuard({ allow, children, fallback = null }: RoleGuardProps) {
  const role = useUserStore((s) => s.user?.role)

  if (!role || !allow.includes(role)) return <>{fallback}</>

  return <>{children}</>
}
