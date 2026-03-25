import type { NextAuthConfig } from 'next-auth'

// Edge-safe config: no Prisma, no bcrypt imports
// Used by middleware for route protection
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const path = nextUrl.pathname

      const protectedPrefixes = [
        '/admin',
        '/educator',
        '/parent',
        '/lesson',
        '/library',
        '/my-path',
        '/progress',
        '/profile',
      ]

      const isProtected = protectedPrefixes.some((p) => path.startsWith(p))

      if (isProtected && !isLoggedIn) return false

      return true
    },
  },
  providers: [], // Populated in auth.ts (bcrypt/Prisma not edge-safe)
} satisfies NextAuthConfig
