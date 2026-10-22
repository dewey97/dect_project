"""
Build the final hide-and-seek climax audio for Case 000.

Audio sequence:
1. Child voice counting "Năm, mười, mười lăm, hai mươi" (fading out) 
2. Silence + creaky door
3. Child voice "chín mươi, chín mươi lăm, một trăm" (constructed from clean syllables)
4. Super slam

All over atmosphere drone background.
"""

import numpy as np
import scipy.io.wavfile as wav
import scipy.signal as signal
import subprocess
import os
import tempfile

PROJECT_DIR = r"d:\code_world\dect_project"
TIKTOK_SOURCE = os.path.join(PROJECT_DIR, "tiktok_source.wav")
REAL_CREAK = os.path.join(PROJECT_DIR, "real_creak.wav")
SUPER_SLAM = os.path.join(PROJECT_DIR, "super_slam.wav")
ATMOSPHERE = os.path.join(PROJECT_DIR, "atmosphere_drone.wav")
OUTPUT_WAV = os.path.join(PROJECT_DIR, "final_climax.wav")
OUTPUT_MP3 = os.path.join(PROJECT_DIR, "public", "audio", "hide_and_seek_climax.mp3")

TARGET_SR = 44100


def read_wav_mono(path):
    """Read wav file and convert to mono float32 at TARGET_SR."""
    sr, data = wav.read(path)
    # Convert to float32
    if data.dtype == np.int16:
        data = data.astype(np.float32) / 32768.0
    elif data.dtype == np.int32:
        data = data.astype(np.float32) / 2147483648.0
    elif data.dtype == np.uint8:
        data = (data.astype(np.float32) - 128.0) / 128.0
    # Convert to mono
    if len(data.shape) > 1:
        data = data.mean(axis=1)
    # Resample if needed
    if sr != TARGET_SR:
        num_samples = int(len(data) * TARGET_SR / sr)
        data = signal.resample(data, num_samples)
    return data


def extract_segment(data, start_s, end_s):
    """Extract a segment from audio data."""
    start = int(start_s * TARGET_SR)
    end = int(end_s * TARGET_SR)
    return data[start:end]


def fade_out(data, fade_duration_s=0.5):
    """Apply fade out to end of audio."""
    fade_samples = int(fade_duration_s * TARGET_SR)
    if fade_samples > len(data):
        fade_samples = len(data)
    result = data.copy()
    fade = np.linspace(1.0, 0.0, fade_samples)
    result[-fade_samples:] *= fade
    return result


def fade_in(data, fade_duration_s=0.1):
    """Apply fade in to start of audio."""
    fade_samples = int(fade_duration_s * TARGET_SR)
    if fade_samples > len(data):
        fade_samples = len(data)
    result = data.copy()
    fade = np.linspace(0.0, 1.0, fade_samples)
    result[:fade_samples] *= fade
    return result


def crossfade_concat(a, b, crossfade_s=0.05):
    """Concatenate two audio segments with crossfade."""
    cf_samples = int(crossfade_s * TARGET_SR)
    if cf_samples > len(a) or cf_samples > len(b):
        return np.concatenate([a, b])
    
    result = np.zeros(len(a) + len(b) - cf_samples)
    result[:len(a)] = a
    # Crossfade region
    fade_out_curve = np.linspace(1.0, 0.0, cf_samples)
    fade_in_curve = np.linspace(0.0, 1.0, cf_samples)
    result[len(a)-cf_samples:len(a)] *= fade_out_curve
    result[len(a)-cf_samples:len(a)] += b[:cf_samples] * fade_in_curve
    result[len(a):] = b[cf_samples:]
    return result


def make_silence(duration_s):
    """Create silence."""
    return np.zeros(int(duration_s * TARGET_SR), dtype=np.float32)


def apply_wardrobe_effect(data, intensity=0.7):
    """Apply wardrobe acoustic effect - muffled with slight echo."""
    # Low-pass filter (muffled sound through wood)
    nyq = TARGET_SR / 2
    cutoff = 2500  # Hz - muffled but still intelligible
    b, a = signal.butter(4, cutoff / nyq, btype='low')
    filtered = signal.filtfilt(b, a, data)
    
    # Add slight echo (wardrobe resonance)
    delay_samples = int(0.08 * TARGET_SR)  # 80ms delay
    echo = np.zeros(len(filtered) + delay_samples)
    echo[:len(filtered)] = filtered
    echo[delay_samples:delay_samples+len(filtered)] += filtered * 0.25 * intensity
    
    # Second echo
    delay2 = int(0.15 * TARGET_SR)
    if delay2 < len(echo):
        echo2 = np.zeros(len(echo) + delay2)
        echo2[:len(echo)] = echo
        echo2[delay2:delay2+len(echo)] += echo * 0.12 * intensity
        echo = echo2
    
    return echo


def pitch_shift_simple(data, semitones):
    """Simple pitch shift by resampling."""
    factor = 2 ** (semitones / 12.0)
    # Resample to change pitch
    new_length = int(len(data) / factor)
    pitched = signal.resample(data, new_length)
    return pitched


def apply_volume_envelope(data, start_vol=1.0, end_vol=0.3):
    """Apply gradual volume change."""
    envelope = np.linspace(start_vol, end_vol, len(data))
    return data * envelope


def normalize(data, target_peak=0.9):
    """Normalize audio to target peak level."""
    peak = np.max(np.abs(data))
    if peak > 0:
        return data * (target_peak / peak)
    return data


def try_noise_reduce(data, sr):
    """Try to use noisereduce if available."""
    try:
        import noisereduce as nr
        # Use first 0.3s as noise profile (should be silence/ambient)
        noise_clip = data[:int(0.3 * sr)]
        reduced = nr.reduce_noise(y=data, sr=sr, y_noise=noise_clip, 
                                   prop_decrease=0.6, stationary=True)
        return reduced
    except Exception as e:
        print(f"  noisereduce failed: {e}, using original")
        return data


def build_syllable_90(tiktok_data):
    """
    Construct "chín mươi" from TikTok syllables.
    
    Strategy: Use "bốn mươi" (3.60-4.10s) as base, 
    pitch shift down slightly to change timbre.
    The word structure "X mươi" is the same pattern.
    """
    # "bốn mươi" at 3.60-4.10s - cleanest "mươi" ending
    bon_muoi = extract_segment(tiktok_data, 3.60, 4.10)
    # Pitch shift down 1 semitone to change character  
    chin_muoi = pitch_shift_simple(bon_muoi, -1.5)
    # Apply wardrobe effect
    chin_muoi = apply_wardrobe_effect(chin_muoi, intensity=0.8)
    return chin_muoi


def build_syllable_95(tiktok_data):
    """
    Construct "chín mươi lăm" - use "bốn mươi" + "lăm" from "mười lăm".
    """
    # "bốn mươi" at 3.60-4.10s
    bon_muoi = extract_segment(tiktok_data, 3.60, 4.10)
    chin_muoi = pitch_shift_simple(bon_muoi, -1.5)
    
    # "lăm" from "mười lăm" at ~1.35-1.65s
    lam = extract_segment(tiktok_data, 1.32, 1.65)
    lam = pitch_shift_simple(lam, -1.5)
    
    # Concat with tiny crossfade
    chin_muoi_lam = crossfade_concat(chin_muoi, lam, 0.04)
    chin_muoi_lam = apply_wardrobe_effect(chin_muoi_lam, intensity=0.8)
    return chin_muoi_lam


def build_syllable_100(tiktok_data):
    """
    Construct "một trăm" - pitch shift "mười" down as base for "một",
    and use the start of another syllable for "trăm".
    
    Actually: Use "hai mươi" (1.65-2.15s) reversed/modified significantly
    with heavy wardrobe effect so it sounds eerie and distorted.
    The horror aesthetic actually benefits from slight unnaturalness.
    """
    # Use "ba mươi" segment (2.65-3.10s), heavy pitch down
    ba_muoi = extract_segment(tiktok_data, 2.65, 3.10)
    mot_tram = pitch_shift_simple(ba_muoi, -3.0)  # Much lower pitch
    mot_tram = apply_wardrobe_effect(mot_tram, intensity=1.0)
    return mot_tram


def main():
    print("=" * 60)
    print("Building Final Hide-and-Seek Climax Audio")
    print("=" * 60)
    
    # === Load all source audio ===
    print("\n[1/7] Loading source audio files...")
    tiktok = read_wav_mono(TIKTOK_SOURCE)
    creak = read_wav_mono(REAL_CREAK)
    slam = read_wav_mono(SUPER_SLAM)
    drone = read_wav_mono(ATMOSPHERE)
    
    print(f"  TikTok: {len(tiktok)/TARGET_SR:.1f}s")
    print(f"  Creak: {len(creak)/TARGET_SR:.1f}s")
    print(f"  Slam: {len(slam)/TARGET_SR:.1f}s")
    print(f"  Drone: {len(drone)/TARGET_SR:.1f}s")
    
    # === PART 1: Counting to 20 with fade out ===
    print("\n[2/7] Extracting child voice counting to 20...")
    # Clean acapella: 0.0-2.15s = "Năm, mười, mười lăm, hai mươi"
    counting_20 = extract_segment(tiktok, 0.0, 2.20)
    
    # Try noise reduction for cleaner audio
    counting_20 = try_noise_reduce(counting_20, TARGET_SR)
    
    # Apply volume envelope: starts normal, fades to 30% by "hai mươi"
    counting_20 = apply_volume_envelope(counting_20, start_vol=0.85, end_vol=0.30)
    
    # Fade out the tail
    counting_20 = fade_out(counting_20, fade_duration_s=0.4)
    
    # Apply slight wardrobe muffle (child is hiding inside wardrobe)
    counting_20_processed = apply_wardrobe_effect(counting_20, intensity=0.4)
    counting_20_processed = normalize(counting_20_processed, 0.75)
    print(f"  Counting segment: {len(counting_20_processed)/TARGET_SR:.2f}s")
    
    # === PART 2: Creaky door ===
    print("\n[3/7] Processing door creak...")
    creak_processed = creak * 0.6  # Slightly quieter
    creak_processed = fade_in(creak_processed, 0.15)
    creak_processed = fade_out(creak_processed, 0.2)
    print(f"  Creak: {len(creak_processed)/TARGET_SR:.2f}s")
    
    # === PART 3: Construct 90, 95, 100 ===
    print("\n[4/7] Constructing '90, 95, 100' from child voice syllables...")
    
    seg_90 = build_syllable_90(tiktok)
    seg_95 = build_syllable_95(tiktok)
    seg_100 = build_syllable_100(tiktok)
    
    print(f"  '90' segment: {len(seg_90)/TARGET_SR:.2f}s")
    print(f"  '95' segment: {len(seg_95)/TARGET_SR:.2f}s") 
    print(f"  '100' segment: {len(seg_100)/TARGET_SR:.2f}s")
    
    # Normalize each
    seg_90 = normalize(seg_90, 0.5)
    seg_95 = normalize(seg_95, 0.6)
    seg_100 = normalize(seg_100, 0.75)  # Louder as tension builds
    
    # Add small gaps between numbers
    gap_short = make_silence(0.3)
    gap_medium = make_silence(0.5)
    
    counting_90_100 = np.concatenate([
        seg_90,
        gap_short,
        seg_95,
        gap_medium,
        seg_100,
    ])
    
    # Apply fade in to this section (voice emerges from silence)
    counting_90_100 = fade_in(counting_90_100, 0.2)
    print(f"  Combined 90-100: {len(counting_90_100)/TARGET_SR:.2f}s")
    
    # === PART 4: Super slam ===
    print("\n[5/7] Processing slam...")
    slam_processed = normalize(slam, 0.95)  # Nearly full volume for impact
    slam_processed = fade_out(slam_processed, 0.5)  # Let reverb tail decay
    print(f"  Slam: {len(slam_processed)/TARGET_SR:.2f}s")
    
    # === ASSEMBLE TIMELINE ===
    print("\n[6/7] Assembling final timeline...")
    
    # Timeline:
    # 0.0s: Start with brief silence
    # 0.3s: Counting "5, 10, 15, 20" (fading) ~2.5s
    # ~3.0s: Pause 1.5s
    # ~4.5s: Door creak ~2.2s
    # ~7.0s: Pause 0.8s  
    # ~7.8s: "90... 95... 100" ~3.5s
    # ~11.3s: Brief pause 0.3s
    # ~11.6s: SLAM ~3.2s
    # ~14.8s: Reverb tail / silence 1.2s
    # Total: ~16s
    
    silence_intro = make_silence(0.3)
    pause_after_count = make_silence(1.5)
    pause_after_creak = make_silence(0.8)
    pause_before_slam = make_silence(0.3)
    silence_outro = make_silence(1.2)
    
    # Concatenate all parts
    master = np.concatenate([
        silence_intro,
        counting_20_processed,
        pause_after_count,
        creak_processed,
        pause_after_creak,
        counting_90_100,
        pause_before_slam,
        slam_processed,
        silence_outro,
    ])
    
    print(f"  Master length: {len(master)/TARGET_SR:.2f}s")
    
    # === MIX WITH ATMOSPHERE DRONE ===
    # Loop/extend drone to match master length
    if len(drone) < len(master):
        repeats = (len(master) // len(drone)) + 1
        drone_extended = np.tile(drone, repeats)[:len(master)]
    else:
        drone_extended = drone[:len(master)]
    
    # Drone should be subtle background - 15% volume
    drone_mixed = drone_extended * 0.15
    
    # Apply fade in/out to drone
    drone_mixed = fade_in(drone_mixed, 1.0)
    drone_mixed = fade_out(drone_mixed, 2.0)
    
    # Mix
    final = master + drone_mixed
    
    # Final normalize
    final = normalize(final, 0.92)
    
    print(f"  Final with drone: {len(final)/TARGET_SR:.2f}s")
    
    # === EXPORT ===
    print("\n[7/7] Exporting...")
    
    # Save WAV
    wav_data = (final * 32767).astype(np.int16)
    wav.write(OUTPUT_WAV, TARGET_SR, wav_data)
    print(f"  WAV: {OUTPUT_WAV}")
    
    # Convert to MP3 with ffmpeg
    os.makedirs(os.path.dirname(OUTPUT_MP3), exist_ok=True)
    subprocess.run([
        "ffmpeg", "-y",
        "-i", OUTPUT_WAV,
        "-codec:a", "libmp3lame",
        "-b:a", "192k",
        "-ar", "44100",
        OUTPUT_MP3
    ], capture_output=True, text=True)
    print(f"  MP3: {OUTPUT_MP3}")
    
    # Verify
    if os.path.exists(OUTPUT_MP3):
        size = os.path.getsize(OUTPUT_MP3)
        print(f"\n{'=' * 60}")
        print(f"SUCCESS! Final audio: {size/1024:.1f} KB")
        print(f"Duration: {len(final)/TARGET_SR:.1f}s")
        print(f"{'=' * 60}")
    else:
        print("\nERROR: MP3 file was not created!")


if __name__ == "__main__":
    main()
