'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'

export function YouTubePreviewInput({ 
  name, 
  id, 
  defaultValue = '', 
  placeholder = 'https://youtube.com/watch?v=...', 
  className 
}: { 
  name: string, 
  id: string, 
  defaultValue?: string, 
  placeholder?: string, 
  className?: string 
}) {
  const [url, setUrl] = useState(defaultValue)

  // Extract standard or embed youtube ID
  const getOutputUrl = (input: string) => {
    if (!input) return ''
    try {
      if (input.includes('youtube.com/embed/')) return input
      
      const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
      const match = input.match(regex)
      return match ? `https://www.youtube.com/embed/${match[1]}` : input
    } catch {
      return input
    }
  }

  const outputUrl = getOutputUrl(url)
  const isYoutube = outputUrl.includes('youtube.com/embed/')

  return (
    <div className="space-y-3">
      <input
        type="url"
        id={id}
        name={name}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder={placeholder}
        className={className}
      />
      
      {url ? (
        <div className="mt-2 rounded-xl overflow-hidden border border-[var(--alya-purple-light)] bg-gray-50 aspect-video relative flex items-center justify-center">
          {isYoutube ? (
            <iframe
              src={outputUrl}
              className="w-full h-full absolute inset-0 border-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex flex-col items-center text-gray-400 p-4 text-center">
              <Play className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-xs font-medium">Valid YouTube URL required for preview</p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
