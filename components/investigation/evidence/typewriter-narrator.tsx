'use client'

import React, { useState, useEffect } from 'react'

export function TypewriterNarrator({ text, speed = 12 }: { text: string; speed?: number }) {
  const [displayedText, setDisplayedText] = useState('')

  useEffect(() => {
    setDisplayedText('')
    if (!text) return

    let currentIndex = 0
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1))
        currentIndex++
      } else {
        clearInterval(interval)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed])

  const paragraphs = displayedText.split('\n\n')

  return (
    <div className="space-y-4 font-mono text-base lg:text-lg text-[#f4e8d8] leading-relaxed select-none">
      {paragraphs.map((p, idx) => (
        <p key={idx} className="tracking-wide">
          {p}
          {idx === paragraphs.length - 1 && displayedText.length < text.length && (
            <span className="inline-block w-2 h-4 ml-1 bg-[#d9a066] animate-pulse align-middle" />
          )}
        </p>
      ))}
    </div>
  )
}
