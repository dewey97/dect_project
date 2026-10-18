#!/usr/bin/env python3
"""
Smart Road Network Continuity & Auto-Welder
Thuật toán tự động nối thông minh & hàn liền mạch hệ sinh thái mạng lưới giao thông:
1. Tự động nhận diện các điểm đầu mút bị đứt gãy (degree-1 dangling endpoints).
2. Nối thông minh dựa trên vector hướng (Collinear Continuation) với bán kính động theo cấp đường:
   - Highway / Avenue: Bán kính nối lên tới 60px (xử lý nhánh dẫn cầu vượt, đường trên cao, đường đôi).
   - Street / Alley: Bán kính nối 28px.
3. Kế thừa đẳng cấp đường (Hierarchy Propagation): Khi trục cao tốc/đại lộ nối vào đoạn tiếp nối,
   tự động nâng cấp đoạn nối để dải màu (#FFF3D6 / viền cam) liền mạch 100%, không bị thắt cổ chai.
4. Hàn ngã ba/ngã tư chuẩn topo (T/Y-junction insertion): Bổ sung điểm giao vào thân đường đích.
5. Lặp hội tụ (Iterative Convergence) cho đến khi toàn bộ mạng lưới liền mạch.
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

GRID_SIZE = 50.0

HIERARCHY_RANK = {
    'highway': 4,
    'avenue': 3,
    'street': 2,
    'alley': 1,
}

STYLE_BY_TYPE = {
    'highway': {
        'width': 14,
        'color': '#FFF3D6',
        'casingColor': '#F59E0B',
        'casingWidth': 2.5
    },
    'avenue': {
        'width': 10,
        'color': '#FEF3C7',
        'casingColor': '#FBBF24',
        'casingWidth': 2.0
    },
    'street': {
        'width': 6,
        'color': '#FFFFFF',
        'casingColor': '#CBD5E1',
        'casingWidth': 1.5
    },
    'alley': {
        'width': 3,
        'color': '#F8FAFC',
        'casingColor': '#E2E8F0',
        'casingWidth': 1.0
    }
}

def dist_sq(p1, p2):
    return (p1['x'] - p2['x'])**2 + (p1['y'] - p2['y'])**2

def dist(p1, p2):
    return math.sqrt(dist_sq(p1, p2))

def get_heading(pts, at_start=True):
    """Tính vector đơn vị hướng ra ngoài tại đầu mút"""
    if len(pts) < 2:
        return (0.0, 0.0)
    if at_start:
        dx = pts[0]['x'] - pts[1]['x']
        dy = pts[0]['y'] - pts[1]['y']
    else:
        dx = pts[-1]['x'] - pts[-2]['x']
        dy = pts[-1]['y'] - pts[-2]['y']
    mag = math.hypot(dx, dy)
    if mag == 0:
        return (0.0, 0.0)
    return (dx / mag, dy / mag)

def point_to_segment_dist_sq(p, a, b):
    abx = b['x'] - a['x']
    aby = b['y'] - a['y']
    l2 = abx**2 + aby**2
    if l2 == 0:
        return dist_sq(p, a), a, 0.0
    t = max(0.0, min(1.0, ((p['x'] - a['x']) * abx + (p['y'] - a['y']) * aby) / l2))
    proj = {
        'x': round(a['x'] + t * abx, 1),
        'y': round(a['y'] + t * aby, 1)
    }
    return dist_sq(p, proj), proj, t

def run_smart_healing():
    json_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'maps', 'case_000_vector.json')
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    roads = data.get('roads', [])
    print(f"🚀 BẮT ĐẦU THUẬT TOÁN HÀN TỰ ĐỘNG THÔNG MINH CHO {len(roads)} TUYẾN ĐƯỜNG...")

    # PASS 1: Collinear End-to-End Smart Merge (Ghép các trục đứt gãy cùng hướng)
    # Đặc biệt cho các tuyến highway/avenue bị cắt đoạn do dữ liệu OSM
    changed = True
    merge_count = 0
    iteration = 0

    while changed and iteration < 5:
        changed = False
        iteration += 1
        i = 0
        while i < len(roads):
            r1 = roads[i]
            pts1 = r1['points']
            if len(pts1) < 2:
                i += 1
                continue

            r1_type = r1.get('type', 'street')
            r1_rank = HIERARCHY_RANK.get(r1_type, 2)
            max_merge_dist = 60.0 if r1_rank >= 3 else 30.0

            merged = False
            for j in range(len(roads)):
                if i == j:
                    continue
                r2 = roads[j]
                pts2 = r2['points']
                if len(pts2) < 2:
                    continue

                r2_type = r2.get('type', 'street')
                r2_rank = HIERARCHY_RANK.get(r2_type, 2)
                allowed_dist = max(max_merge_dist, 60.0 if r2_rank >= 3 else 30.0)

                # Kiểm tra 4 cặp đầu mút: (end1, start2), (start1, end2), (end1, end2), (start1, start2)
                pairs = [
                    ('end1_start2', pts1[-1], pts2[0], False, False),
                    ('start1_end2', pts1[0], pts2[-1], True, True),
                    ('end1_end2', pts1[-1], pts2[-1], False, True),
                    ('start1_start2', pts1[0], pts2[0], True, False),
                ]

                for mode, p1, p2, at_start1, at_start2 in pairs:
                    d = dist(p1, p2)
                    if d > allowed_dist:
                        continue

                    # Kiểm tra độ đồng hướng (Collinearity)
                    v1 = get_heading(pts1, at_start=at_start1)
                    v2 = get_heading(pts2, at_start=at_start2)
                    # Vector hướng ra ngoài của 2 đầu mút cần đối nghịch nhau (dot product < -0.2)
                    # hoặc nếu khoảng cách rất nhỏ (< 15px) thì chấp nhận cả góc rẽ ngã tư
                    dot = v1[0] * v2[0] + v1[1] * v2[1]
                    is_collinear = dot < -0.15 or (d < 18.0 and dot < 0.3)

                    # Hoặc cùng tên đường (như Phố Yên Phụ, Nghi Tàm...)
                    name1 = r1.get('name', '').strip().lower()
                    name2 = r2.get('name', '').strip().lower()
                    name_match = (name1 and name2 and (name1 == name2 or name1 in name2 or name2 in name1))

                    if is_collinear or name_match:
                        # Thực hiện nối r1 và r2
                        # Chuẩn hóa thứ tự điểm
                        if mode == 'end1_start2':
                            new_pts = pts1 + pts2
                        elif mode == 'start1_end2':
                            new_pts = pts2 + pts1
                        elif mode == 'end1_end2':
                            new_pts = pts1 + list(reversed(pts2))
                        elif mode == 'start1_start2':
                            new_pts = list(reversed(pts1)) + pts2

                        # Khử các điểm trùng sát nhau (< 1.5px) ở mối nối
                        cleaned_pts = [new_pts[0]]
                        for p in new_pts[1:]:
                            if dist(p, cleaned_pts[-1]) > 1.5:
                                cleaned_pts.append(p)

                        # Chọn cấp đường cao hơn (Hierarchy Propagation)
                        target_rank = max(r1_rank, r2_rank)
                        target_type = 'highway' if target_rank == 4 else ('avenue' if target_rank == 3 else ('street' if target_rank == 2 else 'alley'))
                        style = STYLE_BY_TYPE[target_type]

                        r1['points'] = cleaned_pts
                        r1['type'] = target_type
                        r1['width'] = style['width']
                        r1['color'] = style['color']
                        r1['casingColor'] = style['casingColor']
                        r1['casingWidth'] = style['casingWidth']
                        if not r1.get('name') and r2.get('name'):
                            r1['name'] = r2['name']

                        # Xóa r2
                        roads.pop(j)
                        merged = True
                        merge_count += 1
                        changed = True
                        break

                if merged:
                    break

            if not merged:
                i += 1

    print(f"✅ Đã hợp nhất thông minh {merge_count} trục đường liền mạch sau {iteration} lượt quét!")

    # PASS 2: Dynamic Spatial Hash T/Y-Junction Welder
    # Bắn tia đầu mút tới các đoạn đường lân cận và chèn điểm giao thật vào cả 2 đường
    print("⚡ Bắt đầu hàn ngã ba / ngã tư và nhánh nối bằng Spatial Hashing...")
    weld_count = 0

    for pass_weld in range(2):
        # Tạo lưới spatial hash cho các segments
        seg_grid = {}
        def cell_coord(x, y):
            return (int(x // GRID_SIZE), int(y // GRID_SIZE))

        for r_idx, r in enumerate(roads):
            pts = r['points']
            for s_idx in range(len(pts) - 1):
                p_a, p_b = pts[s_idx], pts[s_idx + 1]
                min_c = cell_coord(min(p_a['x'], p_b['x']), min(p_a['y'], p_b['y']))
                max_c = cell_coord(max(p_a['x'], p_b['x']), max(p_a['y'], p_b['y']))
                for cx in range(min_c[0], max_c[0] + 1):
                    for cy in range(min_c[1], max_c[1] + 1):
                        seg_grid.setdefault((cx, cy), []).append((r_idx, s_idx))

        for r_idx, r in enumerate(roads):
            pts = r['points']
            if len(pts) < 2:
                continue
            r_rank = HIERARCHY_RANK.get(r.get('type', 'street'), 2)
            snap_limit = 55.0 if r_rank >= 3 else 28.0
            snap_limit_sq = snap_limit ** 2

            for end_idx in [0, len(pts) - 1]:
                pt = pts[end_idx]
                cx, cy = cell_coord(pt['x'], pt['y'])

                best_d2 = snap_limit_sq
                best_match = None

                for dx in [-1, 0, 1]:
                    for dy in [-1, 0, 1]:
                        for (other_idx, s_idx) in seg_grid.get((cx + dx, cy + dy), []):
                            if other_idx == r_idx:
                                continue
                            o_pts = roads[other_idx]['points']
                            p_a, p_b = o_pts[s_idx], o_pts[s_idx + 1]
                            d2, proj, t = point_to_segment_dist_sq(pt, p_a, p_b)

                            # Chỉ nhận khoảng cách hợp lệ (từ 0.8px đến snap_limit)
                            if 0.8 < d2 < best_d2:
                                best_d2 = d2
                                best_match = (other_idx, s_idx, proj, t)

                if best_match:
                    other_idx, s_idx, proj, t = best_match
                    # Hàn điểm đầu mút của r vào proj
                    r['points'][end_idx] = proj
                    weld_count += 1

                    # Chèn proj vào đường target nếu nó rơi vào giữa đoạn
                    if 0.05 < t < 0.95:
                        roads[other_idx]['points'].insert(s_idx + 1, proj)

    print(f"🎉 Đã hoàn tất! Đã hàn {weld_count} điểm giao cắt và ngã rẽ trên toàn bản đồ.")

    # Cập nhật metadata
    data['roads'] = roads
    data['updatedAt'] = '2026-10-18T17:35:00.000Z'

    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"💾 Đã lưu dữ liệu vào: {json_path}")

if __name__ == '__main__':
    run_smart_healing()
