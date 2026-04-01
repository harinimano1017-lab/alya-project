'use client'
import { useState, useRef } from 'react'
import { StudentBottomNav } from '@/components/StudentBottomNav'
import { useRouter } from 'next/navigation'

interface ProfileProps {
  profile: any
  stats: {
    lessonsCompleted: number
    modulesStarted: number
    streak: number
  }
  badges: any[]
}

export default function ProfileClient({ profile, stats, badges }: ProfileProps) {
  const [name, setName] = useState(profile.name)
  const [lang, setLang] = useState(profile.preferredLang || 'EN')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    setIsSaving(true)
    try {
      const res = await fetch('/api/student/profile/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (data.avatarUrl) {
        setAvatarUrl(data.avatarUrl)
        await saveProfile({ avatarUrl: data.avatarUrl })
      }
    } catch (err) {
      console.error(err)
    }
    setIsSaving(false)
  }

  const saveProfile = async (updates: any = {}) => {
    setIsSaving(true)
    try {
      await fetch('/api/student/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, preferredLang: lang, ...updates })
      })
      router.refresh()
    } catch (err) {
      console.error(err)
    }
    setIsSaving(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F0E8', paddingBottom: 100, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:wght@600;700&display=swap');
        * { box-sizing: border-box; }
        .card { background: white; border-radius: 24px; padding: 24px; box-shadow: 0 8px 32px rgba(107,79,160,0.06); margin-bottom: 24px; }
        .avatar-circle { width: 120px; height: 120px; border-radius: 50%; background: #6B46C1; color: white; display: flex; align-items: center; justify-content: center; font-size: 40px; font-weight: 700; margin: 0 auto; overflow: hidden; position: relative; cursor: pointer; border: 4px solid white; box-shadow: 0 10px 20px rgba(107,79,160,0.15); }
        .avatar-circle img { width: 100%; height: 100%; object-fit: cover; }
        .stat-card { background: #F9F7FB; border: 1.5px solid #F0EBF8; border-radius: 20px; padding: 20px; text-align: center; flex: 1; }
        .stat-num { font-size: 32px; font-weight: 700; color: #6B46C1; font-family: 'Fraunces', serif; margin-top: 8px; }
        .badge-box { background: white; border-radius: 20px; padding: 20px; border: 1.5px solid #F0EBF8; text-align: center; transition: all 0.3s; }
        .badge-icon { font-size: 48px; filter: grayscale(100%) opacity(0.3); transition: all 0.5s cubic-bezier(0.34,1.56,0.64,1); transform: scale(0.9); display: inline-block; }
        .badge-earned { border-color: #FBBF24; background: #FEF9C3; box-shadow: 0 8px 24px rgba(251,191,36,0.2); }
        .badge-earned .badge-icon { filter: grayscale(0%) opacity(1); transform: scale(1.1); filter: drop-shadow(0 4px 12px rgba(251,191,36,0.4)); }
        
        input[type="text"] { width: 100%; padding: 12px 16px; border: 2px solid #E0D9F0; border-radius: 12px; font-size: 16px; font-weight: 500; color: #1A0A2E; outline: none; background: #F9F7FB; transition: border-color 0.2s; }
        input[type="text"]:focus { border-color: #6B46C1; background: white; }
        
        .toggle-btn { padding: 10px 20px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .toggle-active { background: #6B46C1; color: white; }
        .toggle-inactive { background: #F0EBF8; color: #6B46C1; }
        @keyframes fadeUp { from {opacity:0;transform:translateY(10px)} to {opacity:1;transform:translateY(0)} }
      `}</style>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        
        {/* SECTION 1: AVATAR & IDENTITY */}
        <div style={{ textAlign: 'center', marginBottom: 48, animation: 'fadeUp 0.5s ease both' }}>
          <div className="avatar-circle" onClick={handleAvatarClick}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" />
            ) : (
              name.slice(0,2).toUpperCase()
            )}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 24, background: 'rgba(0,0,0,0.5)', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Edit
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
          </div>
          
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 36, fontWeight: 700, color: '#1A0A2E', marginTop: 16 }}>
            {name}
          </h1>
          <div style={{ background: '#EDE7F6', color: '#6B4Fa0', padding: '6px 16px', borderRadius: 999, fontSize: 12, fontWeight: 700, display: 'inline-block', marginTop: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {lang === 'TA' ? 'Tamil' : 'English'}
          </div>
        </div>

        {/* SECTION 2: MY STATS */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 40, animation: 'fadeUp 0.5s 0.1s ease both' }}>
          <div className="stat-card">
            <div style={{ fontSize: 13, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lessons<br/>Completed</div>
            <div className="stat-num">{stats.lessonsCompleted}</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: 13, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Modules<br/>Started</div>
            <div className="stat-num">{stats.modulesStarted}</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: 13, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current<br/>Streak</div>
            <div className="stat-num">{stats.streak} <span style={{fontSize: 20}}>🔥</span></div>
          </div>
        </div>

        {/* SECTION 3: BADGES & ACHIEVEMENTS */}
        <div style={{ marginBottom: 48, animation: 'fadeUp 0.5s 0.2s ease both' }}>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 700, color: '#1A0A2E', marginBottom: 20 }}>
            Achievements 🏆
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {badges.map(b => (
              <div key={b.id} className={`badge-box ${b.earned ? 'badge-earned' : ''}`}>
                <div className="badge-icon">{b.emoji}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: b.earned ? '#92400E' : '#444', marginTop: 16, marginBottom: 8, fontFamily: "'Fraunces', serif" }}>
                  {b.title}
                </h3>
                <p style={{ fontSize: 12, color: b.earned ? '#B45309' : '#888', lineHeight: 1.4 }}>
                  {b.desc}
                </p>
                {!b.earned && (
                  <div style={{ fontSize: 16, marginTop: 12, opacity: 0.5 }}>🔒</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: SETTINGS */}
        <div className="card" style={{ animation: 'fadeUp 0.5s 0.3s ease both' }}>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: '#1A0A2E', marginBottom: 24 }}>
            Profile Settings
          </h2>
          
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#444', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Child's Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter name" />
          </div>

          <div style={{ marginBottom: 32 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#444', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Preferred Language</label>
            <div style={{ display: 'flex', gap: 12 }}>
              <div 
                className={`toggle-btn ${lang === 'EN' ? 'toggle-active' : 'toggle-inactive'}`}
                onClick={() => setLang('EN')}
              >
                English
              </div>
              <div 
                className={`toggle-btn ${lang === 'TA' ? 'toggle-active' : 'toggle-inactive'}`}
                onClick={() => setLang('TA')}
              >
                Tamil
              </div>
            </div>
          </div>

          <button 
            onClick={() => saveProfile()}
            disabled={isSaving}
            style={{ width: '100%', background: '#1A0A2E', color: 'white', border: 'none', padding: '16px', borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: isSaving ? 'wait' : 'pointer', opacity: isSaving ? 0.7 : 1 }}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

      </div>

      <StudentBottomNav activeTab="Profile" />
    </div>
  )
}
