const https = require('https');
const fs = require('fs');

const token = process.env.FIGMA_PAT || process.env.FIGMA_ACCESS_TOKEN || '';
const fileKey = 'WzgF9gHuaOKu8te2SV3eEp';

// Query file with depth=2 to see all top-level frames/screens on pages
const options = {
  hostname: 'api.figma.com',
  path: `/v1/files/${fileKey}?depth=3`,
  headers: { 'X-Figma-Token': token }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('File Name:', parsed.name);
      
      const pages = parsed.document.children;
      pages.forEach(page => {
        console.log(`Page: [${page.id}] ${page.name}`);
        if (page.children) {
          page.children.forEach(frame => {
            console.log(`  Frame/Node: [${frame.id}] "${frame.name}" (${frame.type}) - ${JSON.stringify(frame.absoluteBoundingBox)}`);
            // Check if node 22:393 is in this frame or check its children
            if (frame.children) {
              frame.children.forEach(sub => {
                if (sub.id === '22:393') {
                  console.log(`    FOUND 22:393 as direct child of [${frame.id}] "${frame.name}"`);
                }
              });
            }
          });
        }
      });
      
      // Also search recursively for 22:393 and its ancestors
      function findNodeAndPath(curr, path = []) {
        if (curr.id === '22:393') {
          return [...path, curr];
        }
        if (curr.children) {
          for (const child of curr.children) {
            const res = findNodeAndPath(child, [...path, curr]);
            if (res) return res;
          }
        }
        return null;
      }

      const path = findNodeAndPath(parsed.document);
      if (path) {
        console.log('\n=== HIERARCHY PATH TO 22:393 ===');
        path.forEach((p, idx) => {
          console.log(`${idx}: [${p.id}] "${p.name}" (${p.type})`);
        });
      }
    } catch (e) {
      console.error('Error:', e.message);
    }
  });
}).on('error', err => console.error(err));
