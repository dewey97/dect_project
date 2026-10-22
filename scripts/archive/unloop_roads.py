import json
import math
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def pt_dist(p1, p2):
    return math.hypot(p1['x'] - p2['x'], p1['y'] - p2['y'])

def split_loops_and_reversals(pts):
    # 1. Deduplicate consecutive points (< 1.5px)
    clean = [pts[0]]
    for p in pts[1:]:
        if pt_dist(p, clean[-1]) >= 1.5:
            clean.append(p)
    if len(clean) < 2:
        return []

    # 2. Split at sharp bends, turnarounds, or when looping back close to visited points
    segments = []
    curr = [clean[0]]

    for i in range(1, len(clean)):
        p_prev = curr[-1]
        p_curr = clean[i]
        
        split_here = False
        
        # Check angle with recent trend (last 2-3 points)
        if len(curr) >= 2:
            v1x = curr[-1]['x'] - curr[-2]['x']
            v1y = curr[-1]['y'] - curr[-2]['y']
            v2x = p_curr['x'] - curr[-1]['x']
            v2y = p_curr['y'] - curr[-1]['y']
            l1 = math.hypot(v1x, v1y)
            l2 = math.hypot(v2x, v2y)
            if l1 > 0.5 and l2 > 0.5:
                cos_t = (v1x * v2x + v1y * v2y) / (l1 * l2)
                # Angle > 78 degrees (cos < 0.2)
                if cos_t < 0.2:
                    split_here = True

        # Check if p_curr is heading back close to an earlier point in curr (within 12px)
        # after having traveled away (> 35px)
        if not split_here and len(curr) >= 4:
            curr_len = sum(pt_dist(curr[k], curr[k-1]) for k in range(1, len(curr)))
            if curr_len > 35.0:
                for k in range(len(curr) - 3):
                    if pt_dist(p_curr, curr[k]) < 12.0:
                        split_here = True
                        break

        if split_here:
            if len(curr) >= 2:
                segments.append(curr)
            # Start next segment cleanly at curr[-1] meeting point
            curr = [curr[-1], p_curr]
        else:
            curr.append(p_curr)

    if len(curr) >= 2:
        segments.append(curr)

    return segments

def process_file(fpath):
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    roads = data.get('roads', [])
    new_roads = []
    split_count = 0
    seen_segments = set()
    dedup_count = 0

    def seg_signature(pts):
        p_start = (round(pts[0]['x'], 1), round(pts[0]['y'], 1))
        p_end = (round(pts[-1]['x'], 1), round(pts[-1]['y'], 1))
        mid = pts[len(pts)//2]
        p_mid = (round(mid['x'], 1), round(mid['y'], 1))
        pair = sorted([p_start, p_end])
        return (pair[0], pair[1], p_mid)

    for r in roads:
        pts = r.get('points', [])
        if len(pts) < 2:
            continue

        segs = split_loops_and_reversals(pts)
        if len(segs) > 1:
            split_count += (len(segs) - 1)

        for s_idx, seg in enumerate(segs):
            seg_len = sum(pt_dist(seg[j], seg[j-1]) for j in range(1, len(seg)))
            if seg_len < 4.0:
                continue

            sig = seg_signature(seg)
            if sig in seen_segments:
                dedup_count += 1
                continue
            seen_segments.add(sig)

            feat = dict(r)
            feat['id'] = f"{r['id']}_p{s_idx}"
            feat['points'] = seg
            new_roads.append(feat)

    print(f"File {fpath}:")
    print(f"  Input roads: {len(roads)}")
    print(f"  Splits added: {split_count}")
    print(f"  Duplicate overlapping lines eliminated: {dedup_count}")
    print(f"  Final clean roads: {len(new_roads)}")

    data['roads'] = new_roads
    with open(fpath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, separators=(',', ':'))

process_file('data/maps/world_vector_map.json')
process_file('data/maps/case_000_vector.json')
