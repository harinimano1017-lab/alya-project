'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type PanelId = 'lip' | 'image' | 'text' | 'sign'


const lessonData = {
  word: 'CAT',
    lipReadingYouTubeId: '_LIP_READING_VIDEO_ID',
  signLanguageYouTubeId: '_SIGN_LANGUAGE_VIDEO_ID',
   conceptImageUrl: null as string | null,
}

export default function LessonPage() {
  const [minimized, setMinimized] = useState<Set<PanelId>>(new Set())
  const router = useRouter()

  const toggle = (id: PanelId) => {
    setMinimized(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const visible = (['lip','image','text','sign'] as PanelId[]).filter(id => !minimized.has(id))
  const mini = (['lip','image','text','sign'] as PanelId[]).filter(id => minimized.has(id))

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

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#1A0A2E', fontFamily: "'DM Sans', 'Segoe UI', sans-serif", overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:wght@700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .panel { position: relative; border-radius: 20px; overflow: hidden; transition: all 0.35s cubic-bezier(0.4,0,0.2,1); }
        .panel-label { position: absolute; top: 14px; left: 14px; display: flex; align-items: center; gap: 6px; background: rgba(0,0,0,0.18); backdrop-filter: blur(8px); padding: 5px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; z-index: 10; color: white; }
        .panel-label.dark-text { color: #333; background: rgba(0,0,0,0.08); }
        .close-btn { position: absolute; top: 12px; right: 12px; width: 28px; height: 28px; background: rgba(0,0,0,0.12); border: none; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; transition: all 0.2s; color: inherit; }
        .close-btn:hover { background: rgba(0,0,0,0.22); transform: scale(1.1); }
        .mini-pill { display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); border-radius: 999px; padding: 8px 18px; cursor: pointer; transition: all 0.2s; font-size: 12px; color: rgba(255,255,255,0.7); font-weight: 600; }
        .mini-pill:hover { background: rgba(255,255,255,0.14); }
        .live-badge { background: #2E7D32; color: white; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 999px; letter-spacing: 0.05em; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .pulse { animation: pulse 1.8s ease-in-out infinite; }
        @keyframes waveform { 0%,100%{transform:scaleY(0.4)} 50%{transform:scaleY(1)} }
        .wave { width: 3px; background: #9B72CF; border-radius: 999px; transform-origin: bottom; animation: waveform 0.9s ease-in-out infinite; }
        .placeholder-box { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; width: 100%; height: 100%; }
        .placeholder-label { font-size: 12px; font-weight: 500; opacity: 0.5; }
        .letter-box { width: 44px; height: 44px; background: white; border: 2px solid #E0D9F0; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; color: #6B4FA0; font-family: 'Fraunces', serif; }
      `}</style>

      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
        <button onClick={() => router.push('/module/animals')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 999, padding: '7px 16px', color: 'rgba(255,255,255,0.8)', fontSize: 13, cursor: 'pointer' }}>
          ← Previous
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: 'white', letterSpacing: '0.05em' }}>
            {lessonData.word}
          </span>
          <div style={{ display: 'flex', gap: 5 }}>
            {[0,1,2,3,4,5].map(i => (
              <div key={i} style={{ height: 6, width: i === 0 ? 20 : 6, borderRadius: 999, background: i === 0 ? 'white' : 'rgba(255,255,255,0.2)', transition: 'all 0.2s' }} />
            ))}
          </div>
        </div>

        <button onClick={() => router.push('/module/animals')} style={{ background: 'linear-gradient(135deg, #6B4FA0, #9B72CF)', border: 'none', borderRadius: 999, padding: '8px 22px', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          Next →
        </button>
      </div>

      {/* Grid */}
      <div style={{ flex: 1, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden', minHeight: 0 }}>

        {visible.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15 }}>All panels minimized</p>
            <button onClick={() => setMinimized(new Set())} style={{ background: 'linear-gradient(135deg, #6B4FA0, #9B72CF)', border: 'none', color: 'white', padding: '11px 26px', borderRadius: 999, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Restore All
            </button>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'grid', gap: 8, minHeight: 0, ...getGrid() }}>

            {/* ── PANEL A: LIP READING (YouTube) ── */}
            {!minimized.has('lip') && (
              <div className="panel" style={{ background: '#EBEBEB', gridColumn: visible.length === 3 && visible[0] === 'lip' ? 'span 2' : undefined }}>
                <div className="panel-label dark-text">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M8 12s1 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                  LIP READING
                </div>
                <button className="close-btn" style={{ color: '#333' }} onClick={() => toggle('lip')}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>

                
                {lessonData.lipReadingYouTubeId !== '_LIP_READING_VIDEO_ID' ? (
                  <iframe
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    src={`https://www.youtube.com/embed/${lessonData.lipReadingYouTubeId}?autoplay=1&loop=1&mute=0&controls=1&playlist=${lessonData.lipReadingYouTubeId}`}
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                ) : (
                  
                  <div className="placeholder-box" style={{ background: '#EBEBEB' }}>
                    <div style={{ width: 64, height: 64, background: '#D8D8D8', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M8 12s1 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                    </div>
                    <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 28 }}>
                      {[6,12,18,14,8,16,10,20,12,8].map((h, i) => (
                        <div key={i} className="wave" style={{ height: h, animationDelay: `${i * 0.09}s` }} />
                      ))}
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(107,79,160,0.1)', borderRadius: 999, padding: '4px 12px' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6B4FA0' }} className="pulse" />
                      <span style={{ fontSize: 11, color: '#6B4FA0', fontWeight: 700 }}>ADD YOUTUBE VIDEO</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── PANEL B: CONCEPT IMAGE (from DB) ── */}
            {!minimized.has('image') && (
              <div className="panel" style={{ background: '#FDF6ED' }}>
                <div className="panel-label" style={{ color: '#7A4A10', background: 'rgba(0,0,0,0.07)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7A4A10" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                  WORD
                </div>
                <button className="close-btn" style={{ color: '#7A4A10', background: 'rgba(0,0,0,0.07)' }} onClick={() => toggle('image')}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>

                
                <div className="placeholder-box" style={{ background: '#FDF6ED' }}>
                  {lessonData.conceptImageUrl ? (
                    <img
                      src={lessonData.conceptImageUrl}
                      alt={lessonData.word}
                      style={{ width: '60%', aspectRatio: '1', objectFit: 'contain', borderRadius: 20 }}
                    />
                  ) : (
                    <>
                      <div style={{ width: 120, height: 120, background: '#F0E0C8', borderRadius: 24, border: '2px dashed #D4A96A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D4A96A" strokeWidth="1.2">
                          <rect x="3" y="3" width="18" height="18" rx="3"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <path d="m21 15-5-5L5 21"/>
                        </svg>
                      </div>
                      <span className="placeholder-label" style={{ color: '#AA7040' }}>Upload image to database</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ── PANEL C: TEXT ── */}
            {!minimized.has('text') && (
              <div className="panel" style={{ background: '#F5F5F5' }}>
                <div className="panel-label dark-text">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
                  TEXT
                </div>
                <button className="close-btn" style={{ color: '#555', background: 'rgba(0,0,0,0.08)' }} onClick={() => toggle('text')}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>

                <div className="placeholder-box" style={{ background: '#F5F5F5' }}>
                  
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: 96, fontWeight: 700, color: '#2A2A2A', letterSpacing: '-0.03em', lineHeight: 1 }}>
                    {lessonData.word}
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                    {lessonData.word.split('').map((letter, i) => (
                      <div key={i} className="letter-box">{letter}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── PANEL D: SIGN LANGUAGE (YouTube) ── */}
            {!minimized.has('sign') && (
              <div className="panel" style={{ background: '#17232F' }}>
                <div className="panel-label">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v5"/><path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>
                  SIGN LANGUAGE
                  <span className="live-badge pulse">LIVE VIEW</span>
                </div>
                <button className="close-btn" onClick={() => toggle('sign')}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>

                
                {lessonData.signLanguageYouTubeId !== '_SIGN_LANGUAGE_VIDEO_ID' ? (
                  <iframe
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    src={`https://www.youtube.com/embed/${lessonData.signLanguageYouTubeId}?autoplay=1&loop=1&mute=1&controls=1&playlist=${lessonData.signLanguageYouTubeId}`}
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                ) : (
                  <div className="placeholder-box" style={{ background: '#17232F' }}>
                    <div style={{ width: 100, height: 100, background: 'rgba(255,255,255,0.06)', border: '1.5px dashed rgba(255,255,255,0.15)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2">
                        <path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v5"/>
                        <path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2"/>
                        <path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8"/>
                        <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
                      </svg>
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(91,163,217,0.12)', borderRadius: 999, padding: '4px 12px' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#5BA3D9' }} className="pulse" />
                      <span style={{ fontSize: 11, color: '#5BA3D9', fontWeight: 700 }}>ADD YOUTUBE VIDEO</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Minimized pills */}
        {mini.length > 0 && (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
            {mini.map(id => (
              <div key={id} className="mini-pill" onClick={() => toggle(id)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
                  <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
                </svg>
                {panelLabels[id]}
              </div>
            ))}
            {mini.length > 1 && (
              <div className="mini-pill" onClick={() => setMinimized(new Set())} style={{ color: '#9B72CF', borderColor: 'rgba(155,114,207,0.3)' }}>
                Restore All
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 24px', borderTop: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 500, letterSpacing: '0.04em' }}>
          LESSON MODULE 1 · Introduction to Consonants
        </div>
        <button onClick={() => router.push('/module/animals')} style={{ background: 'linear-gradient(135deg, #6B4FA0, #9B72CF)', border: 'none', color: 'white', padding: '8px 22px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          Next →
        </button>
      </div>
    </div>
  )
}