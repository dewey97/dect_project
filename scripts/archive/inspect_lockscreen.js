const https = require('https');
const fs = require('fs');

const token = process.env.FIGMA_PAT || process.env.FIGMA_ACCESS_TOKEN || '';
const fileKey = 'WzgF9gHuaOKu8te2SV3eEp';
const nodeId = '22:389'; // Lock Screen Frame

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
      const node = parsed.nodes[nodeId]?.document;
      fs.writeFileSync('scripts/lockscreen_node.json', JSON.stringify(node, null, 2));
      console.log('Saved lockscreen_node.json');
      
      // In ra cấu trúc con
      function summarize(n, depth = 0) {
        const indent = '  '.repeat(depth);
        console.log(`${indent}- [${n.id}] "${n.name}" (${n.type}) [w:${Math.round(n.absoluteBoundingBox?.width || 0)}, h:${Math.round(n.absoluteBoundingBox?.height || 0)}]`);
        if (n.characters) {
          console.log(`${indent}  Text: "${n.characters.replace(/\n/g, '\\n')}"`);
        }
        if (n.children) {
          n.children.forEach(c => summarize(c, depth + 1));
        }
      }
      summarize(node);
    } catch (e) {
      console.error('Error:', e.message);
    }
  });
}).on('error', err => console.error(err));
