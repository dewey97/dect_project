// Web Audio API Sound Synthesizer for Detective Noir Sound FX
// Zero external audio files required — 100% Web Audio API synthesized sounds

class DetectiveAudioSynth {
  private ctx: AudioContext | null = null
  private rainNode: AudioBufferSourceNode | null = null
  private rainGainNode: GainNode | null = null
  private dropletTimer: ReturnType<typeof setTimeout> | null = null
  public isMuted: boolean = false
  public isRainPlaying: boolean = false

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
    return this.ctx
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted
    if (this.isMuted) {
      this.stopRainSound()
    } else {
      this.startRainSound()
    }
    return this.isMuted
  }

  public playSingleDroplet() {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      // High pitched droplet 'tí tách' sound
      const startFreq = 1800 + Math.random() * 1600
      const endFreq = 600 + Math.random() * 400

      osc.type = 'sine'
      osc.frequency.setValueAtTime(startFreq, now)
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.025)

      const vol = 0.015 + Math.random() * 0.025
      gain.gain.setValueAtTime(vol, now)
      gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.028)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.03)
    } catch {}
  }

  private scheduleNextDroplet() {
    if (!this.isRainPlaying || this.isMuted) return
    const delay = 1200 + Math.random() * 2800
    this.dropletTimer = setTimeout(() => {
      this.playSingleDroplet()
      this.scheduleNextDroplet()
    }, delay)
  }

  public startRainSound() {
    if (this.isMuted || this.isRainPlaying) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const bufferSize = 2 * ctx.sampleRate
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const output = noiseBuffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1
      }

      const whiteNoise = ctx.createBufferSource()
      whiteNoise.buffer = noiseBuffer
      whiteNoise.loop = true

      // Filter noise to sound like soothing rain
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(850, ctx.currentTime)

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.035, ctx.currentTime)

      whiteNoise.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)

      whiteNoise.start()
      this.rainNode = whiteNoise
      this.rainGainNode = gain
      this.isRainPlaying = true

      this.scheduleNextDroplet()
    } catch {}
  }

  public stopRainSound() {
    if (this.rainNode) {
      try {
        this.rainNode.stop()
        this.rainNode.disconnect()
      } catch {}
      this.rainNode = null
    }
    if (this.dropletTimer) {
      clearTimeout(this.dropletTimer)
      this.dropletTimer = null
    }
    this.isRainPlaying = false
  }

  // Typewriter key click sound (Tách... Tách...)
  public playTypewriterClick() {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(1200 + Math.random() * 800, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.03)

      gain.gain.setValueAtTime(0.08, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.035)
    } catch {}
  }

  // Deep Heartbeat sound (Thùm... Thùm...)
  public playHeartbeat() {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime

      // Lub
      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(80, now)
      osc1.frequency.exponentialRampToValueAtTime(30, now + 0.15)
      gain1.gain.setValueAtTime(0.35, now)
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
      osc1.connect(gain1)
      gain1.connect(ctx.destination)
      osc1.start(now)
      osc1.stop(now + 0.16)

      // Dub
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(65, now + 0.22)
      osc2.frequency.exponentialRampToValueAtTime(25, now + 0.37)
      gain2.gain.setValueAtTime(0.25, now + 0.22)
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.37)
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.start(now + 0.22)
      osc2.stop(now + 0.38)
    } catch {}
  }

  // Archival Red Stamp Impact sound (Bộp...)
  public playStampSound() {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(220, now)
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.12)

      gain.gain.setValueAtTime(0.4, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.15)
    } catch {}
  }

  // Glass Shimmer / Sharp Clue sound
  public playGlassSound() {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(2400, now)
      osc.frequency.exponentialRampToValueAtTime(1800, now + 0.18)

      gain.gain.setValueAtTime(0.06, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.21)
    } catch {}
  }

  // Success Unlock Jingle (Trinh thám bóc tách)
  public playUnlockJingle() {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const notes = [261.63, 329.63, 392.0, 523.25] // C4, E4, G4, C5
      const now = ctx.currentTime

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + idx * 0.1)

        gain.gain.setValueAtTime(0.12, now + idx * 0.1)
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.3)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now + idx * 0.1)
        osc.stop(now + idx * 0.1 + 0.32)
      })
    } catch {}
  }

  // Paper Rustle / Book Page Flip Sound Effect
  public playPaperRustle() {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const bufferSize = ctx.sampleRate * 0.15 // 150ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
      }

      const noise = ctx.createBufferSource()
      noise.buffer = buffer

      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.setValueAtTime(1200, now)
      filter.Q.setValueAtTime(3, now)

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.08, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14)

      noise.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)

      noise.start(now)
      noise.stop(now + 0.15)
    } catch {}
  }
}

export const detectiveAudio = new DetectiveAudioSynth()
