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

export default function LibraryPage() {
  const [modules, setModules] = useState<any[]>([])
  const router = useRouter()

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
        .module-card { background: white; border-radius: 20px; cursor: pointer; transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1); border: 1.5px solid #F0EBF8; position: relative; overflow: hidden; display: flex; flex-direction: column; }
        .module-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(107,79,160,0.12); border-color: #C9B8E8; }
        .module-card-bg::before { content: ''; position: absolute; top: 0; right: 0; width: 80px; height: 80px; border-radius: 0 20px 0 80px; opacity: 0.4; transition: opacity 0.25s; }
        .module-card:hover .module-card-bg::before { opacity: 0.7; }
        .start-text { font-size: 12px; font-weight: 600; color: #6B4FA0; letter-spacing: 0.05em; text-transform: uppercase; display: flex; align-items: center; gap: 4px; margin-top: 16px; }
        .section-chip { display: inline-flex; align-items: center; gap: 6px; background: #EDE7F6; color: #6B4FA0; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 6px 14px; border-radius: 999px; margin-bottom: 14px; }
        .progress-bar { height: 4px; background: #EDE7F6; border-radius: 999px; overflow: hidden; margin-top: 10px; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #6B4FA0, #9B72CF); border-radius: 999px; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
      `}</style>
      
      <StudentNavbar />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 100px' }}>
        <div className="fade-up">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
            <div>
              <div className="section-chip">
                <span>📚</span> Library
              </div>
              <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 40, fontWeight: 700, color: '#1A0A2E', letterSpacing: '-0.02em', marginBottom: 8 }}>
                Library
              </h1>
              <p style={{ fontSize: 16, color: '#888' }}>All available learning modules</p>
            </div>
            <div style={{ background: '#EDE7F6', color: '#6B4FA0', borderRadius: 999, padding: '8px 20px', fontSize: 14, fontWeight: 600 }}>
              {modules.length} Modules
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
                        START <span>→</span>
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

                    <div className="start-text" style={{ position: 'relative', zIndex: 1, marginTop: 'auto' }}>
                      START <span>→</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {modules.length === 0 && (
              <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', background: 'white', borderRadius: 24, border: '1.5px dashed #C9B8E8' }}>
                <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: '#1A0A2E' }}>Library is Empty</h3>
                <p style={{ color: '#888', marginTop: 8, fontSize: 15 }}>No modules have been published yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <StudentBottomNav activeTab="Lessons" />
    </div>
  )
}
