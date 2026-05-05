import type { NextAuthConfig } from 'next-auth'

// Edge-safe config: no Prisma, no bcrypt imports
// Used by middleware for route protection
export const authConfig = {
  secret: process.env.AUTH_SECRET || "1f48d5b88b03043818e6cdbbef9b307ff03de421_production_secret_key",
  trustHost: true,
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = (token as any).role
      }
      return session
    },
  },
  providers: [], // Populated in auth.ts (bcrypt/Prisma not edge-safe)
} satisfies NextAuthConfig
