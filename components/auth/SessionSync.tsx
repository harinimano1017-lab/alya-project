'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useUserStore } from '@/store/userStore'

// Bridges the NextAuth session into Zustand userStore
export function SessionSync() {
  const { data: session } = useSession()
  const setUser = useUserStore((s) => s.setUser)

  useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.id,
        name: session.user.name ?? '',
        email: session.user.email ?? '',
        role: session.user.role,
      })
    } else {
      setUser(null)
    }
  }, [session, setUser])

  return null
}
