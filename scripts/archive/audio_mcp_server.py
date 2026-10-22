"""
Detective Audio MCP Server for Case #000 (and future cases) in dect_project.
Powered by FastMCP, Edge-TTS, and FFmpeg acoustic processing.

Capabilities:
1. generate_investigation_voice: Generate authentic Vietnamese character voices (detective, suspect, child, witness)
   with acoustic simulation (phone call 113, cassette tape interrogation, police radio, wardrobe resonance).
2. process_acoustic_environment: Transform any audio with room acoustics (wardrobe, hallway, muffled).
3. mix_scene_soundscape: Layer voice, SFX (creaks, slams, ceramics), and dark ambient background drone.
4. list_case_audio_assets: List and audit all audio assets across runtime and source catalogs.
"""

import os
import sys
import json
import asyncio
import subprocess

# Ensure UTF-8 output streams on Windows
if sys.platform == "win32":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8")

import edge_tts
from mcp.server.fastmcp import FastMCP

# Initialize FastMCP server
mcp = FastMCP("detective-audio")

PROJECT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DOCS_AUDIO_DIR = os.path.join(PROJECT_DIR, "docs", "cases", "case_000", "05_audio")
PUBLIC_SFX_DIR = os.path.join(PROJECT_DIR, "public", "audio", "sfx")
PUBLIC_AUDIO_DIR = os.path.join(PROJECT_DIR, "public", "audio")

# Preset character profiles for Case #000
VOICE_PROFILES = {
    "female_suspect": {
        "voice": "vi-VN-HoaiMyNeural",
        "rate": "-6%",
        "pitch": "-3Hz",
        "desc": "Trần Thị Hà / Lời khai nghi phạm (lạnh lùng, điềm tĩnh hoặc kìm nén)"
    },
    "female_maid": {
        "voice": "vi-VN-HoaiMyNeural",
        "rate": "-14%",
        "pitch": "-5Hz",
        "desc": "Bà giúp việc / Người lớn tuổi (run rẩy, bất an, sợ hãi)"
    },
    "child_eerie": {
        "voice": "vi-VN-HoaiMyNeural",
        "rate": "-12%",
        "pitch": "+15Hz",
        "desc": "Giọng trẻ em đếm trốn tìm / hồi tưởng hiện trường (ám ảnh, ngắt quãng)"
    },
    "male_detective": {
        "voice": "vi-VN-NamMinhNeural",
        "rate": "-2%",
        "pitch": "-2Hz",
        "desc": "Điều tra viên / Thẩm vấn viên chính (nghiêm nghị, quyết đoán)"
    },
    "male_witness": {
        "voice": "vi-VN-NamMinhNeural",
        "rate": "+2%",
        "pitch": "+0Hz",
        "desc": "Nhân chứng nam / Hàng xóm phố Bờ Sông (hồi hộp, bối rối)"
    },
    "operator_113": {
        "voice": "vi-VN-NamMinhNeural",
        "rate": "+5%",
        "pitch": "+2Hz",
        "desc": "Trực ban tổng đài cảnh sát 113 tiếp nhận tin báo"
    }
}

STYLE_FILTERS = {
    "clean": "",
    "phone_call_113": "highpass=f=350,lowpass=f=3200,volume=1.2,acontrast=30",
    "police_radio": "highpass=f=450,lowpass=f=3000,volume=1.3,aecho=0.8:0.4:30:0.2",
    "cassette_tape_2016": "highpass=f=220,lowpass=f=4500,volume=1.1,flanger=delay=1.5:depth=0.5:speed=0.2",
    "wardrobe_muffled": "lowpass=f=2200,highpass=f=200,aecho=0.8:0.7:50|90:0.35|0.2",
    "empty_mansion_hall": "aecho=0.8:0.8:60|120|240:0.4|0.25|0.15,lowpass=f=6000"
}


def _resolve_target_path(filename: str, location: str = "sfx") -> str:
    """Resolve destination absolute path."""
    if not filename.endswith(".mp3"):
        filename = f"{filename}.mp3"
    
    if location == "sfx":
        os.makedirs(PUBLIC_SFX_DIR, exist_ok=True)
        return os.path.join(PUBLIC_SFX_DIR, filename)
    elif location == "public_audio":
        os.makedirs(PUBLIC_AUDIO_DIR, exist_ok=True)
        return os.path.join(PUBLIC_AUDIO_DIR, filename)
    elif location == "case_source":
        os.makedirs(DOCS_AUDIO_DIR, exist_ok=True)
        return os.path.join(DOCS_AUDIO_DIR, filename)
    else:
        os.makedirs(PUBLIC_SFX_DIR, exist_ok=True)
        return os.path.join(PUBLIC_SFX_DIR, filename)


def _get_audio_duration(file_path: str) -> float:
    """Get duration of audio file in seconds via ffprobe."""
    try:
        cmd = [
            "ffprobe", "-v", "error", "-show_entries",
            "format=duration", "-of", "default=noprint_wrappers=1:nokey=1",
            file_path
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return round(float(result.stdout.strip()), 2)
    except Exception:
        return 0.0


@mcp.tool()
async def generate_investigation_voice(
    text: str,
    character: str = "female_suspect",
    acoustic_style: str = "clean",
    output_filename: str = "testimony_output.mp3",
    target_folder: str = "sfx"
) -> str:
    """
    Generate authentic Vietnamese voice acting for investigation testimonies, 113 calls, or eerie hide-and-seek whispers.
    
    Args:
        text: Vietnamese speech script to generate (e.g. "...Tôi không hề chạm vào chiếc bình men lam đó...").
        character: Voice profile choice:
            - 'female_suspect': Trần Thị Hà (chilling, controlled, suspect)
            - 'female_maid': Bà giúp việc (trembling, fearful, elderly)
            - 'child_eerie': Đứa trẻ đếm trốn tìm (haunting, rhythmic, wardrobe acoustic)
            - 'male_detective': Điều tra viên thẩm vấn (authoritative, sharp)
            - 'male_witness': Nhân chứng nam ven sông (nervous neighbor)
            - 'operator_113': Trực ban tổng đài 113 (procedural police)
        acoustic_style: Environment simulation filter:
            - 'clean': Studio clarity
            - 'phone_call_113': 113 emergency dispatch phone audio filter
            - 'police_radio': Tactical walkie-talkie bandpass
            - 'cassette_tape_2016': 2016 interrogation cassette tape recording
            - 'wardrobe_muffled': Sound resonating from inside a wooden wardrobe
            - 'empty_mansion_hall': High reverb empty colonial villa hall
        output_filename: Name of target file (e.g. 'ha_denial_01.mp3').
        target_folder: 'sfx' (public/audio/sfx/), 'public_audio' (public/audio/), or 'case_source' (docs/cases/case_000/05_audio/).
    """
    profile = VOICE_PROFILES.get(character, VOICE_PROFILES["female_suspect"])
    filter_chain = STYLE_FILTERS.get(acoustic_style, "")
    
    target_path = _resolve_target_path(output_filename, target_folder)
    temp_raw = os.path.join(PROJECT_DIR, f"temp_raw_{os.getpid()}.mp3")
    
    try:
        # Step 1: Synthesize with Edge-TTS
        communicate = edge_tts.Communicate(
            text=text,
            voice=profile["voice"],
            rate=profile["rate"],
            pitch=profile["pitch"]
        )
        await communicate.save(temp_raw)
        
        # Step 2: Apply FFmpeg post-processing & acoustic filters
        if character == "child_eerie":
            # Formant and pitch transformation for realistic child whisper
            child_filter = "asetrate=24000*1.28,aresample=24000,atempo=1/1.28,highpass=f=320,lowpass=f=2800,aecho=0.8:0.75:40|80:0.4|0.25"
            if filter_chain:
                filter_chain = f"{child_filter},{filter_chain}"
            else:
                filter_chain = child_filter
                
        cmd = ["ffmpeg", "-y", "-i", temp_raw]
        if filter_chain:
            cmd.extend(["-af", filter_chain])
        cmd.extend(["-codec:a", "libmp3lame", "-b:a", "192k", "-ar", "44100", target_path])
        
        subprocess.run(cmd, check=True, capture_output=True)
        
        duration = _get_audio_duration(target_path)
        file_size_kb = round(os.path.getsize(target_path) / 1024, 1)
        rel_path = os.path.relpath(target_path, PROJECT_DIR)
        
        return (
            f"✅ **Tạo giọng thoại thành công!**\n\n"
            f"- **Nhân vật:** `{character}` ({profile['desc']})\n"
            f"- **Acoustic Style:** `{acoustic_style}`\n"
            f"- **Thời lượng:** `{duration}s` ({file_size_kb} KB)\n"
            f"- **Đường dẫn tệp:** `{rel_path}`\n\n"
            f"**Mã gọi trong Frontend (`lib/investigation-audio.ts`):**\n"
            f"```typescript\n"
            f"// Play in UI:\n"
            f"const audio = new Audio('/audio/sfx/{os.path.basename(target_path)}');\n"
            f"audio.play();\n"
            f"```"
        )
    finally:
        if os.path.exists(temp_raw):
            try:
                os.remove(temp_raw)
            except Exception:
                pass


@mcp.tool()
def apply_acoustic_filter(
    input_file_path: str,
    acoustic_style: str,
    output_filename: str = ""
) -> str:
    """
    Apply physical room acoustic / recording device filter to an existing audio file.
    
    Args:
        input_file_path: Absolute or relative path to the existing audio file.
        acoustic_style: One of 'phone_call_113', 'police_radio', 'cassette_tape_2016', 'wardrobe_muffled', 'empty_mansion_hall'.
        output_filename: Optional output filename. If empty, appends style suffix to original name.
    """
    if not os.path.isabs(input_file_path):
        input_file_path = os.path.join(PROJECT_DIR, input_file_path)
        
    if not os.path.exists(input_file_path):
        return f"❌ Không tìm thấy file nguồn: `{input_file_path}`"
        
    filter_chain = STYLE_FILTERS.get(acoustic_style)
    if not filter_chain:
        return f"❌ Không hỗ trợ acoustic_style `{acoustic_style}`. Hãy chọn: {list(STYLE_FILTERS.keys())}"
        
    base, ext = os.path.splitext(os.path.basename(input_file_path))
    if not output_filename:
        output_filename = f"{base}_{acoustic_style}.mp3"
        
    target_path = os.path.join(PUBLIC_SFX_DIR, output_filename)
    
    cmd = [
        "ffmpeg", "-y", "-i", input_file_path,
        "-af", filter_chain,
        "-codec:a", "libmp3lame", "-b:a", "192k",
        target_path
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    
    rel_path = os.path.relpath(target_path, PROJECT_DIR)
    duration = _get_audio_duration(target_path)
    return f"✅ Đã áp dụng hiệu ứng `{acoustic_style}` thành công!\n- **File đích:** `{rel_path}`\n- **Thời lượng:** `{duration}s`"


@mcp.tool()
def mix_scene_soundscape(
    foreground_audio: str,
    background_drone: str = "atmosphere_drone.wav",
    output_filename: str = "mixed_scene_climax.mp3",
    foreground_volume: float = 1.0,
    background_volume: float = 0.25,
    target_folder: str = "public_audio"
) -> str:
    """
    Mix foreground voice / SFX action with an ambient background drone (such as atmosphere_drone.wav).
    
    Args:
        foreground_audio: Filename or relative path of the main voice or SFX.
        background_drone: Filename of the background soundscape (default: 'atmosphere_drone.wav' in docs/cases/case_000/05_audio/).
        output_filename: Target filename for output mp3.
        foreground_volume: Volume multiplier for foreground (default 1.0).
        background_volume: Volume multiplier for ambient drone (default 0.25).
        target_folder: 'public_audio' or 'sfx'.
    """
    fg_path = foreground_audio if os.path.isabs(foreground_audio) else os.path.join(PROJECT_DIR, foreground_audio)
    if not os.path.exists(fg_path):
        # Check in sfx or 05_audio
        cand1 = os.path.join(PUBLIC_SFX_DIR, foreground_audio)
        cand2 = os.path.join(DOCS_AUDIO_DIR, foreground_audio)
        if os.path.exists(cand1):
            fg_path = cand1
        elif os.path.exists(cand2):
            fg_path = cand2
        else:
            return f"❌ Không tìm thấy file âm thanh chính `{foreground_audio}`"
            
    bg_path = background_drone if os.path.isabs(background_drone) else os.path.join(DOCS_AUDIO_DIR, background_drone)
    if not os.path.exists(bg_path):
        return f"❌ Không tìm thấy file background drone `{background_drone}` tại `{DOCS_AUDIO_DIR}`"
        
    target_path = _resolve_target_path(output_filename, target_folder)
    
    # FFmpeg mix filter
    cmd = [
        "ffmpeg", "-y",
        "-i", fg_path,
        "-i", bg_path,
        "-filter_complex",
        f"[0:a]volume={foreground_volume}[fg];"
        f"[1:a]volume={background_volume},afade=t=in:ss=0:d=1,afade=t=out:st=10:d=2[bg];"
        f"[fg][bg]amix=inputs=2:duration=first:dropout_transition=2[outa]",
        "-map", "[outa]",
        "-codec:a", "libmp3lame", "-b:a", "192k",
        target_path
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    
    duration = _get_audio_duration(target_path)
    rel_path = os.path.relpath(target_path, PROJECT_DIR)
    return f"✅ **Đã hòa trộn Soundscape thành công!**\n- **Tệp xuất bản:** `{rel_path}`\n- **Thời lượng:** `{duration}s`"


@mcp.tool()
def list_case_audio_assets() -> str:
    """
    Audit and list all registered audio files in both source archive (docs/cases/case_000/05_audio/) and runtime (public/audio/sfx/).
    """
    runtime_files = []
    if os.path.exists(PUBLIC_SFX_DIR):
        for f in sorted(os.listdir(PUBLIC_SFX_DIR)):
            if f.endswith((".mp3", ".ogg", ".wav")):
                full = os.path.join(PUBLIC_SFX_DIR, f)
                runtime_files.append((f, round(os.path.getsize(full)/1024, 1), _get_audio_duration(full)))
                
    source_files = []
    if os.path.exists(DOCS_AUDIO_DIR):
        for f in sorted(os.listdir(DOCS_AUDIO_DIR)):
            if f.endswith((".mp3", ".ogg", ".wav")):
                full = os.path.join(DOCS_AUDIO_DIR, f)
                source_files.append((f, round(os.path.getsize(full)/1024, 1), _get_audio_duration(full)))
                
    lines = ["### 🎧 DANH MỤC TÀI NGUYÊN ÂM THANH CASE #000\n"]
    lines.append("#### 1. Runtime SFX (`public/audio/sfx/` - Web App đang dùng):")
    if runtime_files:
        lines.append("| Tên Tệp | Kích thước | Thời lượng |")
        lines.append("| :--- | :---: | :---: |")
        for f, sz, dur in runtime_files:
            lines.append(f"| `{f}` | {sz} KB | {dur}s |")
    else:
        lines.append("*(Chưa có file nào)*")
        
    lines.append("\n#### 2. Source Archives (`docs/cases/case_000/05_audio/` - Tài nguyên gốc):")
    if source_files:
        lines.append("| Tên Tệp | Kích thước | Thời lượng |")
        lines.append("| :--- | :---: | :---: |")
        for f, sz, dur in source_files:
            lines.append(f"| `{f}` | {sz} KB | {dur}s |")
            
    return "\n".join(lines)


if __name__ == "__main__":
    mcp.run()
