'use client'
import { useRouter } from 'next/navigation'

const lessons = [
  { slug: 'cat', label: 'Cat' },
  { slug: 'dog', label: 'Dog' },
  { slug: 'fish', label: 'Fish' },
  { slug: 'bird', label: 'Bird' },
  { slug: 'lion', label: 'Lion' },
  { slug: 'elephant', label: 'Elephant' },
]

export default function ModulePage() {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: '#F7F5F2', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Fraunces:wght@600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .lesson-card { background: white; border-radius: 24px; padding: 20px; cursor: pointer; border: 1.5px solid #F0EBF8; transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1); display: flex; flex-direction: column; align-items: flex-start; }
        .lesson-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(107,79,160,0.12); border-color: #C9B8E8; }
        .start-btn { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: #6B4FA0; letter-spacing: 0.06em; text-transform: uppercase; margin-top: 14px; }
        .back-btn { display: inline-flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 500; color: #6B4FA0; background: white; border: 1.5px solid #E0D9F0; padding: 8px 18px; border-radius: 999px; cursor: pointer; }
        .back-btn:hover { background: #EDE7F6; }
        .img-placeholder { width: 100%; aspect-ratio: 1; background: linear-gradient(135deg, #F0EBF8, #E8E0F5); border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; margin-bottom: 14px; border: 1.5px dashed #C9B8E8; }
        .img-placeholder span { font-size: 11px; color: #9B72CF; font-weight: 500; }
        .bottom-nav-item { display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; padding: 8px 20px; border-radius: 16px; }
        .bottom-nav-item.active { background: #EDE7F6; }
        .nav-label { font-size: 11px; font-weight: 600; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .fade-card { animation: fadeUp 0.4s ease both; }
      `}</style>

      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', background: 'rgba(247,245,242,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #EDE7F6', position: 'sticky', top: 0, zIndex: 100 }}>
        <button className="back-btn" onClick={() => router.push('/')}>← Back</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #6B4FA0, #9B72CF)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontSize: 14, fontWeight: 700 }}>A</span>
          </div>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: '#3B1F6B' }}>Animals</span>
        </div>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #EDE7F6, #D1C4E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #C9B8E8', fontSize: 12, fontWeight: 700, color: '#6B4FA0' }}>EN</div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 100px' }}>
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', background: '#EDE7F6', color: '#6B4FA0', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '5px 14px', borderRadius: 999, marginBottom: 12 }}>MODULE 1</div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 36, fontWeight: 700, color: '#1A0A2E', letterSpacing: '-0.02em', marginBottom: 8 }}>Choose a lesson to begin</h1>
          <div style={{ width: 48, height: 4, background: 'linear-gradient(90deg, #6B4FA0, #9B72CF)', borderRadius: 999 }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {lessons.map((lesson, i) => (
            <div key={lesson.slug} className="lesson-card fade-card" style={{ animationDelay: `${i * 0.07}s` }}
              onClick={() => router.push(`/lesson/${lesson.slug}`)}>

                        <div className="img-placeholder">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9B72CF" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="3"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="m21 15-5-5L5 21"/>
                </svg>
                <span>Add image</span>
              </div>

              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: '#1A0A2E' }}>{lesson.label}</h3>
              <div className="start-btn">Start →</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, background: 'white', borderRadius: 20, padding: '20px 28px', border: '1.5px solid #F0EBF8', display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          {[['12 Lessons','in this module'],['Sign Language','included'],['Lip Reading','included'],['Visual Images','for every word']].map(([label, sub]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, background: '#EDE7F6', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B4FA0" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1A0A2E' }}>{label}</div>
                <div style={{ fontSize: 11, color: '#888' }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Nav */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderTop: '1px solid #EDE7F6', display: 'flex', justifyContent: 'center', gap: 8, padding: '10px 24px 20px' }}>
        {[['Home',false],['Lessons',true],['Progress',false],['Profile',false]].map(([label, active]) => (
          <div key={label as string} className={`bottom-nav-item ${active ? 'active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#6B4FA0' : '#AAA'} strokeWidth="2">
              {label === 'Home' && <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></>}
              {label === 'Lessons' && <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>}
              {label === 'Progress' && <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>}
              {label === 'Profile' && <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>}
            </svg>
            <span className="nav-label" style={{ color: active ? '#6B4FA0' : '#AAA' }}>{label as string}</span>
          </div>
        ))}
      </div>
    </div>
  )
}