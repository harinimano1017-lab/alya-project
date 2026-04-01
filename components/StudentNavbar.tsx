'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function StudentNavbar() {
  const pathname = usePathname()

  const navLinks = [
    { name: 'Explore', href: '/' },
    { name: 'My Path', href: '/my-path' },
    { name: 'Library', href: '/library' },
  ]

  return (
    <>
      <style>{`
        .nav-link { color: #444; font-size: 14px; font-weight: 500; cursor: pointer; text-decoration: none; transition: color 0.2s; }
        .nav-link:hover { color: #6B4FA0; }
        .nav-link.active { color: #6B4FA0; border-bottom: 2px solid #6B4FA0; padding-bottom: 2px; }
      `}</style>
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: '64px', background: 'rgba(247,245,242,0.9)',
        backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100,
        borderBottom: '1px solid #EDE7F6'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #6B4FA0, #9B72CF)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontSize: 16, fontWeight: 700 }}>A</span>
          </div>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: '#3B1F6B', letterSpacing: '-0.02em' }}>Alya</span>
          </Link>
        </div>
        <div style={{ display: 'flex', gap: '32px' }}>
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              className={`nav-link ${pathname === link.href ? 'active' : ''}`}
            >
              {link.name}
            </Link>
          ))}
        </div>
        <Link href="/login" style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #EDE7F6, #D1C4E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid #C9B8E8', textDecoration: 'none' }}>
          <span style={{ fontSize: 18 }}>👤</span>
        </Link>
      </nav>
    </>
  )
}
