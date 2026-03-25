import type { Metadata } from 'next'
import { DM_Sans, Fraunces } from 'next/font/google'
import { SessionProvider } from 'next-auth/react'
import { SessionSync } from '@/components/auth/SessionSync'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Alya — E-Learning for Deaf & Non-Verbal Children',
  description: 'Multimodal learning through lip reading, sign language, images and text.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${fraunces.variable}`}>
      <body>
        <SessionProvider>
          <SessionSync />
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
