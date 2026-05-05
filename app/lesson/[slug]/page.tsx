'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useLessonMedia } from '@/client/hooks/useLessonMedia'
import { ArrowLeft, ArrowRight, Image as ImageIcon, Hand, Loader2 } from 'lucide-react'
import { AIChat } from '@/components/ai-chat'
export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string
  const [completing, setCompleting] = useState(false)

  const { lesson, loading, lipReadingUrl, conceptImageUrl, signLangUrl } = useLessonMedia(slug)

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#150a21]">
        <div className="text-white text-lg font-medium animate-pulse">Loading Lesson...</div>
      </div>
    )
  }

  const getYouTubeEmbedUrl = (input: string | null) => {
    if (!input) return ''
    try {
      if (input.includes('youtube.com/embed/')) return input
      const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
      const match = input.match(regex)
      return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1&loop=1&playlist=${match[1]}` : input
    } catch {
      return input
    }
  }

  const word = lesson?.wordText || 'WORD'
  const lipEmbed = getYouTubeEmbedUrl(lipReadingUrl)
  const signEmbed = getYouTubeEmbedUrl(signLangUrl)

  const handleNext = async () => {
    if (lesson?.id && !completing) {
      setCompleting(true)
      try {
        await fetch('/api/student/complete-lesson', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lessonId: lesson.id }),
        })
      } catch (error) {
        console.error('Failed to complete lesson:', error)
      }
    }
    router.push('/')
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#150a21] font-sans selection:bg-[var(--alya-purple)] selection:text-white">
      <div className="flex-1 flex flex-col h-full overflow-hidden pb-2 px-2">
      
      {/* HEADER BAR */}
      <header className="flex h-16 shrink-0 items-center justify-between px-4">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1.5 pl-3 pr-4 text-xs font-semibold text-white/90 transition hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </button>

        <div className="flex flex-col items-center">
          <h1 className="text-lg font-black tracking-widest text-white uppercase">{word}</h1>
          <div className="mt-1 flex gap-1">
            <div className="h-1 w-4 rounded-full bg-white"></div>
            <div className="h-1 w-1 rounded-full bg-white/20"></div>
            <div className="h-1 w-1 rounded-full bg-white/20"></div>
            <div className="h-1 w-1 rounded-full bg-white/20"></div>
            <div className="h-1 w-1 rounded-full bg-white/20"></div>
          </div>
        </div>

        <button 
          onClick={handleNext}
          disabled={completing}
          className="flex items-center gap-2 rounded-full bg-[#8b5ff5] py-1.5 pl-4 pr-3 text-xs font-bold text-white transition hover:bg-[#7a4ee5] shadow-[0_0_15px_rgba(139,95,245,0.4)] disabled:opacity-50"
        >
          {completing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Next'}
          <ArrowRight className="h-4 w-4" />
        </button>
      </header>

      {/* 4-PANEL GRID */}
      <div className="grid h-full w-full flex-1 grid-cols-2 grid-rows-2 gap-3 pb-2 pt-1 px-1">

        {/* Panel 1: LIP READING */}
        <div className="relative overflow-hidden rounded-[24px] bg-black shadow-lg">
          <div className="absolute left-4 top-4 z-10 rounded-lg bg-black/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
            Lip Reading
          </div>
          {lipEmbed ? (
            <iframe 
              src={lipEmbed} 
              className="absolute inset-0 h-full w-full border-none object-cover pointer-events-none" 
              allow="autoplay; encrypted-media" 
              allowFullScreen 
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-medium text-white/40">NO VIDEO ADDED</div>
          )}
        </div>

        {/* Panel 2: WORD (Image) */}
        <div className="relative overflow-hidden rounded-[24px] bg-[#fbf5ee] shadow-lg flex items-center justify-center p-8">
          <div className="absolute left-4 top-4 z-10 rounded-lg bg-[#e8dccb] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8c7457]">
            Word
          </div>
          {conceptImageUrl ? (
            <img src={conceptImageUrl} alt={word} className="h-full w-full object-contain drop-shadow-md" />
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded-[2rem] border-2 border-dashed border-[#dcc4a9] bg-transparent">
              <ImageIcon className="h-10 w-10 text-[#dcc4a9]" />
            </div>
          )}
        </div>

        {/* Panel 3: TEXT */}
        <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-[24px] bg-[#f8f9fc] shadow-lg">
          <div className="absolute left-4 top-4 z-10 rounded-lg bg-[#e2e8f0] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
            Text
          </div>
          <h2 className="mb-6 text-7xl md:text-8xl font-black text-[#1f2937] uppercase tracking-tight" style={{ fontFamily: 'var(--font-display), serif' }}>
            {word}
          </h2>
          <div className="flex gap-2 md:gap-3">
            {word.toUpperCase().split('').map((char, i) => (
              <div key={i} className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-xl bg-white text-xl md:text-2xl font-bold text-[var(--alya-purple)] shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-gray-100">
                {char}
              </div>
            ))}
          </div>
        </div>

        {/* Panel 4: SIGN LANGUAGE */}
        <div className="relative overflow-hidden rounded-[24px] bg-[#162130] shadow-lg flex items-center justify-center">
          <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
             <div className="rounded-lg bg-black/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
               Sign Language
             </div>
             <div className="rounded-full bg-[#1b4332] border border-[#2d6a4f] px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-[#4ade80]">
               Live View
             </div>
          </div>
          {signEmbed ? (
            <iframe 
              src={signEmbed} 
              className="absolute inset-0 h-full w-full border-none object-cover pointer-events-none" 
              allow="autoplay; encrypted-media" 
              allowFullScreen 
            />
          ) : (
            <div className="flex flex-col items-center justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-[1.5rem] border-2 border-dashed border-white/20 bg-white/5 mb-3">
                <Hand className="h-8 w-8 text-white/30" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#4f6786]">NO VIDEO ADDED</span>
            </div>
          )}
        </div>

      </div>
      </div>
      <AIChat />
    </div>
  )
}