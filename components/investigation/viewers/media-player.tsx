'use client'

import { useState } from 'react'
import { Play, Pause, Square, Volume2, Mic } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AudioTrack {
  id: string
  title: string
  duration: string
  timestamp: string
  speakers: string
  waveformPoints: number[]
}

interface MediaPlayerProps {
  track: AudioTrack
}

export function MediaPlayer({ track }: MediaPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <div className="rounded-lg border border-border bg-card/65 p-4 flex flex-col gap-3 font-sans">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-primary/10 border border-primary/20 rounded text-primary">
          <Mic className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="font-mono text-[0.55rem] text-primary uppercase tracking-widest block">
            BĂNG GHI ÂM // ĐÃ LỌC TẠP ÂM
          </span>
          <h5 className="text-xs font-bold text-foreground truncate mt-0.5">{track.title}</h5>
          <span className="font-mono text-[0.6rem] text-muted-foreground uppercase">
            SPEAKERS: {track.speakers}
          </span>
        </div>
      </div>

      {/* Simulated Waveform Visualization */}
      <div className="h-12 bg-background/50 rounded border border-border/40 flex items-center justify-around px-4 mt-2">
        {track.waveformPoints.map((val, idx) => (
          <div
            key={idx}
            className={cn(
              'w-[3px] rounded-full transition-all duration-200',
              isPlaying ? 'bg-primary animate-pulse' : 'bg-muted-foreground/60'
            )}
            style={{
              height: `${val}%`,
              animationDelay: `${idx * 0.05}s`,
            }}
          />
        ))}
      </div>

      {/* Audio Player Controls */}
      <div className="flex items-center justify-between mt-1 pt-2 border-t border-border/20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/95 transition-colors"
          >
            {isPlaying ? <Pause className="size-4 fill-primary-foreground" /> : <Play className="size-4 fill-primary-foreground ml-0.5" />}
          </button>
          
          <span className="font-mono text-xs text-muted-foreground">
            {isPlaying ? '0:12' : '0:00'} / {track.duration}
          </span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[0.55rem] text-muted-foreground">
          <Volume2 className="size-3.5 text-muted-foreground" />
          <span>KÊNH ÂM THANH GỐC</span>
        </div>
      </div>
    </div>
  )
}
