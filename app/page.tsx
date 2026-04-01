'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { StudentNavbar } from '@/components/StudentNavbar'
import { StudentBottomNav } from '@/components/StudentBottomNav'

const themeColors = [
  { color: '#E8F5E9', iconBg: '#C8E6C9' },
  { color: '#FFF3E0', iconBg: '#FFE0B2' },
  { color: '#E0F2F1', iconBg: '#B2DFDB' },
  { color: '#FCE4EC', iconBg: '#F8BBD0' },
  { color: '#E8EAF6', iconBg: '#C5CAE9' },
  { color: '#E3F2FD', iconBg: '#BBDEFB' },
]

export default function HomePage() {
  const [activeLanguage, setActiveLanguage] = useState('English')
  const [modules, setModules] = useState<any[]>([])
  const router = useRouter()
  const languages = ['English', 'Tamil']

  useEffect(() => {
    fetch('/api/modules')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const formatted = data.data.map((m: any, i: number) => {
            const theme = themeColors[i % themeColors.length]
            const lessonCount = m.subModules.reduce((acc: number, sub: any) => acc + sub.lessons.length, 0)
            return {
              id: m.id,
              slug: m.slug,
              title: m.title,
              lessons: lessonCount,
              icon: m.iconUrl || '📚',
              cover: m.coverImgUrl,
              color: theme.color,
              iconBg: theme.iconBg
            }
          })
          setModules(formatted)
        }
      })
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F7F5F2',
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Fraunces:wght@600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .lang-btn { padding: 8px 20px; border-radius: 999px; border: 1.5px solid #E0D9F0; background: transparent; font-size: 14px; font-weight: 500; cursor: pointer; color: #555; transition: all 0.2s; }
        .lang-btn:hover { border-color: #6B4FA0; color: #6B4FA0; }
        .lang-btn.active { background: #6B4FA0; color: white; border-color: #6B4FA0; }
        .module-card { background: white; border-radius: 20px; cursor: pointer; transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1); border: 1.5px solid #F0EBF8; position: relative; overflow: hidden; display: flex; flex-direction: column; }
        .module-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(107,79,160,0.12); border-color: #C9B8E8; }
        .module-card-bg::before { content: ''; position: absolute; top: 0; right: 0; width: 80px; height: 80px; border-radius: 0 20px 0 80px; opacity: 0.4; transition: opacity 0.25s; }
        .module-card:hover .module-card-bg::before { opacity: 0.7; }
        .start-text { font-size: 12px; font-weight: 600; color: #6B4FA0; letter-spacing: 0.05em; text-transform: uppercase; display: flex; align-items: center; gap: 4px; margin-top: 16px; }
        .hero-card { background: linear-gradient(135deg, #6B4FA0 0%, #9B72CF 100%); border-radius: 28px; padding: 48px; color: white; position: relative; overflow: hidden; }
        .floating-badge { position: absolute; background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); border-radius: 16px; padding: 12px 18px; font-size: 13px; font-weight: 500; color: white; }
        .section-chip { display: inline-flex; align-items: center; gap: 6px; background: #EDE7F6; color: #6B4FA0; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 6px 14px; border-radius: 999px; margin-bottom: 14px; }
        .progress-bar { height: 4px; background: #EDE7F6; border-radius: 999px; overflow: hidden; margin-top: 10px; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #6B4FA0, #9B72CF); border-radius: 999px; }
        .avatar-ring { width: 40px; height: 40px; border-radius: 50%; border: 2.5px solid white; object-fit: cover; margin-left: -10px; background: linear-gradient(135deg, #9B72CF, #6B4FA0); display: flex; align-items: center; justify-content: center; font-size: 16px; }
        .stats-pill { display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.2); border-radius: 999px; padding: 6px 14px; font-size: 13px; color: white; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
        .fade-up-1 { animation: fadeUp 0.5s 0.1s ease both; }
        .fade-up-2 { animation: fadeUp 0.5s 0.2s ease both; }
        .fade-up-3 { animation: fadeUp 0.5s 0.3s ease both; }
      `}</style>
      
      {/* Navbar */}
      <StudentNavbar />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 100px' }}>

        {/* Hero Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, marginBottom: 48 }} className="fade-up">
          <div className="hero-card">
            {/* Decorative circles */}
            <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
            <div style={{ position: 'absolute', bottom: -60, left: -20, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 999, padding: '5px 14px', fontSize: 12, fontWeight: 600, marginBottom: 20, letterSpacing: '0.06em' }}>
                ✦ MINDFUL LEARNING
              </div>
              <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 48, fontWeight: 700, lineHeight: 1.15, marginBottom: 16, letterSpacing: '-0.02em' }}>
                What shall we<br />learn today?
              </h1>
              <p style={{ fontSize: 16, opacity: 0.85, lineHeight: 1.6, marginBottom: 28, maxWidth: 380 }}>
                Pick a language and start exploring! Learning made peaceful and fun for every child.
              </p>

              {/* Language Selector */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 32 }}>
                {languages.map(lang => (
                  <button key={lang} className={`lang-btn ${activeLanguage === lang ? 'active' : ''}`}
                    style={{ background: activeLanguage === lang ? 'white' : 'rgba(255,255,255,0.15)', color: activeLanguage === lang ? '#6B4FA0' : 'white', borderColor: activeLanguage === lang ? 'white' : 'rgba(255,255,255,0.3)' }}
                    onClick={() => setActiveLanguage(lang)}>
                    {lang}
                  </button>
                ))}
              </div>

              {/* Stats row */}
              <div style={{ display: 'flex', gap: 12 }}>
                <div className="stats-pill">📚 6 Modules</div>
                <div className="stats-pill">✦ 60+ Lessons</div>
                <div className="stats-pill">🤝 3 Languages</div>
              </div>
            </div>
          </div>

          {/* Right side card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Illustration card */}
            <div style={{ background: '#EDE7F6', borderRadius: 24, padding: 32, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ fontSize: 80 }} className="animate-float">📖</div>
              <p style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600, color: '#3B1F6B', marginTop: 16, textAlign: 'center' }}>
                Learning through all senses
              </p>
              <p style={{ fontSize: 13, color: '#7B5EA7', textAlign: 'center', marginTop: 6, lineHeight: 1.5 }}>
                Lip reading · Sign language<br />Images · Text
              </p>

              {/* Floating badges */}
              <div className="floating-badge" style={{ top: 16, right: 16, background: 'rgba(107,79,160,0.12)', borderColor: '#C9B8E8', color: '#6B4FA0', fontSize: 12 }}>
                ✦ New lesson!
              </div>
            </div>

            {/* Progress mini card */}
            <div style={{ background: 'white', borderRadius: 20, padding: '20px 24px', border: '1.5px solid #F0EBF8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#3B1F6B' }}>Today's Progress</span>
                <span style={{ fontSize: 12, color: '#9B72CF', fontWeight: 600 }}>3/6 done</span>
              </div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: '50%' }} /></div>
              <p style={{ fontSize: 12, color: '#888', marginTop: 8 }}>Keep going — halfway there! 🌟</p>
            </div>
          </div>
        </div>

        {/* Module Grid */}
        <div className="fade-up-1">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <div className="section-chip">
                <span>▦</span> Curriculum
              </div>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 700, color: '#1A0A2E', letterSpacing: '-0.02em' }}>
                Choose a Module
              </h2>
            </div>
            <div style={{ background: '#EDE7F6', color: '#6B4FA0', borderRadius: 999, padding: '6px 16px', fontSize: 13, fontWeight: 600 }}>
              6 Modules
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {modules.map((mod, i) => (
              <div key={mod.id} className="module-card fade-up"
                style={{ animationDelay: `${i * 0.07}s`, padding: 0 }}
                onClick={() => router.push(`/module/${mod.slug}`)}>
                
                {mod.cover ? (
                  <>
                    <div style={{ width: '100%', height: 160, backgroundImage: `url(${mod.cover})`, backgroundSize: 'cover', backgroundPosition: 'center', borderBottom: '1.5px solid #F0EBF8' }} />
                    <div style={{ padding: 24 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1A0A2E', marginBottom: 4, fontFamily: "'Fraunces', serif" }}>
                        {mod.title}
                      </h3>
                      <p style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>
                        {mod.lessons} lessons · Signs + Lip reading
                      </p>
                      <div className="start-text">
                        Start <span>→</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ padding: 28, position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div className="module-card-bg" style={{ '::before': { background: mod.color } } as any} />
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, position: 'relative', zIndex: 1 }}>
                      <div style={{ width: 52, height: 52, borderRadius: 16, background: mod.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
                        {mod.icon}
                      </div>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: '#F7F5F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>→</div>
                    </div>

                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1A0A2E', marginBottom: 4, fontFamily: "'Fraunces', serif", position: 'relative', zIndex: 1 }}>
                      {mod.title}
                    </h3>
                    <p style={{ fontSize: 12, color: '#888', marginBottom: 4, position: 'relative', zIndex: 1 }}>
                      {mod.lessons} lessons · Signs + Lip reading
                    </p>

                    <div className="progress-bar" style={{ marginTop: 'auto', marginBottom: 12, position: 'relative', zIndex: 1 }}>
                     <div className="progress-fill" style={{ width: '40%' }} />
                    </div>

                    <div className="start-text" style={{ position: 'relative', zIndex: 1 }}>
                      Start <span>→</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {modules.length === 0 && (
              <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', background: 'white', borderRadius: 24, border: '1.5px dashed #C9B8E8' }}>
                <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: '#1A0A2E' }}>Welcome to Alya!</h3>
                <p style={{ color: '#888', marginTop: 8, fontSize: 15 }}>No modules are published yet.</p>
                <div style={{ marginTop: 24 }}>
                  <Link href="/login" style={{ background: 'linear-gradient(135deg, #6B4FA0, #9B72CF)', color: 'white', padding: '12px 24px', borderRadius: 999, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>Login as Educator to Create Content →</Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="fade-up-2" style={{ marginTop: 40, background: 'white', borderRadius: 24, padding: '32px 40px', border: '1.5px solid #F0EBF8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: '#1A0A2E', marginBottom: 6 }}>
              Every child deserves a voice 💜
            </h3>
            <p style={{ fontSize: 14, color: '#888', lineHeight: 1.6 }}>
              Alya helps deaf and non-verbal children communicate through multimodal learning.
            </p>
          </div>
          <button onClick={() => router.push('/library')} style={{ background: 'linear-gradient(135deg, #6B4FA0, #9B72CF)', color: 'white', border: 'none', borderRadius: 14, padding: '14px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Start Learning →
          </button>
        </div>
      </div>
      
      <StudentBottomNav activeTab="Home" />
    </div>
  )
}