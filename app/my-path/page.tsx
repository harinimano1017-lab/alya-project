'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { StudentNavbar } from '@/components/StudentNavbar'
import { StudentBottomNav } from '@/components/StudentBottomNav'
import Link from 'next/link'

const themeColors = [
  { color: '#E8F5E9', iconBg: '#C8E6C9' },
  { color: '#FFF3E0', iconBg: '#FFE0B2' },
  { color: '#E0F2F1', iconBg: '#B2DFDB' },
  { color: '#FCE4EC', iconBg: '#F8BBD0' },
  { color: '#E8EAF6', iconBg: '#C5CAE9' },
  { color: '#E3F2FD', iconBg: '#BBDEFB' },
]

export default function MyPathPage() {
  const [inProgress, setInProgress] = useState<any[]>([])
  const [completed, setCompleted] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/my-path')
      .then(res => res.json())
      .then(data => {
        if (data.error === 'Unauthorized') {
          setError('Please login to view your path.')
          setLoading(false)
          return
        }
        if (data.success) {
          const formatData = (items: any[]) => items.map((m: any, i: number) => {
            const theme = themeColors[i % themeColors.length]
            return {
              ...m,
              color: theme.color,
              iconBg: theme.iconBg
            }
          })
          
          setInProgress(formatData(data.data.inProgressAndNotStarted))
          setCompleted(formatData(data.data.completed))
        }
      })
      .catch(err => {
        console.error('Failed to load my path', err)
      })
      .finally(() => {
        setLoading(false)
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
        .start-text { font-size: 12px; font-weight: 600; color: #6B4FA0; letter-spacing: 0.05em; text-transform: uppercase; display: flex; align-items: center; gap: 4px; margin-top: 16px; transition: color 0.2s; }
        .start-text:hover { color: #5333A0; }
        .section-chip { display: inline-flex; align-items: center; gap: 6px; background: #EDE7F6; color: #6B4FA0; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 6px 14px; border-radius: 999px; margin-bottom: 14px; }
        .progress-bar { height: 6px; background: #EDE7F6; border-radius: 999px; overflow: hidden; margin-top: 10px; width: 100%; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #6B4FA0, #9B72CF); border-radius: 999px; transition: width 0.4s ease; }
        .badge { font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 10px; border-radius: 999px; letter-spacing: 0.5px; }
        .badge-none { background: #F1F5F9; color: #64748B; border: 1px solid #E2E8F0; }
        .badge-progress { background: #F3E8FF; color: #7E22CE; border: 1px solid #E9D5FF; }
        .badge-done { background: #DCFCE7; color: #166534; border: 1px solid #BBF7D0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
      `}</style>
      
      <StudentNavbar />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 100px' }}>
        
        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-[#6B4FA0] border-t-transparent rounded-full" /></div>
        ) : error ? (
           <div className="text-center py-20 bg-white rounded-[24px] border-[1.5px] border-[#F0EBF8]">
              <h2 className="text-2xl font-bold text-[#1A0A2E] mb-4" style={{ fontFamily: "'Fraunces', serif" }}>{error}</h2>
              <Link href="/login" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #6B4FA0, #9B72CF)', color: 'white', padding: '12px 24px', borderRadius: 999, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>Login</Link>
           </div>
        ) : (
          <div className="fade-up">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <div className="section-chip">
                  <span>🗺️</span> Journey
                </div>
                <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 40, fontWeight: 700, color: '#1A0A2E', letterSpacing: '-0.02em', marginBottom: 8 }}>
                  My Learning Path
                </h1>
              </div>
            </div>

            {/* SECTION 1: IN PROGRESS / NOT STARTED */}
            {inProgress.length > 0 && (
              <div style={{ marginBottom: 48 }}>
                <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 700, color: '#3B1F6B', marginBottom: 20 }}>
                  In Progress / Not Started
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  {inProgress.map((mod, i) => {
                    const progressPct = mod.totalLessons > 0 ? (mod.completedCount / mod.totalLessons) * 100 : 0
                    const isStarted = mod.completedCount > 0
                    
                    return (
                      <div key={mod.id} className="module-card fade-up"
                        style={{ animationDelay: `${i * 0.07}s`, padding: 0 }}
                        onClick={() => router.push(`/module/${mod.slug}`)}>
                        <div style={{ padding: 28, position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
                          <div className="module-card-bg" style={{ '::before': { background: mod.color } } as any} />
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, position: 'relative', zIndex: 1 }}>
                            <div style={{ width: 52, height: 52, borderRadius: 16, background: mod.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
                              {mod.icon}
                            </div>
                            <span className={`badge ${isStarted ? 'badge-progress' : 'badge-none'}`}>
                              {isStarted ? 'In Progress' : 'Not Started'}
                            </span>
                          </div>

                          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1A0A2E', marginBottom: 4, fontFamily: "'Fraunces', serif", position: 'relative', zIndex: 1 }}>
                            {mod.title}
                          </h3>
                          
                          <div style={{ marginTop: 'auto', marginBottom: 12, position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888', marginBottom: 6, fontWeight: 500 }}>
                              <span>{mod.completedCount} / {mod.totalLessons} lessons done</span>
                            </div>
                            <div className="progress-bar">
                              <div className="progress-fill" style={{ width: `${progressPct}%` }} />
                            </div>
                          </div>

                          <div className="start-text" style={{ position: 'relative', zIndex: 1 }}>
                            Continue <span>→</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* SECTION 2: COMPLETED */}
            {completed.length > 0 && (
              <div>
                <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 700, color: '#166534', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  Completed ✅
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  {completed.map((mod, i) => (
                    <div key={mod.id} className="module-card fade-up"
                      style={{ animationDelay: `${i * 0.07}s`, padding: 0, opacity: 0.9 }}
                      onClick={() => router.push(`/module/${mod.slug}`)}>
                      <div style={{ padding: 28, position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <div className="module-card-bg" style={{ '::before': { background: mod.color } } as any} />
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, position: 'relative', zIndex: 1 }}>
                          <div style={{ width: 52, height: 52, borderRadius: 16, background: mod.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
                            {mod.icon}
                          </div>
                          <span className="badge badge-done">
                            Completed
                          </span>
                        </div>

                        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1A0A2E', marginBottom: 4, fontFamily: "'Fraunces', serif", position: 'relative', zIndex: 1 }}>
                          {mod.title}
                        </h3>
                        
                        <div style={{ marginTop: 'auto', marginBottom: 12, position: 'relative', zIndex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#166534', marginBottom: 6, fontWeight: 600 }}>
                            <span>All {mod.totalLessons} lessons done 🎉</span>
                          </div>
                          <div className="progress-bar">
                             <div className="progress-fill" style={{ width: '100%', background: '#22c55e' }} />
                          </div>
                        </div>

                        <div className="start-text" style={{ position: 'relative', zIndex: 1 }}>
                          Review <span>→</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {inProgress.length === 0 && completed.length === 0 && (
              <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', background: 'white', borderRadius: 24, border: '1.5px dashed #C9B8E8' }}>
                <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: '#1A0A2E' }}>Your Path is Empty</h3>
                <p style={{ color: '#888', marginTop: 8, fontSize: 15 }}>No modules have been published yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      <StudentBottomNav activeTab="Progress" />
    </div>
  )
}
