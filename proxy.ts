import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'

const { auth } = NextAuth(authConfig)

// Next.js 16: export named "proxy" function (replaces the old middleware convention)
export { auth as proxy }

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - /api/auth  (NextAuth endpoints)
     * - /_next     (Next.js internals)
     * - /fonts, /icons, /images (static assets)
     * - /favicon.ico
     */
    '/((?!api/auth|_next/static|_next/image|fonts|icons|images|favicon\\.ico).*)',
  ],
}
