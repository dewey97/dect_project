const https = require('https');
const token = process.env.FIGMA_TOKEN || '';
const fileKey = 'sIAYKRy84xtmgGs7oAqxg6';

function fetchNodeDetails(nodeId) {
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
        const node = json.nodes[nodeId].document;
        console.log(JSON.stringify(node, null, 2));
      } catch (e) {
        console.error(e.message);
      }
    });
  });
}

const target = process.argv[2] || '92:303';
fetchNodeDetails(target);
