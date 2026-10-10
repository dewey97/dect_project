const https = require('https');
const token = process.env.FIGMA_TOKEN || '';
const fileKey = 'WzgF9gHuaOKu8te2SV3eEp';

function inspectLendi(nodeId, depth = 3) {
  const options = {
    hostname: 'api.figma.com',
    path: `/v1/files/${fileKey}/nodes?ids=${nodeId}&depth=${depth}`,
    headers: { 'X-Figma-Token': token }
  };

  https.get(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        const node = json.nodes[nodeId].document;
        console.log(`\n=== NODE: [${node.id}] ${node.name} (${node.type}) ===`);
        console.log(`BBox:`, node.absoluteBoundingBox);
        function printTree(n, indent = 0) {
          const text = n.characters ? ` -> "${n.characters.replace(/\n/g, ' ')}"` : '';
          const bbox = n.absoluteBoundingBox ? ` [w:${Math.round(n.absoluteBoundingBox.width)}, h:${Math.round(n.absoluteBoundingBox.height)}]` : '';
          console.log(`${' '.repeat(indent * 2)}[${n.id}] ${n.name} (${n.type})${bbox}${text}`);
          if (n.children) {
            n.children.forEach(c => printTree(c, indent + 1));
          }
        }
        printTree(node);
      } catch (e) {
        console.error(e.message);
      }
    });
  });
}

inspectLendi('14:31', 6);
