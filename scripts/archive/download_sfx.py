"""Download real sound effects from free sources (Mixkit, Pixabay CDN, Internet Archive)."""
import subprocess
import os
import sys

SFX_DIR = r"d:\code_world\dect_project\public\audio\sfx"
os.makedirs(SFX_DIR, exist_ok=True)

def download(url, dest, user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"):
    """Download file with curl.exe."""
    result = subprocess.run(
        ["curl.exe", "-L", "--user-agent", user_agent, "-o", dest, url],
        capture_output=True, text=True, timeout=30
    )
    size = os.path.getsize(dest) if os.path.exists(dest) else 0
    return size

def convert_to_mp3(src, dest, trim_seconds=None, volume=None):
    """Convert audio file to MP3 with optional trimming."""
    cmd = ["ffmpeg", "-y", "-i", src]
    if trim_seconds:
        cmd += ["-t", str(trim_seconds)]
    filters = []
    if volume:
        filters.append(f"volume={volume}")
    if filters:
        cmd += ["-af", ",".join(filters)]
    cmd += ["-codec:a", "libmp3lame", "-b:a", "128k", "-ar", "44100", dest]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    return os.path.exists(dest)

# === SOUND EFFECTS TO DOWNLOAD ===
# Using multiple sources for reliability

SOUNDS = [
    {
        "name": "heartbeat",
        "urls": [
            # Mixkit heartbeat  
            "https://assets.mixkit.co/active_storage/sfx/212/212.wav",
            # Pixabay CDN
            "https://cdn.pixabay.com/audio/2022/03/24/audio_0fba1a8e37.mp3",
        ],
        "trim": 2.5,
        "volume": "1.5",
    },
    {
        "name": "stamp",
        "urls": [
            # Mixkit heavy stamp
            "https://assets.mixkit.co/active_storage/sfx/2568/2568.wav",
            # Archive.org stamp
            "https://assets.mixkit.co/active_storage/sfx/2039/2039.wav",
        ],
        "trim": 1.0,
        "volume": None,
    },
    {
        "name": "unlock_jingle",
        "urls": [
            # Mixkit achievement bell
            "https://assets.mixkit.co/active_storage/sfx/2869/2869.wav",
            "https://assets.mixkit.co/active_storage/sfx/2018/2018.wav",
        ],
        "trim": 2.0,
        "volume": None,
    },
    {
        "name": "glass_break",
        "urls": [
            # Mixkit glass break
            "https://assets.mixkit.co/active_storage/sfx/2975/2975.wav",
            "https://assets.mixkit.co/active_storage/sfx/267/267.wav",
        ],
        "trim": 2.0,
        "volume": "0.7",
    },
    {
        "name": "paper_rustle",
        "urls": [
            # Mixkit paper
            "https://assets.mixkit.co/active_storage/sfx/2580/2580.wav",
            "https://assets.mixkit.co/active_storage/sfx/2553/2553.wav",
        ],
        "trim": 1.5,
        "volume": None,
    },
    {
        "name": "ceramic_shatter",
        "urls": [
            # Mixkit ceramic/plate crash
            "https://assets.mixkit.co/active_storage/sfx/2964/2964.wav",
            "https://assets.mixkit.co/active_storage/sfx/2975/2975.wav",
        ],
        "trim": 3.0,
        "volume": None,
    },
    {
        "name": "train_horn",
        "urls": [
            # Mixkit train horn
            "https://assets.mixkit.co/active_storage/sfx/2573/2573.wav",
            "https://assets.mixkit.co/active_storage/sfx/2416/2416.wav",
        ],
        "trim": 3.0,
        "volume": None,
    },
]

print("=" * 60)
print("Downloading Real Sound Effects")
print("=" * 60)

results = {}
for sound in SOUNDS:
    name = sound["name"]
    print(f"\n[{name}]")
    
    downloaded = False
    for i, url in enumerate(sound["urls"]):
        src_ext = ".wav" if url.endswith(".wav") else ".mp3" if url.endswith(".mp3") else ".ogg"
        src_file = os.path.join(SFX_DIR, f"{name}_src{src_ext}")
        mp3_file = os.path.join(SFX_DIR, f"{name}.mp3")
        
        print(f"  Trying URL {i+1}: {url[:80]}...")
        try:
            size = download(url, src_file)
        except Exception as e:
            print(f"  Error: {e}")
            continue
            
        if size < 5000:
            print(f"  Too small ({size} bytes), trying next...")
            continue
        
        print(f"  Downloaded: {size/1024:.1f} KB")
        
        # Convert to MP3
        success = convert_to_mp3(src_file, mp3_file, 
                                  trim_seconds=sound.get("trim"),
                                  volume=sound.get("volume"))
        if success:
            mp3_size = os.path.getsize(mp3_file)
            print(f"  OK Converted to MP3: {mp3_size/1024:.1f} KB")
            results[name] = mp3_size
            downloaded = True
            break
        else:
            print(f"  FAIL Conversion failed")
    
    if not downloaded:
        print(f"  FAIL - could not download {name}")
        results[name] = 0

# Clean up source files
print("\nCleaning up source files...")
for f in os.listdir(SFX_DIR):
    if "_src" in f:
        os.remove(os.path.join(SFX_DIR, f))

print(f"\n{'=' * 60}")
print("RESULTS")
print(f"{'=' * 60}")
success_count = 0
for name, size in results.items():
    status = "OK" if size > 0 else "FAIL"
    if size > 0:
        success_count += 1
    print(f"  {status} {name}.mp3: {size/1024:.1f} KB")

print(f"\n{success_count}/{len(results)} sounds downloaded successfully")
