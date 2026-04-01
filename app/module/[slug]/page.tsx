import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { StudentBottomNav } from '@/components/StudentBottomNav'

export default async function ModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const mod = await prisma.module.findUnique({
    where: { slug },
    include: {
      subModules: {
        include: {
          lessons: {
            where: { isPublished: true },
            orderBy: { orderIndex: 'asc' },
            include: { media: { include: { mediaAsset: true } } }
          }
        }
      }
    }
  })

  if (!mod || !mod.isPublished) return redirect('/')

  // Increment view count
  await prisma.module.update({
    where: { id: mod.id },
    data: { viewCount: { increment: 1 } }
  }).catch(() => {})

  const lessons = mod.subModules.flatMap((s: any) => s.lessons)

  const getYouTubeEmbedUrl = (input: string | null) => {
    if (!input) return ''
    try {
      if (input.includes('youtube.com/embed/')) return input
      const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
      const match = input.match(regex)
      return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1&loop=1&playlist=${match[1]}` : ''
    } catch {
      return ''
    }
  }

  const getYoutubeThumbnail = (url: string | null) => {
    if (!url) return null;
    try {
      const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = url.match(regex);
      return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : url;
    } catch {
      return url
    }
  }

  const trailerEmbed = getYouTubeEmbedUrl(mod.previewVideoUrl)

  return (
    <div style={{ minHeight: '100vh', background: '#F7F5F2', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Fraunces:wght@600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .lesson-card { background: white; border-radius: 24px; padding: 20px; cursor: pointer; border: 1.5px solid #F0EBF8; transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1); display: flex; flex-direction: column; align-items: flex-start; text-decoration: none; }
        .lesson-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(107,79,160,0.12); border-color: #C9B8E8; }
        .start-btn { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: #6B4FA0; letter-spacing: 0.06em; text-transform: uppercase; margin-top: 14px; }
        .back-btn { display: inline-flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 500; color: #6B4FA0; background: white; border: 1.5px solid #E0D9F0; padding: 8px 18px; border-radius: 999px; cursor: pointer; text-decoration: none; }
        .back-btn:hover { background: #EDE7F6; }
        .img-placeholder { width: 100%; aspect-ratio: 1; background: linear-gradient(135deg, #F0EBF8, #E8E0F5); border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden; gap: 8px; margin-bottom: 14px; border: 1.5px dashed #C9B8E8; }
        .img-placeholder span { font-size: 11px; color: #9B72CF; font-weight: 500; }
        .bottom-nav-item { display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; padding: 8px 20px; border-radius: 16px; }
        .bottom-nav-item.active { background: #EDE7F6; }
        .nav-label { font-size: 11px; font-weight: 600; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .fade-card { animation: fadeUp 0.4s ease both; }
        .trailer-container { position: relative; width: 100%; padding-bottom: 56.25%; border-radius: 24px; overflow: hidden; background: #E8E0F5; margin-bottom: 40px; border: 2px solid #C9B8E8; box-shadow: 0 16px 32px rgba(107,79,160,0.15); }
        .trailer-container iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; }
      `}</style>

      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', background: 'rgba(247,245,242,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #EDE7F6', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/" className="back-btn">← Back</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #6B4FA0, #9B72CF)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontSize: 14, fontWeight: 700 }}>{mod.title.charAt(0)}</span>
          </div>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: '#3B1F6B' }}>{mod.title}</span>
        </div>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #EDE7F6, #D1C4E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #C9B8E8', fontSize: 12, fontWeight: 700, color: '#6B4FA0' }}>EN</div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 100px' }}>
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', background: '#EDE7F6', color: '#6B4FA0', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '5px 14px', borderRadius: 999, marginBottom: 12 }}>{mod.id === 'default' ? 'MODULE 1' : 'MODULE'}</div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 36, fontWeight: 700, color: '#1A0A2E', letterSpacing: '-0.02em', marginBottom: 8 }}>Choose a lesson to begin</h1>
          <div style={{ width: 48, height: 4, background: 'linear-gradient(90deg, #6B4FA0, #9B72CF)', borderRadius: 999 }} />
        </div>

        {trailerEmbed && (
           <div className="trailer-container fade-card">
              <iframe 
                src={trailerEmbed} 
                allow="autoplay; encrypted-media" 
                allowFullScreen 
              />
           </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {lessons.map((lesson: any, i: number) => {
            const imageMedia = lesson.media.find((m: any) => m.panelType === 'CONCEPT_IMAGE')
            let imageUrl = imageMedia?.mediaAsset?.cdnUrl
            imageUrl = getYoutubeThumbnail(imageUrl) // Extracts YT thumbnail if they accidentally pasted a video url!

            return (
              <Link key={lesson.slug} href={`/lesson/${lesson.slug}`} className="lesson-card fade-card" style={{ animationDelay: `${i * 0.07}s` }}>
                <div className="img-placeholder" style={imageUrl ? { border: 'none', background: 'transparent' } : {}}>
                  {imageUrl ? (
                    <img src={imageUrl} alt={lesson.wordText} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }} />
                  ) : (
                    <>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9B72CF" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="3"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <path d="m21 15-5-5L5 21"/>
                      </svg>
                      <span>No image</span>
                    </>
                  )}
                </div>
                <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: '#1A0A2E' }}>{lesson.wordText}</h3>
                <div className="start-btn">Start →</div>
              </Link>
            )
          })}

          {lessons.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', background: 'white', borderRadius: 24, border: '1.5px dashed #F0EBF8' }}>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: '#1A0A2E' }}>Coming Soon!</h3>
              <p style={{ color: '#888', marginTop: 8 }}>No lessons have been published for this module yet.</p>
            </div>
          )}
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
      <StudentBottomNav activeTab="Lessons" />
    </div>
  )
}