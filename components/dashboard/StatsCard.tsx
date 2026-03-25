import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface StatsCardProps {
  label: string
  value: string | number
  icon: ReactNode
  trend?: { value: number; label: string }
  className?: string
}

export function StatsCard({ label, value, icon, trend, className }: StatsCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[var(--alya-purple-light)] bg-white p-6 shadow-sm',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p
            className="mt-1 text-3xl font-bold tracking-tight"
            style={{ color: 'var(--alya-purple-dark)', fontFamily: 'var(--font-display)' }}
          >
            {value}
          </p>
          {trend && (
            <p
              className={cn(
                'mt-1.5 text-xs font-medium',
                trend.value >= 0 ? 'text-emerald-600' : 'text-red-500'
              )}
            >
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div className="shrink-0 rounded-xl bg-[var(--alya-purple-light)] p-3 text-[var(--alya-purple)]">
          {icon}
        </div>
      </div>
    </div>
  )
}
