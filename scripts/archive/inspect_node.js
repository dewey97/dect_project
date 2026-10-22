const https = require('https');
const fs = require('fs');

const token = process.env.FIGMA_PAT || process.env.FIGMA_ACCESS_TOKEN || '';
const fileKey = 'WzgF9gHuaOKu8te2SV3eEp';
const nodeId = '22:393';

const options = {
  hostname: 'api.figma.com',
  path: `/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}`,
  headers: { 'X-Figma-Token': token }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      if (!parsed.nodes || !parsed.nodes[nodeId]) {
        console.log('Node not found:', data.slice(0, 500));
        return;
      }
      const node = parsed.nodes[nodeId].document;
      console.log('=== NODE INFO ===');
      console.log('Name:', node.name);
      console.log('Type:', node.type);
      console.log('Bounding Box:', node.absoluteBoundingBox);
      console.log('Children count:', node.children ? node.children.length : 0);
      if (node.children) {
        console.log('Children:', node.children.map(c => ({ id: c.id, name: c.name, type: c.type, bounds: c.absoluteBoundingBox })));
      }
      fs.writeFileSync('scripts/figma_node_22_393.json', JSON.stringify(node, null, 2));
      console.log('Saved to scripts/figma_node_22_393.json');
    } catch (e) {
      console.error('Error:', e.message);
    }
  });
}).on('error', err => console.error(err));
