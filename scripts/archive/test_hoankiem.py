import urllib.request
import urllib.parse
import json

q = """[out:json];
(
  way["natural"="water"](21.025,105.850,21.032,105.856);
  relation["natural"="water"](21.025,105.850,21.032,105.856);
);
out geom;
"""

url = "https://overpass-api.de/api/interpreter"
data = urllib.parse.urlencode({'data': q}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'User-Agent': 'DectTest/1.0'})
res = urllib.request.urlopen(req)
j = json.loads(res.read().decode('utf-8'))
for el in j['elements']:
    print(el.get('type'), el.get('id'), el.get('tags'))
