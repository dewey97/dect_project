// Detective Investigation Audio System — Real Sound Effects
// Uses pre-recorded audio files from public/audio/sfx/

class DetectiveAudioSystem {
  public isMuted: boolean = false
  private audioCache: Map<string, HTMLAudioElement> = new Map()

  /**
   * Get or create a cached Audio element for a given sound file.
   * Cloning allows overlapping playback of the same sound.
   */
  private getAudio(filename: string): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null

    const path = `/audio/sfx/${filename}`

    if (!this.audioCache.has(filename)) {
      const audio = new Audio(path)
      audio.preload = 'auto'
      this.audioCache.set(filename, audio)
    }

    // Clone so multiple plays can overlap
    const source = this.audioCache.get(filename)!
    const clone = source.cloneNode(true) as HTMLAudioElement
    return clone
  }

  /**
   * Play a sound file with optional volume (0-1).
   */
  private play(filename: string, volume: number = 0.6): void {
    if (this.isMuted) return
    const audio = this.getAudio(filename)
    if (!audio) return

    audio.volume = Math.min(1, Math.max(0, volume))
    audio.play().catch(() => {
      // Autoplay blocked — ignore silently
    })
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted
    return this.isMuted
  }

  // === REMOVED: Rain sound (user requested removal) ===
  // startRainSound / stopRainSound — NO LONGER AVAILABLE
  // These are kept as no-ops for backward compatibility
  public isRainPlaying: boolean = false
  public startRainSound(): void { /* removed */ }
  public stopRainSound(): void { /* removed */ }

  // === REMOVED: Typewriter click (user requested removal) ===
  // playTypewriterClick — NO LONGER AVAILABLE
  // Kept as no-op for backward compatibility
  public playTypewriterClick(): void { /* removed */ }

  // === UI BUTTON CLICK SFX: DISABLED PER USER REQUEST ===
  // Only voicemail and reinvestigation audio remain active.
  public playHeartbeat(): void { /* disabled */ }
  public playStampSound(): void { /* disabled */ }
  public playUnlockJingle(): void { /* disabled */ }
  public playGlassSound(): void { /* disabled */ }
  public playPaperRustle(): void { /* disabled */ }
  public playCeramicShatterSound(): void { /* disabled */ }
  public playTrainHornAndBellSound(): void { /* disabled */ }
  public playRadioBeep(): void { /* disabled */ }

  // === VOICEMAIL & NARRATIVE AUDIO (ACTIVE) ===

  /** Trần Thị Hà voicemail lúc 20:32 (lẫn tiếng còi tàu 68dB vạch trần hiện trường) */
  public playHaVoicemail(): void {
    this.play('ha_voicemail_2032_v3.mp3', 0.95)
  }

  /** Trần Thị Hà lời khai thẩm vấn 2016 bị dồn ép */
  public playHaInterrogation(): void {
    this.play('ha_interrogation_breakdown.mp3', 0.9)
  }

  // === UTILITY: Droplet sound (kept as no-op for compatibility) ===
  public playSingleDroplet(): void { /* removed */ }

  /**
   * Preload audio files.
   */
  public preloadAll(): void {
    const files = [
      'ha_voicemail_2032_v3.mp3',
      'ha_interrogation_breakdown.mp3'
    ]
    files.forEach(f => this.getAudio(f))
  }
}

export const detectiveAudio = new DetectiveAudioSystem()
