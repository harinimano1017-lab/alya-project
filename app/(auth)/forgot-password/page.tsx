'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const inputClass = cn(
    'w-full rounded-xl border border-[var(--alya-purple-light)] bg-white px-4 py-2.5',
    'text-sm text-[var(--alya-purple-dark)] placeholder:text-gray-400',
    'outline-none ring-0 transition',
    'focus:border-[var(--alya-purple)] focus:ring-2 focus:ring-[var(--alya-purple)]/20'
  )

  return (
    <div className="w-full max-w-sm">
      {/* Brand */}
      <div className="mb-8 text-center">
        <h1
          className="text-4xl font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--alya-purple)' }}
        >
          Alya
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          E-Learning for Deaf &amp; Non-Verbal Children
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--alya-purple-light)] bg-white px-8 py-8 shadow-sm">
        {submitted ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--alya-purple-dark)' }}>
              Check your inbox
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              If <strong>{email}</strong> has an account, we&apos;ve sent a password reset link.
            </p>
            <Link
              href="/login"
              className="mt-6 block text-sm font-medium text-[var(--alya-purple)] hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <h2
              className="mb-1 text-xl font-semibold"
              style={{ color: 'var(--alya-purple-dark)' }}
            >
              Reset your password
            </h2>
            <p className="mb-6 text-sm text-gray-500">
              Enter your email and we&apos;ll send you a reset link.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                setSubmitted(true)
              }}
              className="space-y-5"
            >
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[var(--alya-purple-dark)]"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                className={cn(
                  'w-full rounded-xl bg-[var(--alya-purple)] px-4 py-3 text-sm font-semibold text-white',
                  'transition hover:bg-[var(--alya-purple-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--alya-purple)]/40'
                )}
              >
                Send reset link
              </button>

              <p className="text-center text-sm text-gray-500">
                <Link
                  href="/login"
                  className="font-medium text-[var(--alya-purple)] hover:underline"
                >
                  Back to sign in
                </Link>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
