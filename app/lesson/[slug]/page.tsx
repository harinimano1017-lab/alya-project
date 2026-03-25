'use client'
import { useParams, useRouter } from 'next/navigation'
import { useLessonMedia } from '@/client/hooks/useLessonMedia'
import { usePanelStore, PanelId } from '@/store/panelStore'
import { useLessonStore } from '@/store/lessonStore'
import { useEffect } from 'react'

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string

  const { lesson, loading, lipReadingUrl, conceptImageUrl, signLangUrl } = useLessonMedia(slug)
  const { minimized, togglePanel, restoreAll } = usePanelStore()
  const { setLesson, nextLesson, prevLesson } = useLessonStore()

  useEffect(() => {
    if (lesson) setLesson(lesson.slug, lesson.wordText)
  }, [lesson])

  const allPanels: PanelId[] = ['lip', 'image', 'text', 'sign']
  const visible = allPanels.filter((id) => !minimized.has(id))
  const mini = allPanels.filter((id) => minimized.has(id))

  const panelLabels: Record<PanelId, string> = {
    lip: 'Lip Reading',
    image: 'Word',
    text: 'Text',
    sign: 'Sign Language',
  }

  const getGrid = () => {
    const c = visible.length
    if (c === 4) return { gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr' }
    if (c === 3) return { gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr' }
    if (c === 2) return { gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr' }
    return { gridTemplateColumns: '1fr', gridTemplateRows: '1fr' }
  }

  const handleNext = () => {
    const next = nextLesson()
    if (next) router.push(`/lesson/${next}`)
    else router.push(`/module/${lesson?.subModule?.slug ?? 'animals'}`)
  }

  const handlePrev = () => {
    const prev = prevLesson()
    if (prev) router.push(`/lesson/${prev}`)
    else router.back()
  }

  if (loading) {
    return (
      <div style={{ height: '100vh', background: '#1A0A2E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, fontFamily: 'DM Sans, sans-serif' }}>
          Loading lesson...
        </div>
      </div>
    )
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#1A0A2E', fontFamily: "'DM Sans', sans-serif", overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:wght@700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .panel { position: relative; border-radius: 20px; overflow: hidden; transition: all 0.35s cubic-bezier(0.4,0,0.2,1); }
        .panel-label { position: absolute; top: 14px; left: 14px; display: flex; align-items: center; gap: 6px; background: rgba(0,0,0,0.18); backdrop-filter: blur(8px); padding: 5px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; z-index: 10; color: white; }
        .panel-label.dark { color: #333; background: rgba(0,0,0,0.08); }
        .close-btn { position: absolute; top: 12px; right: 12px; width: 28px; height: 28px; background: rgba(0,0,0,0.12); border: none; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; transition: all 0.2s; }
        .close-btn:hover { background: rgba(0,0,0,0.22); transform: scale(1.1); }
        .mini-pill { display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); border-radius: 999px; padding: 8px 18px; cursor: pointer; transition: all 0.2s; font-size: 12px; color: rgba(255,255,255,0.7); font-weight: 600; }
        .mini-pill:hover { background: rgba(255,255,255,0.14); }
        .live-badge { background: #2E7D32; color: white; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 999px; }
        .center-box { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; width: 100%; height: 100%; }
        .letter-box { width: 44px; height: 44px; background: white; border: 2px solid #E0D9F0; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; color: #6B4FA0; font-family: 'Fraunces', serif; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .pulse { animation: pulse 1.8s ease-in-out infinite; }
        @keyframes wave { 0%,100%{transform:scaleY(0.4)} 50%{transform:scaleY(1)} }
        .wave { width: 3px; background: #9B72CF; border-radius: 999px; transform-origin: bottom; animation: wave 0.9s ease-in-out infinite; }
      `}</style>

      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
        <button onClick={handlePrev} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 999, padding: '7px 16px', color: 'rgba(255,255,255,0.8)', fontSize: 13, cursor: 'pointer' }}>
          ← Previous
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: 'white', letterSpacing: '0.05em' }}>
            {lesson?.wordText ?? slug.toUpperCase()}
          </span>
          <div style={{ display: 'flex', gap: 5 }}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ height: 6, width: i === 0 ? 20 : 6, borderRadius: 999, background: i === 0 ? 'white' : 'rgba(255,255,255,0.2)' }} />
            ))}
          </div>
        </div>

        <button onClick={handleNext} style={{ background: 'linear-gradient(135deg, #6B4FA0, #9B72CF)', border: 'none', borderRadius: 999, padding: '8px 22px', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          Next →
        </button>
      </div>

      {/* Grid */}
      <div style={{ flex: 1, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden', minHeight: 0 }}>
        {visible.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15 }}>All panels minimized</p>
            <button onClick={restoreAll} style={{ background: 'linear-gradient(135deg, #6B4FA0, #9B72CF)', border: 'none', color: 'white', padding: '11px 26px', borderRadius: 999, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Restore All
            </button>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'grid', gap: 8, minHeight: 0, ...getGrid() }}>

            {/* PANEL A — LIP READING */}
            {!minimized.has('lip') && (
              <div className="panel" style={{ background: '#EBEBEB' }}>
                <div className="panel-label dark">LIP READING</div>
                <button className="close-btn" style={{ color: '#333' }} onClick={() => togglePanel('lip')}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
                {lipReadingUrl ? (
                  <iframe style={{ width: '100%', height: '100%', border: 'none' }}
                    src={`${lipReadingUrl}&mute=0`}
                    allow="autoplay; encrypted-media" allowFullScreen />
                ) : (
                  <div className="center-box" style={{ background: '#EBEBEB' }}>
                    <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 28 }}>
                      {[6, 12, 18, 14, 8, 16, 10, 20, 12, 8].map((h, i) => (
                        <div key={i} className="wave" style={{ height: h, animationDelay: `${i * 0.09}s` }} />
                      ))}
                    </div>
                    <span style={{ fontSize: 11, color: '#6B4FA0', fontWeight: 700 }}>NO VIDEO ADDED</span>
                  </div>
                )}
              </div>
            )}

            {/* PANEL B — CONCEPT IMAGE */}
            {!minimized.has('image') && (
              <div className="panel" style={{ background: '#FDF6ED' }}>
                <div className="panel-label" style={{ color: '#7A4A10', background: 'rgba(0,0,0,0.07)' }}>WORD</div>
                <button className="close-btn" style={{ color: '#7A4A10', background: 'rgba(0,0,0,0.07)' }} onClick={() => togglePanel('image')}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
                <div className="center-box" style={{ background: '#FDF6ED' }}>
                  {conceptImageUrl ? (
                    <img src={conceptImageUrl} alt={lesson?.wordText} style={{ width: '60%', aspectRatio: '1', objectFit: 'contain', borderRadius: 20 }} />
                  ) : (
                    <div style={{ width: 120, height: 120, background: '#F0E0C8', borderRadius: 24, border: '2px dashed #D4A96A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D4A96A" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PANEL C — TEXT */}
            {!minimized.has('text') && (
              <div className="panel" style={{ background: '#F5F5F5' }}>
                <div className="panel-label dark">TEXT</div>
                <button className="close-btn" style={{ color: '#555', background: 'rgba(0,0,0,0.08)' }} onClick={() => togglePanel('text')}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
                <div className="center-box" style={{ background: '#F5F5F5' }}>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: 96, fontWeight: 700, color: '#2A2A2A', letterSpacing: '-0.03em', lineHeight: 1 }}>
                    {lesson?.wordText ?? slug.toUpperCase()}
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                    {(lesson?.wordText ?? slug.toUpperCase()).split('').map((letter, i) => (
                      <div key={i} className="letter-box">{letter}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PANEL D — SIGN LANGUAGE */}
            {!minimized.has('sign') && (
              <div className="panel" style={{ background: '#17232F' }}>
                <div className="panel-label">
                  SIGN LANGUAGE
                  <span className="live-badge pulse">LIVE VIEW</span>
                </div>
                <button className="close-btn" onClick={() => togglePanel('sign')}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
                {signLangUrl ? (
                  <iframe style={{ width: '100%', height: '100%', border: 'none' }}
                    src={`${signLangUrl}&mute=1`}
                    allow="autoplay; encrypted-media" allowFullScreen />
                ) : (
                  <div className="center-box" style={{ background: '#17232F' }}>
                    <div style={{ width: 100, height: 100, background: 'rgba(255,255,255,0.06)', border: '1.5px dashed rgba(255,255,255,0.15)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2"><path d="M18 11V6a2 2 0 0 0-4 0v5"/><path d="M14 10V4a2 2 0 0 0-4 0v2"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-16 0v-5"/></svg>
                    </div>
                    <span style={{ fontSize: 11, color: '#5BA3D9', fontWeight: 700 }}>NO VIDEO ADDED</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Minimized pills */}
        {mini.length > 0 && (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
            {mini.map((id) => (
              <div key={id} className="mini-pill" onClick={() => togglePanel(id)}>
                {panelLabels[id]}
              </div>
            ))}
            {mini.length > 1 && (
              <div className="mini-pill" onClick={restoreAll} style={{ color: '#9B72CF' }}>
                Restore All
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 24px', borderTop: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 500, letterSpacing: '0.04em' }}>
          {lesson?.subModule?.module?.title ?? 'LESSON MODULE 1'} · {lesson?.subModule?.title ?? ''}
        </div>
        <button onClick={handleNext} style={{ background: 'linear-gradient(135deg, #6B4FA0, #9B72CF)', border: 'none', color: 'white', padding: '8px 22px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          Next →
        </button>
      </div>
    </div>
  )
}