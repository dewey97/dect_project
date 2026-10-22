const https = require('https');
const token = process.env.FIGMA_TOKEN || '';
const fileKey = 'sIAYKRy84xtmgGs7oAqxg6';

function fetchDeepTree(nodeId, depth = 4) {
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
        const doc = json.nodes[nodeId].document;
        function printTree(node, indent = 0) {
          const text = node.characters ? ` | text: "${node.characters}"` : '';
          const bounds = node.absoluteBoundingBox ? ` | [w:${Math.round(node.absoluteBoundingBox.width)}, h:${Math.round(node.absoluteBoundingBox.height)}]` : '';
          console.log(`${' '.repeat(indent * 2)}[${node.id}] ${node.name} (${node.type})${bounds}${text}`);
          if (node.children) {
            node.children.forEach(c => printTree(c, indent + 1));
          }
        }
        printTree(doc);
      } catch (e) {
        console.error(e.message);
      }
    });
  });
}

fetchDeepTree('92:300', 4);
