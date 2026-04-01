'use client'
import { useState } from 'react'

export function LetterTilesInput() {
  const [word, setWord] = useState('')

  return (
    <>
      <div className="space-y-1.5 ml-8">
        <label htmlFor="wordText" className="block text-sm font-semibold text-[var(--alya-purple-dark)]">
          Target Word / Text
        </label>
        <input
          type="text"
          id="wordText"
          name="wordText"
          required
          autoComplete="off"
          value={word}
          onChange={(e) => setWord(e.target.value.toUpperCase())}
          placeholder="e.g. CAT"
          className="w-full text-lg uppercase font-bold rounded-xl border border-[var(--alya-purple-light)] bg-white px-4 py-3 text-[var(--alya-purple-dark)] outline-none transition focus:border-[var(--alya-purple)] focus:ring-2 focus:ring-[var(--alya-purple)]/20"
        />
        <p className="text-xs text-gray-500 mt-1 pb-2">Letter tiles will be automatically generated from this word.</p>

        {word.trim() && (
          <div className="pt-2">
            <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Student View Preview:</p>
            <div className="flex flex-wrap gap-2">
              {word.trim().split('').map((char, i) => (
                <div 
                  key={i} 
                  className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl text-2xl font-black shadow-sm ${
                    char === ' ' ? 'bg-transparent shadow-none w-4' : 'bg-[#1A0A3A] text-white border-b-4 border-[#1A0A3A]/50'
                  }`}
                >
                  {char}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
