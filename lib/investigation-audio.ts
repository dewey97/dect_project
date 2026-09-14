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

  // === REAL SOUND EFFECTS ===

  /** Deep heartbeat — plays when unlocking a new investigation phase */
  public playHeartbeat(): void {
    this.play('heartbeat.mp3', 0.7)
  }

  /** Rubber stamp impact — plays when answering checkpoint correctly */
  public playStampSound(): void {
    this.play('stamp.mp3', 0.8)
  }

  /** Achievement jingle — plays on successful checkpoint unlock */
  public playUnlockJingle(): void {
    this.play('unlock_jingle.mp3', 0.5)
  }

  /** Glass break shimmer — plays on wrong answer / error feedback */
  public playGlassSound(): void {
    this.play('glass_break.mp3', 0.5)
  }

  /** Paper page flip — plays when opening documents, switching tabs */
  public playPaperRustle(): void {
    this.play('paper_rustle.mp3', 0.4)
  }

  /** Ceramic/pottery shattering — bình trà vỡ xoảng */
  public playCeramicShatterSound(): void {
    this.play('ceramic_shatter.mp3', 0.8)
  }

  /** Train horn & crossing bell — còi tàu diesel & chuông gác chắn */
  public playTrainHornAndBellSound(): void {
    this.play('train_horn.mp3', 0.6)
  }

  // === UTILITY: Droplet sound (kept as no-op for compatibility) ===
  public playSingleDroplet(): void { /* removed */ }

  /**
   * Preload all audio files for instant playback.
   * Call this once on user interaction to warm up the cache.
   */
  public preloadAll(): void {
    const files = [
      'heartbeat.mp3',
      'stamp.mp3',
      'unlock_jingle.mp3',
      'glass_break.mp3',
      'paper_rustle.mp3',
      'ceramic_shatter.mp3',
      'train_horn.mp3',
    ]
    files.forEach(f => this.getAudio(f))
  }
}

export const detectiveAudio = new DetectiveAudioSystem()
