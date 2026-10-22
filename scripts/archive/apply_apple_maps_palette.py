import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Apple Maps-style palette constants
ROAD_SURFACE_COLOR = '#CFDDE8'    # xanh xám pastel — mặt đường
CASING_COLOR = '#B8CBD8'          # viền mềm cùng tông, không cứng nhắc
BG_COLOR = '#F4F6F8'              # nền canvas sáng trung tính

# Phân cấp bề rộng để tô màu đại lộ đậm hơn chút
def get_road_color(width: float) -> str:
    if width >= 28:
        return '#C4D5E3'   # Đại lộ/quốc lộ — xanh xám sâu hơn 1 bậc
    elif width >= 14:
        return '#CFDDE8'   # Phố khu vực — chuẩn pastel
    else:
        return '#D6E2EC'   # Ngõ hẻm — nhạt hơn, nhẹ hơn

def get_casing_color(width: float) -> str:
    if width >= 28:
        return '#A8BCC9'   # Đại lộ casing sâu hơn
    else:
        return '#B8CBD8'   # Casing chung

def process_file(fpath: str):
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # 1. Cập nhật backgroundColor của canvas
    data['backgroundColor'] = BG_COLOR

    roads = data.get('roads', [])
    updated = 0

    for r in roads:
        width = r.get('width', 8)
        new_color = get_road_color(width)
        new_casing = get_casing_color(width)

        changed = False
        if r.get('color') != new_color:
            r['color'] = new_color
            changed = True
        if r.get('casingColor') != new_casing:
            r['casingColor'] = new_casing
            changed = True
        # Giảm casingWidth xuống 1 (casing mỏng hơn, mềm hơn)
        if r.get('casingWidth', 2) > 1:
            r['casingWidth'] = 1
            changed = True
        if changed:
            updated += 1

    print(f'{fpath}: Updated {updated}/{len(roads)} roads to Apple Maps palette.')

    with open(fpath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, separators=(',', ':'))

process_file('data/maps/world_vector_map.json')
process_file('data/maps/case_000_vector.json')
print('Done! Palette applied.')
