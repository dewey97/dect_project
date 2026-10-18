#!/usr/bin/env python3
"""
OSM Topology Stitcher & Map Merger
Merges collinear and contiguous road segments of the same street into unified continuous polyline highways.
Solves the "segmented road" problem in OpenStreetMap exports.
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

def stitch_segments(segments, tolerance=3.0):
    """
    Given a list of polylines (each with a list of points),
    stitches them end-to-end into continuous lines if endpoints are within tolerance.
    """
    if not segments:
        return []

    # Copy list of coordinate lists
    chains = [list(s['points']) for s in segments]
    meta = segments[0]  # Base properties (type, color, casing, etc.)

    merged = True
    while merged:
        merged = False
        new_chains = []
        used = [False] * len(chains)

        for i in range(len(chains)):
            if used[i]:
                continue
            curr = chains[i]
            used[i] = True

            extended = True
            while extended:
                extended = False
                for j in range(len(chains)):
                    if used[j]:
                        continue
                    other = chains[j]
                    
                    # Case 1: curr end connects to other start
                    if dist_sq(curr[-1], other[0]) <= tolerance**2:
                        curr = curr + other[1:]
                        used[j] = True
                        extended = True
                        merged = True
                        break
                    # Case 2: curr end connects to other end (reverse other)
                    elif dist_sq(curr[-1], other[-1]) <= tolerance**2:
                        curr = curr + list(reversed(other))[:-1]
                        used[j] = True
                        extended = True
                        merged = True
                        break
                    # Case 3: curr start connects to other end
                    elif dist_sq(curr[0], other[-1]) <= tolerance**2:
                        curr = other[:-1] + curr
                        used[j] = True
                        extended = True
                        merged = True
                        break
                    # Case 4: curr start connects to other start (reverse other)
                    elif dist_sq(curr[0], other[0]) <= tolerance**2:
                        curr = list(reversed(other))[1:] + curr
                        used[j] = True
                        extended = True
                        merged = True
                        break

            new_chains.append(curr)

        chains = new_chains

    results = []
    for idx, chain in enumerate(chains):
        # Simplify redundant duplicate consecutive points
        clean_pts = [chain[0]]
        for pt in chain[1:]:
            if dist_sq(clean_pts[-1], pt) > 0.5:
                clean_pts.append(pt)

        if len(clean_pts) >= 2:
            feat = dict(meta)
            feat['id'] = f"{meta['id']}-stitched-{idx}"
            feat['points'] = clean_pts
            results.append(feat)

    return results

def main():
    json_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'maps', 'case_000_vector.json')
    if not os.path.exists(json_path):
        print(f"❌ Không tìm thấy file: {json_path}")
        return

    print("📖 Đang đọc dữ liệu vector hiện tại...")
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    roads = data.get('roads', [])
    railways = data.get('railways', [])
    print(f"🛣️ Tổng số đoạn đường trước khi ghép: {len(roads)}")
    print(f"🚂 Tổng số đoạn đường sắt trước khi ghép: {len(railways)}")

    # Nhóm đường theo tên và loại đường
    road_groups = {}
    for r in roads:
        name = r.get('name', '').strip()
        r_type = r.get('type', 'street')
        # Nhóm theo key: tên + loại (đường có tên nối theo tên, đường không tên nối theo type gần nhau)
        key = (name, r_type) if name else (f"unnamed-{r_type}", r_type)
        if key not in road_groups:
            road_groups[key] = []
        road_groups[key].append(r)

    stitched_roads = []
    for (name, r_type), segs in road_groups.items():
        stitched = stitch_segments(segs, tolerance=6.0)
        stitched_roads.extend(stitched)

    # Ghép tương tự cho đường sắt
    railway_groups = {}
    for rw in railways:
        name = rw.get('name', 'railway').strip()
        if name not in railway_groups:
            railway_groups[name] = []
        railway_groups[name].append(rw)

    stitched_railways = []
    for name, segs in railway_groups.items():
        stitched = stitch_segments(segs, tolerance=8.0)
        stitched_railways.extend(stitched)

    print(f"✨ Kết quả sau khi ghép liền mạch (Topology Stitching):")
    print(f"   - Đường bộ: Từ {len(roads)} đoạn đứt gãy ➔ còn {len(stitched_roads)} tuyến đường dài thông suốt!")
    print(f"   - Đường sắt: Từ {len(railways)} đoạn ➔ còn {len(stitched_railways)} tuyến đường sắt liên tục!")

    data['roads'] = stitched_roads
    data['railways'] = stitched_railways
    data['updatedAt'] = '2026-10-18T17:10:00.000Z'

    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("💾 Đã lưu bản đồ nối liền mạch vào case_000_vector.json thành công!")

if __name__ == '__main__':
    main()
