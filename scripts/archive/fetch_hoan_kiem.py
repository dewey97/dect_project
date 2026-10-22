import urllib.request
import json
import urllib.parse
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

q = """[out:json][timeout:30];
(
  way["natural"="water"](21.025,105.850,21.033,105.856);
  relation["natural"="water"](21.025,105.850,21.033,105.856);
);
out body;
>;
out skel qt;"""

url = 'https://overpass-api.de/api/interpreter'
params = urllib.parse.urlencode({'data': q}).encode('utf-8')
req = urllib.request.Request(
    url,
    data=params,
    headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept': 'application/json'
    }
)

try:
    with urllib.request.urlopen(req, timeout=25) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        elements = data.get('elements', [])
        print("Total elements received:", len(elements))
        nodes = {e['id']: (e['lat'], e['lon']) for e in elements if e['type'] == 'node'}
        ways = [e for e in elements if e['type'] == 'way']
        relations = [e for e in elements if e['type'] == 'relation']
        print(f"Nodes: {len(nodes)}, Ways: {len(ways)}, Relations: {len(relations)}")
        for w in ways:
            tags = w.get('tags', {})
            print("Way ID:", w['id'], "Name:", tags.get('name'), "Node count:", len(w.get('nodes', [])))
        for r in relations:
            print("Relation ID:", r['id'], "Name:", r.get('tags', {}).get('name'), "Members:", len(r.get('members', [])))
            
        with open('scripts/hoan_kiem_raw.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False)
except Exception as e:
    print("Error fetching Hoan Kiem:", e)
