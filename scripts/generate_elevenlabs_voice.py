import os
import sys
import json
import urllib.request
import subprocess

# Voice options on ElevenLabs:
# 'Xb7hH8MSUJpSbSDYk0k2' (Alice - British/Whispery, very good for horror)
# 'EXAVITQu4vr4xnSDxMaL' (Bella - soft, breathy)
# '21m00Tcm4TlvDq8ikWAM' (Rachel)
VOICE_ID = os.environ.get('ELEVENLABS_VOICE_ID', 'Xb7hH8MSUJpSbSDYk0k2')

def generate_voice_elevenlabs(api_key, output_path):
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"
    
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": api_key
    }
    
    # Prompting with ellipses and breathing cues for multilingual v2
    text = "...Năm... ...mười... ...mười lăm... ...hai mươi... ... ...chín mươi... ...chín mươi lăm... ...Một trăm... tìm thấy rồi..."
    
    data = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.32,
            "similarity_boost": 0.75,
            "style": 0.45,
            "use_speaker_boost": True
        }
    }
    
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers)
    print(f"Calling ElevenLabs API with model eleven_multilingual_v2...")
    with urllib.request.urlopen(req) as resp, open(output_path, 'wb') as f:
        f.write(resp.read())
    print(f"Generated ElevenLabs voice: {output_path}")

def mix_with_real_foley(voice_path, output_mp3):
    print("Mixing ElevenLabs voice with real foley door and latch...")
    cmd = [
        'ffmpeg', '-y',
        '-i', voice_path,
        '-i', 'real_creak.wav',
        '-i', 'real_slam.wav',
        '-i', 'real_latch.wav',
        '-filter_complex',
        '[0:a]lowpass=f=1200,aecho=0.8:0.7:40|80:0.3|0.15[voice];'
        '[1:a]volume=2.2,afade=t=in:ss=0:d=0.3[creak];'
        '[2:a]volume=3.0[slam];'
        '[3:a]volume=2.8[latch];'
        'aevalsrc=0:d=0.8[pause1];'
        'aevalsrc=0:d=0.15[pause2];'
        '[slam][pause2][latch]concat=n=3:v=0:a=1[impact];'
        '[voice][pause1][creak][impact]concat=n=4:v=0:a=1[outa]',
        '-map', '[outa]',
        '-b:a', '192k',
        output_mp3
    ]
    subprocess.run(cmd, check=True)
    print(f"Done! Mixed to {output_mp3}")

if __name__ == '__main__':
    key = os.environ.get('ELEVENLABS_API_KEY')
    if len(sys.argv) > 1:
        key = sys.argv[1]
    
    if not key:
        print("ERROR: Please provide an ElevenLabs API key as argument or set ELEVENLABS_API_KEY")
        sys.exit(1)
        
    raw_v = 'elevenlabs_raw.mp3'
    final_out = os.path.join('public', 'audio', 'hide_and_seek_climax.mp3')
    
    generate_voice_elevenlabs(key, raw_v)
    mix_with_real_foley(raw_v, final_out)
    if os.path.exists(raw_v):
        os.remove(raw_v)
