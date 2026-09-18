'use client'

import React from 'react'
import { detectiveAudio } from '@/lib/investigation-audio'
import { cn } from '@/lib/utils'

interface NoirInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  buttonLabel?: string
  onButtonClick?: () => void
  onEnterPress?: () => void
  playAudioOnClick?: boolean
  containerClassName?: string
}

export const NoirInput = React.forwardRef<HTMLInputElement, NoirInputProps>(
  (
    {
      label,
      buttonLabel,
      onButtonClick,
      onEnterPress,
      playAudioOnClick = true,
      containerClassName,
      className,
      onChange,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (playAudioOnClick) {
        detectiveAudio.playTypewriterClick()
      }
      onChange?.(e)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        onEnterPress?.()
      }
      onKeyDown?.(e)
    }

    return (
      <div className={cn('space-y-1.5', containerClassName)}>
        {label && (
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#d4a373]">
            {label}
          </label>
        )}
        <div className="flex gap-2 items-center">
          <input
            ref={ref}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={cn(
              'w-full px-3 py-2 bg-[#1e1711] border-2 border-[#3d2c1e] text-xs font-mono text-[#f4e8d8] focus:outline-none focus:border-[#d9a066] placeholder:text-[#ad9885]/50 transition-colors rounded-none shadow-inner',
              className
            )}
            {...props}
          />
          {buttonLabel && (
            <button
              type="button"
              onClick={() => {
                if (playAudioOnClick) detectiveAudio.playTypewriterClick()
                onButtonClick?.()
              }}
              className="px-4 py-2 bg-[#2c1d12] hover:bg-[#3d281a] border-2 border-[#593b25] text-[#d9a066] font-mono text-xs font-bold uppercase transition-all shrink-0 cursor-pointer shadow-sm active:scale-95"
            >
              {buttonLabel}
            </button>
          )}
        </div>
      </div>
    )
  }
)

NoirInput.displayName = 'NoirInput'
