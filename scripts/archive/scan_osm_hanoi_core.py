#!/usr/bin/env python3
"""
OSM Real-World Vector Map Scanner for Hanoi Central Hub
Fetches exact GPS nodes, highways, water bodies, and parks from Overpass API (OpenStreetMap)
Transforms spherical lat/lon into Map Studio Vector Canvas coordinates.
"""

import urllib.request
import urllib.parse
import json
import math
import os
import sys

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Bounding Box: Khu vực Hoàn Kiếm, Ba Đình, Hồ Tây Nam, Sông Hồng, Cầu Long Biên, Phố Cổ
# [south, west, north, east]
# Min Lat: 21.010, Min Lon: 105.820
# Max Lat: 21.055, Max Lon: 105.875
BBOX = "21.010,105.820,21.055,105.875"
SOUTH = 21.010
WEST = 105.820
NORTH = 21.055
EAST = 105.875

CANVAS_WIDTH = 3600
CANVAS_HEIGHT = 2800
PADDING = 100

def lat_lon_to_xy(lat, lon):
    # Mercator projection mapping
    x = PADDING + ((lon - WEST) / (EAST - WEST)) * (CANVAS_WIDTH - 2 * PADDING)
    # Latitude increases going north, so invert Y for canvas
    y = PADDING + ((NORTH - lat) / (NORTH - SOUTH)) * (CANVAS_HEIGHT - 2 * PADDING)
    return {'x': round(x, 1), 'y': round(y, 1)}

OVERPASS_QUERY = f"""
[out:json][timeout:60];
(
  // Đường sá chính
  way["highway"~"motorway|trunk|primary|secondary|tertiary|residential"]({BBOX});
  // Sông, Hồ nước
  way["natural"="water"]({BBOX});
  relation["natural"="water"]({BBOX});
  way["waterway"~"river|canal"]({BBOX});
  // Đường sắt
  way["railway"~"rail|narrow_gauge|subway"]({BBOX});
  // Công viên, quảng trường, di tích
  way["leisure"="park"]({BBOX});
  way["landuse"="recreation_ground"]({BBOX});
  // Địa danh nổi bật
  node["amenity"~"hospital|place_of_worship"]({BBOX});
  node["tourism"~"attraction|museum|hotel"]({BBOX});
  node["railway"="station"]({BBOX});
);
out body;
>;
out skel qt;
"""

def fetch_osm_data():
    url = "https://overpass-api.de/api/interpreter"
    data = urllib.parse.urlencode({'data': OVERPASS_QUERY}).encode('utf-8')
    req = urllib.request.Request(
        url,
        data=data,
        headers={'User-Agent': 'DetectiveMapStudio/2.0 (code_world/dect_project)'}
    )
    print("📡 Đang gửi request tới Overpass API (OpenStreetMap)...")
    with urllib.request.urlopen(req, timeout=90) as response:
        content = response.read().decode('utf-8')
        return json.loads(content)

def process_osm_to_map_vector(osm_data):
    elements = osm_data.get('elements', [])
    nodes = {}
    ways = []
    poi_nodes = []

    print(f"📊 Đã nhận {len(elements)} đối tượng thô từ OpenStreetMap.")

    for el in elements:
        if el['type'] == 'node':
            nodes[el['id']] = {'lat': el['lat'], 'lon': el['lon']}
            tags = el.get('tags', {})
            if tags and any(k in tags for k in ['amenity', 'tourism', 'railway', 'name']):
                poi_nodes.append(el)
        elif el['type'] == 'way':
            ways.append(el)

    water_features = []
    zone_features = []
    road_features = []
    railway_features = []
    pois = []
    labels = []

    # 1. Process Ways
    for w in ways:
        w_id = w['id']
        tags = w.get('tags', {})
        node_ids = w.get('nodes', [])
        
        # Build coordinates
        pts = []
        for nid in node_ids:
            if nid in nodes:
                pt = lat_lon_to_xy(nodes[nid]['lat'], nodes[nid]['lon'])
                pts.append(pt)

        if len(pts) < 2:
            continue

        name = tags.get('name', '')
        is_closed = (node_ids[0] == node_ids[-1]) if len(node_ids) > 2 else False

        # Water features
        if tags.get('natural') == 'water' or tags.get('waterway') in ['river', 'canal']:
            water_type = 'river' if tags.get('waterway') == 'river' or 'Sông' in name else 'lake'
            water_features.append({
                'id': f'osm-water-{w_id}',
                'name': name or ('Sông Hồng' if 'Sông' in name else 'Hồ nước'),
                'type': water_type,
                'points': pts,
                'closed': is_closed,
                'width': 60 if water_type == 'river' else 20,
                'color': '#80C2E8' if water_type == 'lake' else '#74B7DE',
                'opacity': 0.9,
                'smooth': True,
                'zIndex': 2
            })
            continue

        # Parks & Zones
        if tags.get('leisure') == 'park' or tags.get('landuse') in ['recreation_ground', 'forest']:
            if is_closed and len(pts) >= 3:
                zone_features.append({
                    'id': f'osm-zone-{w_id}',
                    'name': name or 'Khuôn viên / Công viên',
                    'category': 'park',
                    'points': pts,
                    'fillColor': '#D8EEDD',
                    'strokeColor': '#B7E2BF',
                    'strokeWidth': 1.5,
                    'opacity': 0.85,
                    'zIndex': 4
                })
                continue

        # Railways
        if tags.get('railway') in ['rail', 'narrow_gauge', 'subway']:
            railway_features.append({
                'id': f'osm-rail-{w_id}',
                'name': name or 'Đường sắt Bắc Nam / Long Biên',
                'points': pts,
                'width': 6,
                'color': '#475569',
                'sleeperSpacing': 14,
                'smooth': True,
                'zIndex': 12
            })
            continue

        # Highways & Roads
        h_type = tags.get('highway')
        if h_type:
            is_bridge = tags.get('bridge') == 'yes'
            road_type = 'highway' if h_type in ['motorway', 'trunk', 'primary'] else \
                        'avenue' if h_type == 'secondary' else \
                        'street' if h_type in ['tertiary', 'residential'] else 'alley'
            
            w_size = 14 if road_type == 'highway' else 10 if road_type == 'avenue' else 6
            casing_w = 2.5 if road_type in ['highway', 'avenue'] else 1.5
            color = '#FFF3D6' if road_type == 'highway' else '#FFFFFF'
            casing_color = '#F59E0B' if road_type == 'highway' else '#CBD5E1'

            road_features.append({
                'id': f'osm-road-{w_id}',
                'name': name or f'Đường {h_type}',
                'type': road_type,
                'points': pts,
                'width': w_size,
                'color': color,
                'casingColor': casing_color,
                'casingWidth': casing_w,
                'isBridge': is_bridge,
                'smooth': True,
                'zIndex': 8 if road_type == 'highway' else 7 if road_type == 'avenue' else 6
            })

    # 2. Process POIs
    badge_counter = 1
    for p in poi_nodes:
        tags = p.get('tags', {})
        name = tags.get('name')
        if not name:
            continue

        lat = p['lat']
        lon = p['lon']
        pt = lat_lon_to_xy(lat, lon)

        category = 'transit' if 'railway' in tags or 'bus' in tags.get('amenity', '') else \
                   'crime_scene' if 'hospital' in tags.get('amenity', '') else \
                   'secret' if 'museum' in tags.get('tourism', '') or 'worship' in tags.get('amenity', '') else \
                   'residential'

        pois.append({
            'id': f'osm-poi-{p["id"]}',
            'name': name,
            'shortName': name.split(' - ')[0][:25],
            'category': category,
            'x': pt['x'],
            'y': pt['y'],
            'badgeNumber': badge_counter,
            'zIndex': 30
        })
        badge_counter += 1
        if badge_counter > 50:
            break

    # 3. Canonical Labels
    labels.append({
        'id': 'osm-label-red-river',
        'text': 'SÔNG HỒNG',
        'x': 2750,
        'y': 650,
        'fontSize': 24,
        'color': '#0284C7',
        'rotation': 45,
        'letterSpacing': 4,
        'fontWeight': 'bold',
        'zIndex': 22
    })
    labels.append({
        'id': 'osm-label-hoan-kiem',
        'text': 'QUẬN HOÀN KIẾM',
        'x': 1850,
        'y': 1600,
        'fontSize': 20,
        'color': '#475569',
        'letterSpacing': 3,
        'fontWeight': 'bold',
        'zIndex': 22
    })
    labels.append({
        'id': 'osm-label-ba-dinh',
        'text': 'QUẬN BA ĐÌNH',
        'x': 900,
        'y': 1050,
        'fontSize': 20,
        'color': '#475569',
        'letterSpacing': 3,
        'fontWeight': 'bold',
        'zIndex': 22
    })
    labels.append({
        'id': 'osm-label-tay-ho',
        'text': 'HỒ TÂY',
        'x': 950,
        'y': 400,
        'fontSize': 22,
        'color': '#0284C7',
        'letterSpacing': 3,
        'fontWeight': 'bold',
        'zIndex': 22
    })

    return {
        'version': '3.0.0-osm-realworld-gps',
        'caseId': 'case_000',
        'canvasWidth': CANVAS_WIDTH,
        'canvasHeight': CANVAS_HEIGHT,
        'backgroundColor': '#F3F4F3',
        'water': water_features,
        'zones': zone_features,
        'roads': road_features,
        'railways': railway_features,
        'pois': pois,
        'labels': labels,
        'updatedAt': '2026-10-18T17:00:00.000Z'
    }

def main():
    print("🚀 Bắt đầu quét dữ liệu thực tế GPS từ OpenStreetMap...")
    osm_raw = fetch_osm_data()
    print("🔄 Đang xử lý chuyển đổi hình học GIS sang Canvas Vector...")
    result_map = process_osm_to_map_vector(osm_raw)

    out_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'maps', 'case_000_vector.json')
    # Backup file cũ
    backup_file = out_file.replace('.json', '.backup_old.json')
    if os.path.exists(out_file) and not os.path.exists(backup_file):
        import shutil
        shutil.copyfile(out_file, backup_file)
        print(f"💾 Đã sao lưu dữ liệu cũ tại: {backup_file}")

    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(result_map, f, ensure_ascii=False, indent=2)

    print("✅ XUẤT SẮC! Đã ghi dữ liệu bản đồ GPS thực tế vào:", out_file)
    print(f"📊 Thống kê:")
    print(f"   - Sông & Hồ nước: {len(result_map['water'])}")
    print(f"   - Công viên & Phân khu: {len(result_map['zones'])}")
    print(f"   - Tuyến đường thật: {len(result_map['roads'])}")
    print(f"   - Tuyến đường sắt: {len(result_map['railways'])}")
    print(f"   - Địa danh nổi tiếng: {len(result_map['pois'])}")

if __name__ == '__main__':
    main()
