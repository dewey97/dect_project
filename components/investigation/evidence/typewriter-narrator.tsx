'use client'

import React, { useState, useEffect, useRef } from 'react'

export function TypewriterNarrator({
  text,
  speed = 12,
  onComplete
}: {
  text: string
  speed?: number
  onComplete?: () => void
}) {
  const [displayedText, setDisplayedText] = useState('')
  const onCompleteRef = useRef(onComplete)
  const isCompleteRef = useRef(false)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    setDisplayedText('')
    isCompleteRef.current = false
    if (!text) return

    let currentIndex = 0
    const interval = setInterval(() => {
      if (isCompleteRef.current) {
        clearInterval(interval)
        return
      }

      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1))
        currentIndex++
      } else {
        isCompleteRef.current = true
        clearInterval(interval)
        onCompleteRef.current?.()
      }
    }, speed)

    // Global click listener: clicking anywhere on the screen instantly reveals full text
    const handleGlobalClick = () => {
      if (isCompleteRef.current) return
      isCompleteRef.current = true
      setDisplayedText(text)
      clearInterval(interval)
      onCompleteRef.current?.()
    }

    // Delay attaching event listener by 50ms to avoid capturing the button click that opened the story
    const listenerTimeout = setTimeout(() => {
      window.addEventListener('click', handleGlobalClick)
    }, 50)

    return () => {
      clearTimeout(listenerTimeout)
      clearInterval(interval)
      window.removeEventListener('click', handleGlobalClick)
    }
  }, [text, speed])

  const isTyping = text && displayedText.length < text.length
  const paragraphs = displayedText.split('\n\n')

  return (
    <div className="space-y-4 font-mono text-base lg:text-lg text-[#f4e8d8] leading-relaxed select-none">
      {paragraphs.map((p, idx) => (
        <p key={idx} className="tracking-wide">
          {p}
          {idx === paragraphs.length - 1 && isTyping && (
            <span className="inline-block w-2 h-4 ml-1 bg-[#d9a066] animate-pulse align-middle" />
          )}
        </p>
      ))}
    </div>
  )
}
