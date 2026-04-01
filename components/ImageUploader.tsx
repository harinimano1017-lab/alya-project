'use client'
import { useState } from 'react'
import { UploadCloud, Link as LinkIcon } from 'lucide-react'

export function ImageUploader({ name, label, defaultUrl = '' }: { name: string, label: string, defaultUrl?: string }) {
  const [mode, setMode] = useState<'upload' | 'url'>('upload')
  const [preview, setPreview] = useState<string | null>(defaultUrl || null)
  const [urlInput, setUrlInput] = useState(defaultUrl)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setPreview(URL.createObjectURL(file))
  }

  return (
    <div className="rounded-2xl border border-[var(--alya-purple-light)] bg-white p-5 shadow-sm mt-3">
      <div className="mb-4 flex items-center justify-between">
        <label className="text-sm font-bold text-[var(--alya-purple-dark)]">{label}</label>
        <div className="flex overflow-hidden rounded-lg border border-[var(--alya-purple-light)] text-xs font-semibold">
          <button type="button" onClick={() => setMode('upload')} className={`px-4 py-2 ${mode === 'upload' ? 'bg-[var(--alya-purple-light)] text-[var(--alya-purple-dark)]' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>Upload File</button>
          <button type="button" onClick={() => setMode('url')} className={`px-4 py-2 ${mode === 'url' ? 'bg-[var(--alya-purple-light)] text-[var(--alya-purple-dark)]' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>Paste URL</button>
        </div>
      </div>
      
      {mode === 'upload' ? (
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--alya-purple-light)] bg-gray-50 p-8 transition hover:border-[var(--alya-purple)] hover:bg-[#F0EBF8]">
          <UploadCloud className="mb-2 h-8 w-8 text-[var(--alya-purple)]" />
          <span className="text-sm font-medium text-[var(--alya-purple-dark)]">Click to choose an image</span>
          <span className="mt-1 text-xs text-gray-500">JPG, JPEG, PNG</span>
          <input type="file" name={name + 'File'} accept="image/png, image/jpeg, image/jpg" className="hidden" onChange={handleFile} />
        </label>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-[var(--alya-purple-light)] bg-white px-4 py-3 shadow-sm focus-within:border-[var(--alya-purple)] focus-within:ring-2 focus-within:ring-[var(--alya-purple)]/20 transition">
          <LinkIcon className="h-5 w-5 text-gray-400" />
          <input type="url" name={name + 'Url'} value={urlInput} onChange={e => { setUrlInput(e.target.value); setPreview(e.target.value) }} placeholder="https://" className="flex-1 bg-transparent text-sm text-[var(--alya-purple-dark)] outline-none" />
        </div>
      )}

      {preview && (
        <div className="mt-4 flex aspect-video w-full overflow-hidden rounded-xl border border-[var(--alya-purple-light)] bg-gray-50 items-center justify-center relative shadow-inner">
          <img src={preview} alt="Preview" className="h-full object-contain absolute inset-0 w-full" onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }} onLoad={(e) => {
            (e.target as HTMLImageElement).style.display = 'block';
          }} />
        </div>
      )}
    </div>
  )
}
