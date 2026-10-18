#!/usr/bin/env python3
"""
Fast Grid-Indexed Highway Junction Welder (O(N) Spatial Hashing)
Snaps disjointed street endpoints within 20px to nearest junctions or road bodies.
"""

import json
import math
import os
import sys

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

GRID_SIZE = 40.0

def cell_coord(x, y):
    return (int(x // GRID_SIZE), int(y // GRID_SIZE))

def dist_sq(p1, p2):
    return (p1['x'] - p2['x'])**2 + (p1['y'] - p2['y'])**2

def point_to_segment_dist_sq(p, a, b):
    abx = b['x'] - a['x']
    aby = b['y'] - a['y']
    l2 = abx**2 + aby**2
    if l2 == 0:
        return dist_sq(p, a), a

    t = max(0.0, min(1.0, ((p['x'] - a['x']) * abx + (p['y'] - a['y']) * aby) / l2))
    proj = {
        'x': round(a['x'] + t * abx, 1),
        'y': round(a['y'] + t * aby, 1)
    }
    return dist_sq(p, proj), proj

def main():
    json_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'maps', 'case_000_vector.json')
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    roads = data.get('roads', [])
    print(f"⚡ Đang hàn siêu tốc qua Spatial Hash Grid ({len(roads)} trục đường)...")

    # Xây dựng Spatial Hash Grid cho tất cả các đoạn thẳng (segments)
    seg_grid = {}
    for r_idx, r in enumerate(roads):
        pts = r['points']
        for i in range(len(pts) - 1):
            p1, p2 = pts[i], pts[i + 1]
            min_c = cell_coord(min(p1['x'], p2['x']), min(p1['y'], p2['y']))
            max_c = cell_coord(max(p1['x'], p2['x']), max(p1['y'], p2['y']))
            for cx in range(min_c[0], max_c[0] + 1):
                for cy in range(min_c[1], max_c[1] + 1):
                    seg_grid.setdefault((cx, cy), []).append((r_idx, i, p1, p2))

    # Hàn các điểm đầu mút bị hở trong phạm vi 20px
    SNAP_DIST = 20.0
    SNAP_DIST_SQ = SNAP_DIST ** 2
    snapped = 0

    for r_idx, r in enumerate(roads):
        pts = r['points']
        for end_pos in [0, len(pts) - 1]:
            pt = pts[end_pos]
            cx, cy = cell_coord(pt['x'], pt['y'])
            
            best_d2 = SNAP_DIST_SQ
            best_proj = None

            # Tìm trong 9 ô grid lân cận
            for dx in [-1, 0, 1]:
                for dy in [-1, 0, 1]:
                    for (other_r_idx, seg_i, p1, p2) in seg_grid.get((cx + dx, cy + dy), []):
                        if other_r_idx == r_idx:
                            continue
                        d2, proj = point_to_segment_dist_sq(pt, p1, p2)
                        if 0.5 < d2 < best_d2:
                            best_d2 = d2
                            best_proj = proj

            if best_proj:
                r['points'][end_pos] = best_proj
                snapped += 1

    print(f"🎉 Đã hàn khít thành công {snapped} ngã ba / điểm hở trên toàn bản đồ!")

    data['roads'] = roads
    data['updatedAt'] = '2026-10-18T17:22:00.000Z'

    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("💾 Đã lưu dữ liệu hoàn tất vào case_000_vector.json!")

if __name__ == '__main__':
    main()
