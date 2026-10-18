#!/usr/bin/env python3
"""
Scanner & Vector Extractor for Figma Hanoi Master Map
Source image: public/images/cases/case_000/map/hanoi_master_map.png (1237 x 866)
Target canvas: 2474 x 1732 (Figma Frame 96:9215 @ 2x exact coordinate parity)
Output: data/maps/case_000_vector.json (Direct Database Persistence)
"""

import os
import sys
import json
import numpy as np

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from PIL import Image
from skimage.measure import find_contours, approximate_polygon
from skimage.morphology import skeletonize
from scipy.ndimage import label, center_of_mass
import networkx as nx

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMAGE_PATH = os.path.join(BASE_DIR, 'public', 'images', 'cases', 'case_000', 'map', 'hanoi_master_map.png')
OUTPUT_PATH = os.path.join(BASE_DIR, 'data', 'maps', 'case_000_vector.json')

SCALE = 2.0  # 1237x866 -> 2474x1732

def round_pt(val):
    return round(float(val) * SCALE, 1)

def extract_water_features(arr):
    print("🌊 Đang scan các vùng nước (hồ & Sông Hồng)...")
    # Color mask: [146, 217, 233] +- 16
    water_mask = (
        (abs(arr[:, :, 0].astype(int) - 146) < 16) &
        (abs(arr[:, :, 1].astype(int) - 217) < 16) &
        (abs(arr[:, :, 2].astype(int) - 233) < 16)
    )
    
    contours = find_contours(water_mask, 0.5)
    features = []
    
    for idx, c in enumerate(contours):
        if len(c) < 12:
            continue
        approx = approximate_polygon(c, tolerance=1.2)
        if len(approx) < 4:
            continue
        
        pts = [{'x': round_pt(p[1]), 'y': round_pt(p[0])} for p in approx]
        min_x = min(p['x'] for p in pts)
        max_x = max(p['x'] for p in pts)
        min_y = min(p['y'] for p in pts)
        max_y = max(p['y'] for p in pts)
        area = (max_x - min_x) * (max_y - min_y)
        center_x = (min_x + max_x) / 2
        center_y = (min_y + max_y) / 2
        
        # Name detection based on coordinate & size
        name = f"Vùng nước #{idx + 1}"
        w_type = "lake"
        color = "#A4D8EE"
        
        if area > 100000 and max_x > 2000 and max_y > 1000:
            name = "Sông Hồng (Red River)"
            w_type = "river"
        elif area > 100000 and center_x < 1400 and center_y < 500:
            name = "Hồ Tây (West Lake - TÂY HỒ)"
        elif 1600 < center_x < 1720 and 650 < center_y < 900:
            name = "Hồ Phân khu Cảng (Bến thuyền)"
        elif 1300 < center_x < 1450 and 1100 < center_y < 1450:
            name = "Hồ Bách Khoa (Công viên Thống Nhất)"
        elif 1700 < center_x < 1900 and 1400 < center_y < 1600:
            name = "Hồ Thanh Nhàn (Công viên Tuổi Trẻ)"
        elif 650 < center_x < 850 and 1000 < center_y < 1200:
            name = "Hồ Hoàng Cầu (Đống Đa)"
        elif 650 < center_x < 800 and 700 < center_y < 850:
            name = "Hồ Giảng Võ"
        elif 500 < center_x < 650 and 1000 < center_y < 1150:
            name = "Hồ Thành Công"
        elif 500 < center_x < 650 and 700 < center_y < 850:
            name = "Hồ Ngọc Khánh"
        elif 1000 < center_x < 1150 and 350 < center_y < 450:
            name = "Hồ Đầm Tròn (Tổ 18 Ba Đình)"
        elif 1200 < center_x < 1380 and 150 < center_y < 350:
            name = "Hồ Trúc Bạch"
        elif center_x < 400 and center_y > 800:
            name = "Hồ Cầu Giấy"
        elif center_x > 1800 and center_y < 600:
            name = "Bãi Giữa / Nhánh Sông Hồng"
            
        features.append({
            'id': f'water-figma-{idx + 1}',
            'name': name,
            'type': w_type,
            'points': pts,
            'closed': True,
            'color': color,
            'opacity': 0.95,
            'smooth': True,
            'zIndex': 2 if w_type == 'lake' else 1,
            '_area': area
        })
        
    # Sort largest first so rivers and big lakes render underneath smaller ones
    features.sort(key=lambda x: -x['_area'])
    for f in features:
        del f['_area']
    print(f"   -> Đã quét {len(features)} hồ & vùng nước.")
    return features

def extract_park_zones(arr):
    print("🌳 Đang scan các công viên & mảng xanh (Green Spaces)...")
    # Park color mask: [196, 239, 212] +- 25
    park_mask = (
        (abs(arr[:, :, 0].astype(int) - 196) < 25) &
        (abs(arr[:, :, 1].astype(int) - 239) < 25) &
        (abs(arr[:, :, 2].astype(int) - 212) < 25)
    )
    
    contours = find_contours(park_mask, 0.5)
    zones = []
    
    for idx, c in enumerate(contours):
        if len(c) < 18:
            continue
        approx = approximate_polygon(c, tolerance=1.5)
        if len(approx) < 4:
            continue
            
        pts = [{'x': round_pt(p[1]), 'y': round_pt(p[0])} for p in approx]
        min_x = min(p['x'] for p in pts)
        max_x = max(p['x'] for p in pts)
        min_y = min(p['y'] for p in pts)
        max_y = max(p['y'] for p in pts)
        area = (max_x - min_x) * (max_y - min_y)
        center_x = (min_x + max_x) / 2
        center_y = (min_y + max_y) / 2
        
        name = f"Công viên #{idx + 1}"
        if center_x > 2000 and center_y > 700:
            name = "Bãi bồi phù sa Sông Hồng"
        elif 1000 < center_x < 1300 and 300 < center_y < 600:
            name = "Công viên Bách Thảo - Lăng Bác"
        elif 1300 < center_x < 1550 and 1100 < center_y < 1450:
            name = "Công viên Thống Nhất & Tuổi Trẻ"
        elif 1600 < center_x < 1750 and 650 < center_y < 900:
            name = "Khuôn viên xanh Bờ Sông Cảng"
        elif center_x < 300 and center_y > 1400:
            name = "Công viên Trung Hòa - Nhân Chính"
            
        zones.append({
            'id': f'zone-park-{idx + 1}',
            'name': name,
            'category': 'park',
            'points': pts,
            'fillColor': '#D1E7DD',
            'strokeColor': '#A3CFBB',
            'strokeWidth': 1.2,
            'opacity': 0.85,
            'zIndex': 3,
            '_area': area
        })
        
    zones.sort(key=lambda z: -z['_area'])
    # Keep top 80 most prominent park zones
    top_zones = zones[:80]
    for z in top_zones:
        del z['_area']
    print(f"   -> Đã quét {len(top_zones)} công viên & mảng xanh lớn.")
    return top_zones

def extract_urban_blocks(arr):
    print("🏢 Đang scan các ô phố quy hoạch đô thị (Urban Cadastral Blocks)...")
    # Cadastral blocks mask: [230..242, 234..242, 236..245]
    block_mask = (
        (arr[:, :, 0] >= 230) & (arr[:, :, 0] <= 242) &
        (arr[:, :, 1] >= 234) & (arr[:, :, 1] <= 243) &
        (arr[:, :, 2] >= 236) & (arr[:, :, 2] <= 245)
    )
    
    contours = find_contours(block_mask, 0.5)
    blocks = []
    
    for idx, c in enumerate(contours):
        if len(c) < 16:
            continue
        min_x = np.min(c[:, 1])
        max_x = np.max(c[:, 1])
        min_y = np.min(c[:, 0])
        max_y = np.max(c[:, 0])
        w = max_x - min_x
        h = max_y - min_y
        
        # Only select well-defined cadastral city blocks
        if w >= 14 and h >= 14:
            approx = approximate_polygon(c, tolerance=1.8)
            if len(approx) < 4:
                continue
            pts = [{'x': round_pt(p[1]), 'y': round_pt(p[0])} for p in approx]
            blocks.append({
                'id': f'zone-block-{idx + 1}',
                'name': f'Ô quy hoạch #{idx + 1}',
                'category': 'residential',
                'points': pts,
                'fillColor': '#ECEFF1',
                'strokeColor': '#CBD5E1',
                'strokeWidth': 1.0,
                'opacity': 0.8,
                'zIndex': 2,
                '_area': w * h
            })
            
    blocks.sort(key=lambda b: -b['_area'])
    # Keep top 120 most prominent urban blocks
    top_blocks = blocks[:120]
    for b in top_blocks:
        del b['_area']
    print(f"   -> Đã quét {len(top_blocks)} ô phố quy hoạch đô thị.")
    return top_blocks

def extract_road_network(arr):
    print("🛣️ Đang scan và dựng mạng lưới đường bộ (Road Network & Streets)...")
    white_mask = (arr[:, :, 0] > 250) & (arr[:, :, 1] > 250) & (arr[:, :, 2] > 250)
    skel = skeletonize(white_mask).astype(np.uint8)
    
    # Build spatial graph
    G = nx.Graph()
    y_idx, x_idx = np.where(skel)
    for y, x in zip(y_idx, x_idx):
        G.add_node((y, x))
        for dy in [-1, 0, 1]:
            for dx in [-1, 0, 1]:
                if dy == 0 and dx == 0:
                    continue
                ny, nx_ = y + dy, x + dx
                if (ny, nx_) in G:
                    G.add_edge((y, x), (ny, nx_))
                    
    junctions = set(n for n in G.nodes() if G.degree(n) != 2)
    visited_edges = set()
    segments = []
    
    for j in junctions:
        for neighbor in list(G.neighbors(j)):
            edge_key = tuple(sorted([j, neighbor]))
            if edge_key in visited_edges:
                continue
            visited_edges.add(edge_key)
            
            path = [j, neighbor]
            curr = neighbor
            prev = j
            while curr not in junctions and G.degree(curr) == 2:
                next_nodes = [n for n in G.neighbors(curr) if n != prev]
                if not next_nodes:
                    break
                nxt = next_nodes[0]
                edge_k = tuple(sorted([curr, nxt]))
                visited_edges.add(edge_k)
                path.append(nxt)
                prev = curr
                curr = nxt
                
            # Filter to solid street segments (length >= 14px in image = >= 28px in 2x canvas)
            if len(path) >= 14:
                pts_arr = np.array(path)
                approx = approximate_polygon(pts_arr, tolerance=1.5)
                if len(approx) >= 2:
                    pts = [{'x': round_pt(p[1]), 'y': round_pt(p[0])} for p in approx]
                    segments.append({
                        'points': pts,
                        'length': len(path)
                    })
                    
    segments.sort(key=lambda s: -s['length'])
    # Keep top 320 longest, most complete street segments
    top_segments = segments[:320]
    
    road_features = []
    
    # 1. First add the Master Arterial Highways & Bridges (Canonical named avenues)
    master_arterials = [
        {
            'id': 'road-vanhdai1',
            'name': 'Đường Vành Đai 1 (Kim Mã - Xã Đàn - Đại Cồ Việt)',
            'type': 'highway',
            'points': [
                {'x': 200, 'y': 860},
                {'x': 440, 'y': 850},
                {'x': 700, 'y': 880},
                {'x': 1050, 'y': 950},
                {'x': 1420, 'y': 1040},
                {'x': 1800, 'y': 1180},
                {'x': 2180, 'y': 1300}
            ],
            'width': 12,
            'color': '#FFE082',
            'casingColor': '#F59E0B',
            'casingWidth': 2.5,
            'smooth': True,
            'zIndex': 12
        },
        {
            'id': 'road-vanhdai2-tay',
            'name': 'Đường Vành Đai 2 (Đào Tấn - Liễu Giai - Cầu Giấy)',
            'type': 'highway',
            'points': [
                {'x': 310, 'y': 440},
                {'x': 270, 'y': 620},
                {'x': 210, 'y': 780},
                {'x': 100, 'y': 1150},
                {'x': 300, 'y': 1550},
                {'x': 480, 'y': 1730}
            ],
            'width': 12,
            'color': '#FFE082',
            'casingColor': '#F59E0B',
            'casingWidth': 2.5,
            'smooth': True,
            'zIndex': 12
        },
        {
            'id': 'road-thuykhue',
            'name': 'Đường Thụy Khuê - Hoàng Hoa Thám',
            'type': 'avenue',
            'points': [
                {'x': 600, 'y': 360},
                {'x': 780, 'y': 360},
                {'x': 950, 'y': 370},
                {'x': 1150, 'y': 400},
                {'x': 1350, 'y': 450}
            ],
            'width': 8,
            'color': '#FFFFFF',
            'casingColor': '#94A3B8',
            'casingWidth': 1.8,
            'smooth': True,
            'zIndex': 10
        },
        {
            'id': 'road-tranphu',
            'name': 'Trục Trần Phú - Nguyễn Thái Học',
            'type': 'avenue',
            'points': [
                {'x': 860, 'y': 720},
                {'x': 1050, 'y': 740},
                {'x': 1250, 'y': 760},
                {'x': 1450, 'y': 800}
            ],
            'width': 8,
            'color': '#FFFFFF',
            'casingColor': '#94A3B8',
            'casingWidth': 1.8,
            'smooth': True,
            'zIndex': 10
        },
        {
            'id': 'road-langha',
            'name': 'Đường Láng Hạ - Giảng Võ',
            'type': 'avenue',
            'points': [
                {'x': 480, 'y': 1420},
                {'x': 620, 'y': 1260},
                {'x': 720, 'y': 1080},
                {'x': 840, 'y': 920}
            ],
            'width': 8,
            'color': '#FFFFFF',
            'casingColor': '#94A3B8',
            'casingWidth': 1.8,
            'smooth': True,
            'zIndex': 10
        },
        {
            'id': 'road-levanluong',
            'name': 'Đường Lê Văn Lương',
            'type': 'avenue',
            'points': [
                {'x': 150, 'y': 1720},
                {'x': 320, 'y': 1580},
                {'x': 480, 'y': 1420}
            ],
            'width': 8,
            'color': '#FFFFFF',
            'casingColor': '#94A3B8',
            'casingWidth': 1.8,
            'smooth': True,
            'zIndex': 10
        },
        {
            'id': 'road-giaiphong',
            'name': 'Trục Giải Phóng - Lê Duẩn',
            'type': 'highway',
            'points': [
                {'x': 1430, 'y': 820},
                {'x': 1440, 'y': 1040},
                {'x': 1460, 'y': 1300},
                {'x': 1470, 'y': 1600},
                {'x': 1480, 'y': 1732}
            ],
            'width': 10,
            'color': '#FFE082',
            'casingColor': '#F59E0B',
            'casingWidth': 2.0,
            'smooth': True,
            'zIndex': 11
        },
        {
            'id': 'road-caucang-main',
            'name': 'Phố Cầu Cảng (Trục nối Cảng & Bia 88)',
            'type': 'avenue',
            'points': [
                {'x': 1460, 'y': 410},
                {'x': 1540, 'y': 420},
                {'x': 1620, 'y': 450},
                {'x': 1750, 'y': 460},
                {'x': 1994, 'y': 458}
            ],
            'width': 9,
            'color': '#FFFFFF',
            'casingColor': '#475569',
            'casingWidth': 2.0,
            'smooth': True,
            'zIndex': 12
        },
        {
            'id': 'road-bosong',
            'name': 'Đường Bờ Sông (Hiện trường số 14)',
            'type': 'street',
            'points': [
                {'x': 1700, 'y': 380},
                {'x': 1708, 'y': 452},
                {'x': 1728, 'y': 484},
                {'x': 1730, 'y': 520},
                {'x': 1750, 'y': 620}
            ],
            'width': 7,
            'color': '#FFFFFF',
            'casingColor': '#DC2626',
            'casingWidth': 2.0,
            'smooth': True,
            'zIndex': 13
        },
        {
            'id': 'road-boke',
            'name': 'Đường Bờ Kè (Phòng trọ số 8 & Ngõ 12)',
            'type': 'street',
            'points': [
                {'x': 1740, 'y': 620},
                {'x': 1766, 'y': 734},
                {'x': 1780, 'y': 880}
            ],
            'width': 6,
            'color': '#FFFFFF',
            'casingColor': '#64748B',
            'casingWidth': 1.6,
            'smooth': True,
            'zIndex': 11
        },
        {
            'id': 'road-doanket',
            'name': 'Đường Đoàn Kết (Nhà Mai & Vũ)',
            'type': 'street',
            'points': [
                {'x': 1728, 'y': 484},
                {'x': 1950, 'y': 490},
                {'x': 2188, 'y': 502},
                {'x': 2380, 'y': 520}
            ],
            'width': 6,
            'color': '#FFFFFF',
            'casingColor': '#64748B',
            'casingWidth': 1.6,
            'smooth': True,
            'zIndex': 11
        },
        {
            'id': 'road-cau-vinhtuy',
            'name': 'Cầu Vĩnh Tuy (Bắc qua Sông Hồng)',
            'type': 'bridge',
            'points': [
                {'x': 2180, 'y': 1480},
                {'x': 2350, 'y': 1580},
                {'x': 2474, 'y': 1660}
            ],
            'width': 12,
            'color': '#FFE082',
            'casingColor': '#1E293B',
            'casingWidth': 3.0,
            'isBridge': True,
            'smooth': True,
            'zIndex': 16
        },
        {
            'id': 'road-cau-longbien',
            'name': 'Cầu Long Biên / Chương Dương',
            'type': 'bridge',
            'points': [
                {'x': 1740, 'y': 380},
                {'x': 1960, 'y': 340},
                {'x': 2220, 'y': 300}
            ],
            'width': 10,
            'color': '#FFFFFF',
            'casingColor': '#1E293B',
            'casingWidth': 2.5,
            'isBridge': True,
            'smooth': True,
            'zIndex': 16
        }
    ]
    
    road_features.extend(master_arterials)
    
    # 2. Add scanned secondary street network
    for idx, s in enumerate(top_segments):
        road_features.append({
            'id': f'road-street-{idx + 1}',
            'name': f'Đường đô thị #{idx + 1}',
            'type': 'street',
            'points': s['points'],
            'width': 5,
            'color': '#FFFFFF',
            'casingColor': '#CBD5E1',
            'casingWidth': 1.4,
            'smooth': False,
            'zIndex': 8
        })
        
    print(f"   -> Đã dựng {len(road_features)} tuyến đường (gồm {len(master_arterials)} đại lộ/cầu chính và {len(top_segments)} tuyến phố nội thành).")
    return road_features

def get_canonical_railways():
    return [
        {
            'id': 'railway-catlinh',
            'name': 'Đường sắt đô thị Tuyến 2A (Cát Linh - Hà Đông)',
            'points': [
                {'x': 940, 'y': 910},
                {'x': 840, 'y': 1030},
                {'x': 740, 'y': 1220},
                {'x': 600, 'y': 1420},
                {'x': 450, 'y': 1620}
            ],
            'width': 10,
            'color': '#0EA5E9',
            'sleeperSpacing': 16,
            'smooth': True,
            'zIndex': 15
        },
        {
            'id': 'railway-bacnam',
            'name': 'Tuyến Đường sắt Quốc gia Bắc - Nam',
            'points': [
                {'x': 1700, 'y': 300},
                {'x': 1720, 'y': 440},
                {'x': 1740, 'y': 620},
                {'x': 1710, 'y': 950},
                {'x': 1690, 'y': 1300},
                {'x': 1710, 'y': 1732}
            ],
            'width': 8,
            'color': '#475569',
            'sleeperSpacing': 14,
            'smooth': True,
            'zIndex': 14
        }
    ]

def get_canonical_pois():
    # Canonical investigation hotspots with exact positions from Figma master image
    return [
        # Red Hotspot Badges (1 - 4, 6, 8, 9, 13)
        {
            'id': 'poi-1',
            'name': 'Số 14 Đường Bờ Sông (Hiện trường chính)',
            'shortName': 'Số 14 Bờ Sông',
            'category': 'crime_scene',
            'x': 1708,
            'y': 452,
            'address': 'Số 14, Đường Bờ Sông, P. Phân khu Cảng, Hà Nội',
            'phone': '024 3828 9110',
            'description': 'Hiện trường án mạng chính phát hiện thi thể nạn nhân Đỗ Tuấn Kiệt lúc rạng sáng.',
            'clueNotes': 'Vết trượt bùn bờ sông, túi chống nước tang vật bị vướng tại cọc neo số 4.',
            'badgeNumber': 1,
            'iconColor': '#FF3B30',
            'zIndex': 30
        },
        {
            'id': 'poi-2',
            'name': 'Số 12 Đường Bờ Sông (Nhà bà Lụa)',
            'shortName': 'Nhà bà Lụa',
            'category': 'residential',
            'x': 1728,
            'y': 484,
            'address': 'Số 12, Đường Bờ Sông, P. Phân khu Cảng, Hà Nội',
            'description': 'Nhà nhân chứng bà Lụa, quan sát thấy bóng người và đèn bật tắt bất thường lúc nửa đêm.',
            'badgeNumber': 2,
            'iconColor': '#FF3B30',
            'zIndex': 30
        },
        {
            'id': 'poi-3',
            'name': 'Số 10 Đường Bờ Sông (Nhà cũ bố mẹ Tùng)',
            'shortName': 'Nhà cũ Tùng',
            'category': 'residential',
            'x': 1730,
            'y': 520,
            'address': 'Số 10, Đường Bờ Sông, P. Phân khu Cảng, Hà Nội',
            'description': 'Ngôi nhà cũ của gia đình Tùng, hiện đã khóa cổng để hoang.',
            'badgeNumber': 3,
            'iconColor': '#FF3B30',
            'zIndex': 30
        },
        {
            'id': 'poi-4',
            'name': 'Bãi đất ven sông (Hiện trường 1996)',
            'shortName': 'Bãi sông 1996',
            'category': 'crime_scene',
            'x': 1742,
            'y': 384,
            'address': 'Khu bãi bồi ven sông cũ, P. Phân khu Cảng, Hà Nội',
            'description': 'Vị trí xảy ra vụ án đuối nước bí ẩn 10 năm trước.',
            'badgeNumber': 4,
            'iconColor': '#FF3B30',
            'zIndex': 30
        },
        {
            'id': 'poi-5',
            'name': 'Số 45 Đường Đoàn Kết (Nhà Mai & Vũ)',
            'shortName': 'Nhà Mai & Vũ',
            'category': 'residential',
            'x': 2188,
            'y': 502,
            'address': 'Số 45, Đường Đoàn Kết, P. Cảng Đông, Hà Nội',
            'description': 'Nơi cư trú của vợ chồng Mai và Đỗ Quốc Vũ.',
            'badgeNumber': 5,
            'iconColor': '#FF9500',
            'zIndex': 30
        },
        {
            'id': 'poi-6',
            'name': 'Số 8 Ngõ 12 Đường Bờ Kè (Phòng trọ Hà)',
            'shortName': 'Phòng trọ Hà',
            'category': 'residential',
            'x': 1766,
            'y': 734,
            'address': 'Số 8, Ngõ 12, Đường Bờ Kè, P. Phân khu Cảng, Hà Nội',
            'description': 'Căn phòng trọ nạn nhân Hà thuê trước khi xảy ra vụ việc.',
            'badgeNumber': 6,
            'iconColor': '#FF3B30',
            'zIndex': 30
        },
        {
            'id': 'poi-7',
            'name': 'Quán Bia 88 (Điểm hẹn mâu thuẫn)',
            'shortName': 'Quán Bia 88',
            'category': 'food',
            'x': 1994,
            'y': 458,
            'address': 'Số 88, Đường Vĩnh Hà, P. Cảng Đông, Hà Nội',
            'phone': '024 3982 8888',
            'description': 'Quán bia hơi nơi các đối tượng tụ tập uống rượu trước khi Kiệt tử vong.',
            'badgeNumber': 7,
            'iconColor': '#FF9500',
            'zIndex': 30
        },
        {
            'id': 'poi-8',
            'name': 'Số 52 Đường Cầu Cảng (Nhà Đạt Gà)',
            'shortName': 'Nhà Đạt Gà',
            'category': 'residential',
            'x': 1462,
            'y': 412,
            'address': 'Số 52, Đường Cầu Cảng, P. Phân khu Cảng, Hà Nội',
            'description': 'Nhà riêng của Đạt Gà, đối tượng có mâu thuẫn nợ nần tiền bạc với nạn nhân.',
            'badgeNumber': 8,
            'iconColor': '#FF3B30',
            'zIndex': 30
        },
        {
            'id': 'poi-9',
            'name': 'Chợ Cầu Cảng (Sạp bán gia cầm)',
            'shortName': 'Chợ Cầu Cảng',
            'category': 'food',
            'x': 1544,
            'y': 422,
            'address': 'Khu B, Chợ Dân sinh Cầu Cảng, Hà Nội',
            'description': 'Nơi Đạt Gà kinh doanh sạp gia cầm, nhiều tiểu thương xác nhận sự có mặt.',
            'badgeNumber': 9,
            'iconColor': '#FF3B30',
            'zIndex': 30
        },
        {
            'id': 'poi-10',
            'name': 'Bến xe khách Hoàng Long',
            'shortName': 'Bến xe Hoàng Long',
            'category': 'transit',
            'x': 1760,
            'y': 880,
            'address': 'Đường Phân khu Cảng, Q. Sông Hồng, Hà Nội',
            'phone': '024 3928 2828',
            'description': 'Tuyến xe khách liên tỉnh Đạt Gà gửi hàng gia cầm.',
            'badgeNumber': 10,
            'iconColor': '#0F9D58',
            'zIndex': 28
        },
        {
            'id': 'poi-11',
            'name': 'Nhà nghỉ Hoàng Gia',
            'shortName': 'Nhà nghỉ Hoàng Gia',
            'category': 'residential',
            'x': 2160,
            'y': 530,
            'address': 'Đường Đoàn Kết, P. Cảng Đông, Hà Nội',
            'phone': '024 3862 9999',
            'description': 'Địa điểm khả nghi các đối tượng thuê phòng lưu trú ngắn hạn.',
            'badgeNumber': 11,
            'iconColor': '#9333EA',
            'zIndex': 28
        },
        {
            'id': 'poi-12',
            'name': 'Số 18 Phố Cầu Bươu (Lạc Hà / Nhà Tùng)',
            'shortName': 'Lạc Hà (Tùng)',
            'category': 'residential',
            'x': 1348,
            'y': 142,
            'address': 'Số 18 Phố Cầu Bươu, Phường Lạc Hà, Hà Nội',
            'description': 'Chỗ ở hiện tại của Tùng sau khi chuyển khỏi khu Cảng.',
            'badgeNumber': 12,
            'iconColor': '#FF9500',
            'zIndex': 30
        },
        {
            'id': 'poi-13',
            'name': 'Cty TNHH Vận tải Sông Hồng',
            'shortName': 'Cty Vận tải Sông Hồng',
            'category': 'warehouse',
            'x': 1568,
            'y': 378,
            'address': 'Số 15 Cảng Cát Lái, Hà Nội',
            'phone': '024 3829 5566',
            'description': 'Doanh nghiệp vận tải đường sông nơi phát hiện lệnh xuất kho bất thường.',
            'badgeNumber': 13,
            'iconColor': '#FF3B30',
            'zIndex': 30
        },
        {
            'id': 'poi-17',
            'name': 'Kho Container Cảng Tây (Khu vực số 17)',
            'shortName': 'Cảng Tây #17',
            'category': 'secret',
            'x': 1268,
            'y': 486,
            'address': 'Khu bãi bốc dỡ Cảng Tây, Hà Nội',
            'description': 'Khu vực container hàng rời, có bảo vệ tuần tra đêm.',
            'badgeNumber': 17,
            'iconColor': '#AF52DE',
            'zIndex': 30
        },
        # Prominent City Landmarks & Badges
        {
            'id': 'poi-lotte',
            'name': 'Khách sạn Lotte Hà Nội',
            'shortName': 'Lotte Hotel',
            'category': 'food',
            'x': 540,
            'y': 560,
            'address': 'Số 54 Liễu Giai, Ba Đình, Hà Nội',
            'phone': '024 3333 1000',
            'iconColor': '#EC4899',
            'zIndex': 28
        },
        {
            'id': 'poi-vtv',
            'name': 'Đài Truyền hình Việt Nam - VTV',
            'shortName': 'VTV Đài THVN',
            'category': 'transit',
            'x': 420,
            'y': 780,
            'address': 'Số 43 Nguyễn Chí Thanh, Ba Đình, Hà Nội',
            'iconColor': '#64748B',
            'zIndex': 28
        },
        {
            'id': 'poi-vanhoa',
            'name': 'Trường Đại học Văn hóa Hà Nội',
            'shortName': 'ĐH Văn hóa',
            'category': 'residential',
            'x': 640,
            'y': 840,
            'address': 'Số 418 Đường La Thành, Ô Chợ Dừa, Đống Đa, Hà Nội',
            'iconColor': '#64748B',
            'zIndex': 28
        },
        {
            'id': 'poi-hocvien-nganhang',
            'name': 'Học Viện Ngân Hàng',
            'shortName': 'HV Ngân Hàng',
            'category': 'residential',
            'x': 794,
            'y': 1300,
            'address': 'Số 12 Phố Chùa Bộc, Quang Trung, Đống Đa, Hà Nội',
            'iconColor': '#64748B',
            'zIndex': 28
        },
        {
            'id': 'poi-bachkhoa',
            'name': 'Đại học Bách Khoa Hà Nội',
            'shortName': 'ĐH Bách Khoa',
            'category': 'residential',
            'x': 1134,
            'y': 1370,
            'address': 'Số 1 Đại Cồ Việt, Bách Khoa, Hai Bà Trưng, Hà Nội',
            'iconColor': '#64748B',
            'zIndex': 28
        },
        {
            'id': 'poi-bv-daihoc-y',
            'name': 'Bệnh viện Đại học Y Hà Nội',
            'shortName': 'BV Đại học Y',
            'category': 'crime_scene',
            'x': 1024,
            'y': 1576,
            'address': 'Số 1 Tôn Thất Tùng, Trung Tự, Đống Đa, Hà Nội',
            'phone': '024 3574 7788',
            'iconColor': '#DC2626',
            'zIndex': 28
        },
        {
            'id': 'poi-bv-thanhnhan',
            'name': 'Bệnh viện Thanh Nhàn',
            'shortName': 'BV Thanh Nhàn',
            'category': 'crime_scene',
            'x': 1876,
            'y': 1538,
            'address': 'Số 42 Phố Thanh Nhàn, Hai Bà Trưng, Hà Nội',
            'phone': '024 3971 4373',
            'iconColor': '#DC2626',
            'zIndex': 28
        },
        {
            'id': 'poi-beta-cinemas',
            'name': 'Beta Cinemas Thanh Xuân',
            'shortName': 'Beta Cinemas',
            'category': 'secret',
            'x': 212,
            'y': 1564,
            'address': 'Tòa nhà Golden West, Lê Văn Lương, Thanh Xuân, Hà Nội',
            'iconColor': '#AF52DE',
            'zIndex': 28
        },
        {
            'id': 'poi-khu-dothi-royal',
            'name': 'Khu Đô Thị Royal City',
            'shortName': 'Royal City',
            'category': 'residential',
            'x': 450,
            'y': 1700,
            'address': 'Số 72A Nguyễn Trãi, Thượng Đình, Thanh Xuân, Hà Nội',
            'iconColor': '#64748B',
            'zIndex': 28
        },
        {
            'id': 'poi-baotang-khongquan',
            'name': 'Bảo tàng Phòng không - Không quân',
            'shortName': 'Bảo tàng PK-KQ',
            'category': 'secret',
            'x': 1000,
            'y': 1666,
            'address': 'Số 173C Trường Chinh, Khương Mai, Thanh Xuân, Hà Nội',
            'iconColor': '#AF52DE',
            'zIndex': 28
        },
        # Metro Stations
        {
            'id': 'poi-ga-catlinh',
            'name': 'Ga Cát Linh (Tuyến 2A)',
            'shortName': 'Ga Cát Linh',
            'category': 'transit',
            'x': 760,
            'y': 780,
            'iconColor': '#0284C7',
            'zIndex': 28
        },
        {
            'id': 'poi-ga-lathanh',
            'name': 'Ga La Thành (Tuyến 2A)',
            'shortName': 'Ga La Thành',
            'category': 'transit',
            'x': 700,
            'y': 1030,
            'iconColor': '#0284C7',
            'zIndex': 28
        },
        {
            'id': 'poi-ga-thaiha',
            'name': 'Ga Thái Hà (Tuyến 2A)',
            'shortName': 'Ga Thái Hà',
            'category': 'transit',
            'x': 570,
            'y': 1220,
            'iconColor': '#0284C7',
            'zIndex': 28
        },
        {
            'id': 'poi-ga-lang',
            'name': 'Ga Láng (Tuyến 2A)',
            'shortName': 'Ga Láng',
            'category': 'transit',
            'x': 500,
            'y': 1480,
            'iconColor': '#0284C7',
            'zIndex': 28
        },
        {
            'id': 'poi-ga-caugiay',
            'name': 'Nhà Ga Cầu Giấy',
            'shortName': 'Ga Cầu Giấy',
            'category': 'transit',
            'x': 180,
            'y': 740,
            'iconColor': '#0284C7',
            'zIndex': 28
        }
    ]

def get_canonical_labels():
    return [
        {
            'id': 'label-tay-ho',
            'text': 'TAY HO',
            'x': 800,
            'y': 120,
            'fontSize': 28,
            'color': '#475569',
            'fontWeight': 'black',
            'letterSpacing': 4,
            'zIndex': 20
        },
        {
            'id': 'label-lac-ha',
            'text': 'Lạc Hà',
            'x': 1360,
            'y': 100,
            'fontSize': 22,
            'color': '#1E293B',
            'fontWeight': 'bold',
            'zIndex': 20
        },
        {
            'id': 'label-cang-tay',
            'text': 'Cảng Tây',
            'x': 1240,
            'y': 680,
            'fontSize': 22,
            'color': '#1E293B',
            'fontWeight': 'bold',
            'zIndex': 20
        },
        {
            'id': 'label-phan-khu-cang',
            'text': 'Phân khu Cảng',
            'x': 1650,
            'y': 720,
            'fontSize': 26,
            'color': '#1E293B',
            'fontWeight': 'bold',
            'zIndex': 20
        },
        {
            'id': 'label-cang-dong',
            'text': 'Cảng Đông',
            'x': 2300,
            'y': 410,
            'fontSize': 22,
            'color': '#1E293B',
            'fontWeight': 'bold',
            'zIndex': 20
        },
        {
            'id': 'label-red-river',
            'text': 'Red River (Sông Hồng)',
            'x': 2110,
            'y': 1180,
            'fontSize': 18,
            'color': '#0284C7',
            'rotation': 65,
            'letterSpacing': 2,
            'fontWeight': 'bold',
            'zIndex': 20
        },
        {
            'id': 'label-cau-vinhtuy',
            'text': 'Cầu Vĩnh Tuy',
            'x': 2310,
            'y': 1460,
            'fontSize': 16,
            'color': '#0369A1',
            'fontWeight': 'bold',
            'zIndex': 20
        },
        {
            'id': 'label-to-15',
            'text': 'TỔ 15',
            'x': 410,
            'y': 440,
            'fontSize': 14,
            'color': '#64748B',
            'fontWeight': 'bold',
            'zIndex': 20
        },
        {
            'id': 'label-to-18',
            'text': 'TỔ 18',
            'x': 840,
            'y': 560,
            'fontSize': 14,
            'color': '#64748B',
            'fontWeight': 'bold',
            'zIndex': 20
        },
        {
            'id': 'label-to-danpho-8',
            'text': 'TỔ DÂN PHỐ SỐ 8',
            'x': 1280,
            'y': 1210,
            'fontSize': 14,
            'color': '#64748B',
            'fontWeight': 'bold',
            'zIndex': 20
        },
        {
            'id': 'label-to-danpho-5',
            'text': 'TỔ DÂN PHỐ SỐ 5',
            'x': 350,
            'y': 1490,
            'fontSize': 14,
            'color': '#64748B',
            'fontWeight': 'bold',
            'zIndex': 20
        },
        {
            'id': 'label-trung-hoa',
            'text': 'TRUNG HÒA NHÂN CHÍNH',
            'x': 160,
            'y': 1640,
            'fontSize': 13,
            'color': '#475569',
            'fontWeight': 'bold',
            'zIndex': 20
        },
        {
            'id': 'label-thai-tong',
            'text': 'Thái Tông',
            'x': 50,
            'y': 620,
            'fontSize': 16,
            'color': '#059669',
            'fontWeight': 'bold',
            'zIndex': 20
        }
    ]

def main():
    print(f"🚀 Bắt đầu scan Bản đồ Figma Master: {IMAGE_PATH}")
    if not os.path.exists(IMAGE_PATH):
        raise FileNotFoundError(f"Không tìm thấy ảnh tại: {IMAGE_PATH}")
        
    img = Image.open(IMAGE_PATH).convert('RGB')
    arr = np.array(img)
    w, h = img.size
    print(f"📐 Kích thước ảnh gốc: {w} x {h} px | Scale x{SCALE} -> Canvas: {int(w * SCALE)} x {int(h * SCALE)} px")
    
    # 1. Extract water features
    water = extract_water_features(arr)
    
    # 2. Extract park zones
    parks = extract_park_zones(arr)
    
    # 3. Extract urban cadastral blocks
    blocks = extract_urban_blocks(arr)
    zones = parks + blocks
    
    # 4. Extract road network
    roads = extract_road_network(arr)
    
    # 5. Railways
    railways = get_canonical_railways()
    
    # 6. POIs & Investigation Hotspots
    pois = get_canonical_pois()
    
    # 7. Typography Labels
    labels = get_canonical_labels()
    
    vector_data = {
        'version': '2.5.0-figma-scanned',
        'caseId': 'case_000',
        'canvasWidth': int(w * SCALE),
        'canvasHeight': int(h * SCALE),
        'backgroundColor': '#F3F4F3',
        'water': water,
        'zones': zones,
        'roads': roads,
        'railways': railways,
        'pois': pois,
        'labels': labels,
        'updatedAt': '2026-10-18T13:00:00.000Z'
    }
    
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(vector_data, f, ensure_ascii=False, indent=2)
        
    size_kb = os.path.getsize(OUTPUT_PATH) / 1024
    print("\n🎉 HOÀN TẤT SCAN & LƯU VÀO DATABASE THÀNH CÔNG!")
    print(f"📁 Database file: {OUTPUT_PATH}")
    print(f"📦 Dung lượng file JSON: {size_kb:.1f} KB")
    print(f"📊 Thống kê các lớp vector:")
    print(f"   - Water features (Sông & Hồ): {len(water)}")
    print(f"   - Zones (Công viên & Ô quy hoạch): {len(zones)}")
    print(f"   - Roads (Đại lộ & Phố đô thị): {len(roads)}")
    print(f"   - Railways (Đường sắt & Metro): {len(railways)}")
    print(f"   - POIs (Hotspots điều tra & Địa danh): {len(pois)}")
    print(f"   - Typography Labels (Nhãn chữ): {len(labels)}")

if __name__ == '__main__':
    main()
