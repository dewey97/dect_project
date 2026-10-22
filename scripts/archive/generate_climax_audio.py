import asyncio
import os
import subprocess
import edge_tts

async def build_haunting_child_voice():
    raw_child1 = 'temp_raw_child1.mp3'
    raw_child2 = 'temp_raw_child2.mp3'
    child_part1 = 'temp_child_part1.wav'
    child_part2 = 'temp_child_part2.wav'
    output_mp3 = os.path.join('public', 'audio', 'hide_and_seek_climax.mp3')

    t1 = '...Năm... ...mười... ...mười lăm... ...hai mươi...'
    t2 = '...chín mươi... ...chín mươi lăm... ...Một trăm...'

    await edge_tts.Communicate(t1, 'vi-VN-HoaiMyNeural', rate='-15%').save(raw_child1)
    await edge_tts.Communicate(t2, 'vi-VN-HoaiMyNeural', rate='-10%').save(raw_child2)

    # Formant shift to transform into genuine young child voice (~7 years old)
    cmd_v1 = [
        'ffmpeg', '-y', '-i', raw_child1,
        '-af', 'asetrate=24000*1.30,aresample=24000,atempo=1/1.30,highpass=f=350,lowpass=f=2600,aecho=0.8:0.7:50|90:0.35|0.2',
        child_part1
    ]
    subprocess.run(cmd_v1, check=True)

    cmd_v2 = [
        'ffmpeg', '-y', '-i', raw_child2,
        '-af', 'asetrate=24000*1.32,aresample=24000,atempo=1/1.32,highpass=f=320,lowpass=f=2800,aecho=0.8:0.75:40|80:0.4|0.25',
        child_part2
    ]
    subprocess.run(cmd_v2, check=True)

    cmd_mix = [
        'ffmpeg', '-y',
        '-i', child_part1,
        '-i', 'real_creak.wav',
        '-i', child_part2,
        '-i', 'super_slam.wav',
        '-i', 'atmosphere_drone.wav',
        '-filter_complex',
        '[0:a]volume=1.4[v1];'
        '[1:a]volume=2.4,afade=t=in:ss=0:d=0.2,afade=t=out:st=1.9:d=0.3[creak];'
        '[2:a]volume=1.6[v2];'
        '[3:a]volume=3.0[slam];'
        'aevalsrc=0:d=0.5[p1];'
        'aevalsrc=0:d=0.5[p2];'
        'aevalsrc=0:d=0.15[p3];'
        '[v1][p1][creak][p2][v2][p3][slam]concat=n=7:v=0:a=1[fg];'
        '[4:a]volume=0.85[bg];'
        '[fg][bg]amix=inputs=2:duration=first:dropout_transition=2[outa]',
        '-map', '[outa]',
        '-b:a', '192k',
        output_mp3
    ]
    subprocess.run(cmd_mix, check=True)

    for f in [raw_child1, raw_child2, child_part1, child_part2]:
        if os.path.exists(f):
            os.remove(f)

    print(f"Master audio generated to {output_mp3}")

if __name__ == '__main__':
    asyncio.run(build_haunting_child_voice())
