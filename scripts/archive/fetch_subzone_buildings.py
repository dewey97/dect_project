#!/usr/bin/env python3
"""
Fetch real-world building footprints and detailed alleys for Hanoi Old Quarter / Long Bien Bridge
directly from official OpenStreetMap API 0.6 (XML) and inject into case_000_vector.json & world_vector_map.json
"""

import json
import urllib.request
import xml.etree.ElementTree as ET
import os
import sys

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Canvas Coordinate Projection
SOUTH = 21.010
WEST = 105.820
NORTH = 21.055
EAST = 105.875

CANVAS_WIDTH = 3600
CANVAS_HEIGHT = 2800
PADDING = 100

def lat_lon_to_xy(lat, lon):
    x = PADDING + ((lon - WEST) / (EAST - WEST)) * (CANVAS_WIDTH - 2 * PADDING)
    y = PADDING + ((NORTH - lat) / (NORTH - SOUTH)) * (CANVAS_HEIGHT - 2 * PADDING)
    return {'x': round(x, 1), 'y': round(y, 1)}

# Bounding boxes for the core Old Quarter & Long Bien Sub-Zone
# [min_lon, min_lat, max_lon, max_lat]
BBOXES = [
    # Khu vực Hoàn Kiếm Bắc & Phố Cổ trung tâm (Hàng Đào, Hàng Ngang, Hàng Bạc, Mã Mây, Tạ Hiện)
    (105.848, 21.030, 105.856, 21.036),
    # Khu vực Chợ Đồng Xuân & Đầu Cầu Long Biên
    (105.847, 21.036, 105.855, 21.042),
    # Khu vực Bờ Sông / Trần Nhật Duật / Bến Cảng ven sông
    (105.855, 21.032, 105.862, 21.040)
]

def fetch_osm_xml(min_lon, min_lat, max_lon, max_lat):
    url = f"https://api.openstreetmap.org/api/0.6/map?bbox={min_lon},{min_lat},{max_lon},{max_lat}"
    print(f"📡 Đang tải dữ liệu XML từ OSM API 0.6 ({min_lon},{min_lat} -> {max_lon},{max_lat})...")
    req = urllib.request.Request(
        url,
        headers={'User-Agent': 'DetectiveCaseSystem/3.0 (academic/investigation-game)'}
    )
    with urllib.request.urlopen(req, timeout=30) as res:
        return res.read()

def parse_osm_xml(xml_bytes):
    root = ET.fromstring(xml_bytes)
    nodes = {}
    for node in root.findall('node'):
        nid = node.attrib['id']
        lat = float(node.attrib['lat'])
        lon = float(node.attrib['lon'])
        nodes[nid] = (lat, lon)

    buildings = []
    alleys = []

    for way in root.findall('way'):
        wid = way.attrib['id']
        tags = {tag.attrib['k']: tag.attrib['v'] for tag in way.findall('tag')}
        nd_refs = [nd.attrib['ref'] for nd in way.findall('nd')]

        if 'building' in tags:
            if len(nd_refs) >= 4 and nd_refs[0] == nd_refs[-1]:
                pts = []
                for ref in nd_refs:
                    if ref in nodes:
                        lat, lon = nodes[ref]
                        pts.append(lat_lon_to_xy(lat, lon))
                if len(pts) >= 4:
                    b_type = tags.get('building', 'yes')
                    name = tags.get('name', '')
                    
                    # Color styling by archetype
                    if b_type in ['temple', 'church', 'shrine', 'pagoda']:
                        fill = '#FEF3C7'
                        stroke = '#F59E0B'
                    elif b_type in ['commercial', 'retail']:
                        fill = '#E2E8F0'
                        stroke = '#94A3B8'
                    elif b_type in ['school', 'hospital', 'civic', 'public']:
                        fill = '#EFF6FF'
                        stroke = '#93C5FD'
                    else:
                        fill = '#ECEFF1'
                        stroke = '#CFD8DC'

                    buildings.append({
                        'id': f"osm-bldg-{wid}",
                        'name': name or None,
                        'points': pts,
                        'color': fill,
                        'strokeColor': stroke,
                        'strokeWidth': 0.8,
                        'opacity': 0.9,
                        'zIndex': 4
                    })
        elif 'highway' in tags:
            h_type = tags['highway']
            if h_type in ['service', 'pedestrian', 'footway', 'path', 'living_street', 'steps']:
                pts = []
                for ref in nd_refs:
                    if ref in nodes:
                        lat, lon = nodes[ref]
                        pts.append(lat_lon_to_xy(lat, lon))
                if len(pts) >= 2:
                    name = tags.get('name', 'Ngõ Phố Cổ')
                    alleys.append({
                        'id': f"osm-alley-{wid}",
                        'name': name,
                        'type': 'alley',
                        'points': pts,
                        'width': 3.5,
                        'color': '#FFFFFF',
                        'casingColor': '#CBD5E1',
                        'casingWidth': 1.0,
                        'smooth': True,
                        'zIndex': 5
                    })

    return buildings, alleys

def main():
    all_buildings = {}
    all_alleys = {}

    for bbox in BBOXES:
        try:
            xml_bytes = fetch_osm_xml(*bbox)
            bldgs, alleys = parse_osm_xml(xml_bytes)
            print(f"  -> Tải được {len(bldgs)} tòa nhà và {len(alleys)} ngõ ngách.")
            for b in bldgs:
                all_buildings[b['id']] = b
            for a in alleys:
                all_alleys[a['id']] = a
        except Exception as e:
            print(f"  ⚠️ Lỗi khi tải bbox {bbox}: {e}")

    building_list = list(all_buildings.values())
    alley_list = list(all_alleys.values())

    print(f"\n✨ TỔNG HỢP: {len(building_list)} khối nhà thực tế và {len(alley_list)} tuyến ngõ chi tiết.")

    if not building_list:
        print("Không có tòa nhà nào được tạo.")
        return

    # Update case_000_vector.json
    case_path = os.path.join('data', 'maps', 'case_000_vector.json')
    if os.path.exists(case_path):
        with open(case_path, 'r', encoding='utf-8') as f:
            case_data = json.load(f)
        
        # Preserve existing roads, but add alleys if not already present
        existing_road_ids = {r['id'] for r in case_data.get('roads', [])}
        new_alleys = [a for a in alley_list if a['id'] not in existing_road_ids]
        
        case_data['buildings'] = building_list
        case_data['roads'] = case_data.get('roads', []) + new_alleys
        case_data['updatedAt'] = "2026-10-19T17:35:00.000Z"
        
        with open(case_path, 'w', encoding='utf-8') as f:
            json.dump(case_data, f, ensure_ascii=False, indent=2)
        print(f"💾 Đã lưu vào {case_path} (+{len(building_list)} tòa nhà, +{len(new_alleys)} ngõ)")

    # Update world_vector_map.json
    world_path = os.path.join('data', 'maps', 'world_vector_map.json')
    if os.path.exists(world_path):
        with open(world_path, 'r', encoding='utf-8') as f:
            world_data = json.load(f)
            
        existing_road_ids = {r['id'] for r in world_data.get('roads', [])}
        new_alleys = [a for a in alley_list if a['id'] not in existing_road_ids]
        
        world_data['buildings'] = building_list
        world_data['roads'] = world_data.get('roads', []) + new_alleys
        world_data['updatedAt'] = "2026-10-19T17:35:00.000Z"
        
        with open(world_path, 'w', encoding='utf-8') as f:
            json.dump(world_data, f, ensure_ascii=False, indent=2)
        print(f"💾 Đã lưu vào {world_path} (+{len(building_list)} tòa nhà, +{len(new_alleys)} ngõ)")

if __name__ == '__main__':
    main()
