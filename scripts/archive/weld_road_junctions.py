#!/usr/bin/env python3
"""
OSM Global Highway Junction Welder
Finds all endpoints of streets that terminate near another street (within 25px)
and extends/snaps them to connect seamlessly to the nearest intersection or segment.
Eliminates all remaining visual gaps and disjointed junctions.
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

def dist_sq(p1, p2):
    return (p1['x'] - p2['x'])**2 + (p1['y'] - p2['y'])**2

def point_to_segment_dist_sq(p, a, b):
    # Vector ab
    abx = b['x'] - a['x']
    aby = b['y'] - a['y']
    l2 = abx**2 + aby**2
    if l2 == 0:
        return dist_sq(p, a), a

    # Projection t
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
    print(f"🔍 Bắt đầu quét và hàn các nút giao ngã ba, ngã tư ({len(roads)} trục đường)...")

    # Thu thập tất cả các đỉnh của toàn bộ hệ thống đường để làm điểm bắt dính
    all_endpoints = []
    for r_idx, r in enumerate(roads):
        pts = r['points']
        if len(pts) >= 2:
            all_endpoints.append((r_idx, 0, pts[0]))
            all_endpoints.append((r_idx, len(pts) - 1, pts[-1]))

    # Bước 1: Hàn các điểm đầu mút nằm gần nhau (End-to-End Snap) trong phạm vi 22px
    SNAP_TOLERANCE = 22.0
    welded_count = 0

    for i in range(len(all_endpoints)):
        r1_idx, p1_pos, pt1 = all_endpoints[i]
        for j in range(i + 1, len(all_endpoints)):
            r2_idx, p2_pos, pt2 = all_endpoints[j]
            if r1_idx == r2_idx:
                continue

            d2 = dist_sq(pt1, pt2)
            if 0 < d2 <= SNAP_TOLERANCE**2:
                # Kéo dính 2 điểm về trung điểm chung
                mid = {
                    'x': round((pt1['x'] + pt2['x']) / 2, 1),
                    'y': round((pt1['y'] + pt2['y']) / 2, 1)
                }
                roads[r1_idx]['points'][p1_pos] = mid
                roads[r2_idx]['points'][p2_pos] = mid
                welded_count += 1

    # Bước 2: Hàn các ngã ba (T-Junction Snap): Điểm mút của đường nhánh chạm vào thân của đường lớn trong phạm vi 18px
    T_JUNCTION_TOLERANCE = 18.0
    t_welded_count = 0

    for r_idx, r in enumerate(roads):
        pts = r['points']
        for end_pos in [0, len(pts) - 1]:
            end_pt = pts[end_pos]
            best_dist = T_JUNCTION_TOLERANCE**2
            best_proj = None

            for other_idx, other_r in enumerate(roads):
                if other_idx == r_idx:
                    continue
                o_pts = other_r['points']
                for seg_i in range(len(o_pts) - 1):
                    d2, proj = point_to_segment_dist_sq(end_pt, o_pts[seg_i], o_pts[seg_i + 1])
                    if d2 < best_dist and d2 > 0.5:
                        best_dist = d2
                        best_proj = proj

            if best_proj:
                r['points'][end_pos] = best_proj
                t_welded_count += 1

    print(f"✨ Kết quả hàn mối nối:")
    print(f"   - Hàn khít {welded_count} điểm đầu mút giao nhau!")
    print(f"   - Nối liền {t_welded_count} ngã ba chữ T chạm thân đường lớn!")

    data['roads'] = roads
    data['updatedAt'] = '2026-10-18T17:20:00.000Z'

    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("💾 Đã lưu dữ liệu hoàn tất vào case_000_vector.json!")

if __name__ == '__main__':
    main()
