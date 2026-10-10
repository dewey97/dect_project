const https = require('https');
const fs = require('fs');

const token = process.env.FIGMA_ACCESS_TOKEN || '';
const fileKey = 'WzgF9gHuaOKu8te2SV3eEp';

https.get({
  hostname: 'api.figma.com',
  path: `/v1/files/${fileKey}/nodes?ids=14:32`,
  headers: { 'X-Figma-Token': token }
}, res => {
  let d = ''; res.on('data', c => d += c);
  res.on('end', () => {
    const node = JSON.parse(d).nodes['14:32']?.document;
    fs.writeFileSync('scripts/home_screen_14_32.json', JSON.stringify(node, null, 2));
    console.log('Saved home_screen_14_32.json');
    
    // List top children of 14:32
    if (node?.children) {
      console.log('Children count:', node.children.length);
      node.children.forEach(c => {
        console.log(`- [${c.id}] "${c.name}" (${c.type}) bounds:`, c.absoluteBoundingBox);
      });
    }
  });
});
