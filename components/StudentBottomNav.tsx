'use client'

import Link from 'next/link'

interface StudentBottomNavProps {
  activeTab?: 'Home' | 'Lessons' | 'Progress' | 'Profile'
}

export function StudentBottomNav({ activeTab = 'Home' }: StudentBottomNavProps) {
  const tabs = [
    { label: 'Home', href: '/' },
    { label: 'Lessons', href: '/library' },
    { label: 'Progress', href: '/my-path' },
    { label: 'Profile', href: '/profile' }
  ]

  return (
    <>
      <style>{`
        .bottom-nav-item { display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; padding: 8px 20px; border-radius: 16px; transition: background 0.2s; text-decoration: none; }
        .bottom-nav-item:hover { background: #F0EBF8; }
        .bottom-nav-item.active { background: #EDE7F6; }
        .nav-label { font-size: 11px; font-weight: 600; transition: color 0.2s; }
      `}</style>
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderTop: '1px solid #EDE7F6', display: 'flex', justifyContent: 'center', gap: 8, padding: '10px 24px 20px', zIndex: 100 }}>
        {tabs.map(({ label, href }) => {
          const isActive = activeTab === label
          const iconColor = isActive ? '#6B4FA0' : '#AAA'
          
          return (
            <Link href={href} key={label} className={`bottom-nav-item ${isActive ? 'active' : ''}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {label === 'Home' && <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></>}
                {label === 'Lessons' && <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>}
                {label === 'Progress' && <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>}
                {label === 'Profile' && <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>}
              </svg>
              <span className="nav-label" style={{ color: iconColor }}>{label}</span>
            </Link>
          )
        })}
      </div>
    </>
  )
}
