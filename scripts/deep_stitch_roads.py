#!/usr/bin/env python3
"""
Deep Topology Stitcher & Network Weld Engine
Performs multi-pass graph stitching:
1. Normalizes street names (e.g., "Phố Hàng Bông", "Hàng Bông")
2. First pass: Stitches segments of the exact same street name (relaxed tolerance)
3. Second pass: Stitches unnamed connecting road segments of the same road hierarchy
4. Eliminates zero-length and sub-pixel stubs
"""

import json
import math
import os
import sys
import re

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def dist_sq(p1, p2):
    return (p1['x'] - p2['x'])**2 + (p1['y'] - p2['y'])**2

def normalize_street_name(name):
    if not name:
        return ""
    # Strip prefixes like "Phố", "Đường", "Ngõ" for matching
    cleaned = re.sub(r'^(Phố|Đường|Ngõ|Ngách|Đại lộ)\s+', '', name.strip(), flags=re.IGNORECASE)
    return cleaned.strip().lower()

def stitch_chains(chains, tolerance=15.0):
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

                    # 1. curr end -> other start
                    if dist_sq(curr[-1], other[0]) <= tolerance**2:
                        curr = curr + other[1:]
                        used[j] = True
                        extended = True
                        merged = True
                        break
                    # 2. curr end -> other end
                    elif dist_sq(curr[-1], other[-1]) <= tolerance**2:
                        curr = curr + list(reversed(other))[:-1]
                        used[j] = True
                        extended = True
                        merged = True
                        break
                    # 3. curr start -> other end
                    elif dist_sq(curr[0], other[-1]) <= tolerance**2:
                        curr = other[:-1] + curr
                        used[j] = True
                        extended = True
                        merged = True
                        break
                    # 4. curr start -> other start
                    elif dist_sq(curr[0], other[0]) <= tolerance**2:
                        curr = list(reversed(other))[1:] + curr
                        used[j] = True
                        extended = True
                        merged = True
                        break

            new_chains.append(curr)

        chains = new_chains

    clean_results = []
    for chain in chains:
        # Deduplicate consecutive points within 1px
        clean_pts = [chain[0]]
        for pt in chain[1:]:
            if dist_sq(clean_pts[-1], pt) > 1.0:
                clean_pts.append(pt)
        if len(clean_pts) >= 2:
            clean_results.append(clean_pts)

    return clean_results

def main():
    json_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'maps', 'case_000_vector.json')
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    roads = data.get('roads', [])
    print(f"🛣️ Bắt đầu hàn sâu mạng lưới đường ({len(roads)} đoạn)...")

    # Pass 1: Nhóm theo tên phố đã chuẩn hóa
    name_groups = {}
    unnamed = []
    for r in roads:
        norm_name = normalize_street_name(r.get('name', ''))
        if norm_name:
            if norm_name not in name_groups:
                name_groups[norm_name] = []
            name_groups[norm_name].append(r)
        else:
            unnamed.append(r)

    stitched_named_roads = []
    for norm_name, segs in name_groups.items():
        base_meta = segs[0]
        chains = [s['points'] for s in segs]
        merged_chains = stitch_chains(chains, tolerance=18.0)
        for idx, mc in enumerate(merged_chains):
            feat = dict(base_meta)
            feat['id'] = f"road-{norm_name[:15]}-{idx}"
            feat['points'] = mc
            feat['smooth'] = False  # Giữ thẳng thực tế, chỉ bo góc ở khớp nối
            stitched_named_roads.append(feat)

    # Pass 2: Nhóm các đường không tên cùng loại theo cụm tiếp giáp
    type_groups = {}
    for r in unnamed:
        t = r.get('type', 'street')
        if t not in type_groups:
            type_groups[t] = []
        type_groups[t].append(r)

    stitched_unnamed_roads = []
    for r_type, segs in type_groups.items():
        base_meta = segs[0]
        chains = [s['points'] for s in segs]
        merged_chains = stitch_chains(chains, tolerance=12.0)
        for idx, mc in enumerate(merged_chains):
            feat = dict(base_meta)
            feat['id'] = f"road-unnamed-{r_type}-{idx}"
            feat['points'] = mc
            feat['smooth'] = False
            stitched_unnamed_roads.append(feat)

    total_roads = stitched_named_roads + stitched_unnamed_roads
    print(f"✅ Hoàn tất! Từ {len(roads)} đoạn gãy ➔ đã hàn liền thông suốt thành {len(total_roads)} trục đường lớn!")

    data['roads'] = total_roads
    data['updatedAt'] = '2026-10-18T17:15:00.000Z'

    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

if __name__ == '__main__':
    main()
