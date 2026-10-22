const https = require('https');
const token = process.env.FIGMA_ACCESS_TOKEN || '';
const fileKey = 'sIAYKRy84xtmgGs7oAqxg6';

function fetchNode(nodeId) {
  const options = {
    hostname: 'api.figma.com',
    path: `/v1/files/${fileKey}/nodes?ids=${nodeId}`,
    headers: { 'X-Figma-Token': token }
  };

  https.get(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        if (json.status === 429) {
          console.log('429 Rate limited. Vui long doi 30s.');
          return;
        }
        const nodeObj = json.nodes[nodeId];
        if (!nodeObj) {
          console.log('Khong tim thay node', nodeId, json);
          return;
        }
        const doc = nodeObj.document;
        console.log('--- NODE INFO ---');
        console.log('ID:', doc.id);
        console.log('Name:', doc.name);
        console.log('Type:', doc.type);
        console.log('BBox:', doc.absoluteBoundingBox);
        console.log('Layout:', doc.layoutMode, doc.primaryAxisAlignItems, doc.counterAxisAlignItems);
        console.log('Children count:', doc.children ? doc.children.length : 0);
        if (doc.children) {
          doc.children.forEach((c, i) => {
            console.log(`[${i}] ID: ${c.id} | Name: "${c.name}" | Type: ${c.type} | BBox:`, c.absoluteBoundingBox);
          });
        }
      } catch (e) {
        console.error('Error parsing:', e.message);
      }
    });
  }).on('error', err => console.error(err));
}

const targetNode = process.argv[2] || '92:300';
fetchNode(targetNode);
