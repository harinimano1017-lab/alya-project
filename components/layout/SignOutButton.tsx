'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-gray-500 transition hover:bg-red-50 hover:text-red-600"
    >
      <LogOut className="h-4 w-4 shrink-0" />
      Sign out
    </button>
  )
}
