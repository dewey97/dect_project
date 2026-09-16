"""Re-download better quality sound effects - longer, more audible versions."""
import subprocess
import os

SFX_DIR = r"d:\code_world\dect_project\public\audio\sfx"

def download(url, dest):
    subprocess.run(["curl.exe", "-L", "--user-agent",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "-o", dest, url],
        capture_output=True, text=True, timeout=30)
    return os.path.getsize(dest) if os.path.exists(dest) else 0

def to_mp3(src, dest, trim=None, volume=None):
    cmd = ["ffmpeg", "-y", "-i", src]
    if trim: cmd += ["-t", str(trim)]
    af = []
    if volume: af.append(f"volume={volume}")
    if af: cmd += ["-af", ",".join(af)]
    cmd += ["-codec:a", "libmp3lame", "-b:a", "128k", "-ar", "44100", dest]
    subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    return os.path.exists(dest) and os.path.getsize(dest) > 1000

# Better Mixkit IDs for each sound
SOUNDS = [
    # Heartbeat - need a longer one with multiple beats
    ("heartbeat", "https://assets.mixkit.co/active_storage/sfx/209/209.wav", 4.0, "1.2"),
    # Stamp - heavier impact  
    ("stamp", "https://assets.mixkit.co/active_storage/sfx/2039/2039.wav", 1.5, "1.5"),
    # Paper rustle - longer page turn
    ("paper_rustle", "https://assets.mixkit.co/active_storage/sfx/2581/2581.wav", 2.0, "1.3"),
    # Unlock jingle - keep current one, it's good at 1.9s
    # Glass break - keep current, 2.0s is fine
    # Ceramic shatter - keep current, 1.2s is ok
    # Train horn - keep current, 1.5s is ok
]

print("Re-downloading improved sounds...")
for name, url, trim, vol in SOUNDS:
    src = os.path.join(SFX_DIR, f"{name}_src2.wav")
    mp3 = os.path.join(SFX_DIR, f"{name}.mp3")
    
    print(f"\n[{name}]")
    size = download(url, src)
    print(f"  Downloaded: {size/1024:.1f} KB")
    
    if size > 5000:
        if to_mp3(src, mp3, trim, vol):
            mp3_size = os.path.getsize(mp3)
            print(f"  OK -> {mp3_size/1024:.1f} KB")
        else:
            print(f"  FAIL conversion")
    else:
        print(f"  FAIL download too small")
    
    # Cleanup
    if os.path.exists(src):
        os.remove(src)

# Verify all
print("\n=== ALL SFX FILES ===")
for f in sorted(os.listdir(SFX_DIR)):
    if f.endswith(".mp3"):
        path = os.path.join(SFX_DIR, f)
        size = os.path.getsize(path)
        # Get duration
        r = subprocess.run(["ffprobe", "-v", "quiet", "-show_entries", 
            "format=duration", "-of", "csv=p=0", path],
            capture_output=True, text=True)
        dur = r.stdout.strip()
        print(f"  {f}: {size/1024:.1f} KB, {dur}s")
