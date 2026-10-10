const https = require('https');
const fs = require('fs');

const token = process.env.FIGMA_PAT || process.env.FIGMA_ACCESS_TOKEN || '';
const fileKey = 'WzgF9gHuaOKu8te2SV3eEp';

// All 4 frame IDs
const frameIds = ['22:389', '22:453', '22:582', '22:755'];

const options = {
  hostname: 'api.figma.com',
  path: `/v1/files/${fileKey}/nodes?ids=${frameIds.map(encodeURIComponent).join(',')}`,
  headers: { 'X-Figma-Token': token }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      
      // Save full JSON
      fs.writeFileSync('scripts/all_frames_full.json', JSON.stringify(parsed, null, 2));
      console.log('Saved all_frames_full.json');
      
      // Print summary tree for each
      function summarize(n, depth = 0) {
        const indent = '  '.repeat(depth);
        const w = Math.round(n.absoluteBoundingBox?.width || 0);
        const h = Math.round(n.absoluteBoundingBox?.height || 0);
        let line = `${indent}- [${n.id}] "${n.name}" (${n.type}) [${w}x${h}]`;
        
        // Add fill info
        if (n.fills && n.fills.length > 0) {
          const solidFills = n.fills.filter(f => f.type === 'SOLID' && f.visible !== false);
          if (solidFills.length > 0) {
            const c = solidFills[0].color;
            line += ` fill:rgba(${Math.round(c.r*255)},${Math.round(c.g*255)},${Math.round(c.b*255)},${c.a?.toFixed(2) || 1})`;
          }
        }
        
        // Add font info
        if (n.style) {
          line += ` font:${n.style.fontFamily}/${n.style.fontSize}/${n.style.fontWeight}`;
        }
        
        // Add layout mode
        if (n.layoutMode) {
          line += ` layout:${n.layoutMode} gap:${n.itemSpacing || 0} pad:[${n.paddingTop || 0},${n.paddingRight || 0},${n.paddingBottom || 0},${n.paddingLeft || 0}]`;
        }
        
        console.log(line);
        
        if (n.characters) {
          console.log(`${indent}  text: "${n.characters.replace(/\n/g, '\\n')}"`);
        }
        
        if (n.children) {
          n.children.forEach(c => summarize(c, depth + 1));
        }
      }
      
      for (const id of frameIds) {
        const node = parsed.nodes[id]?.document;
        if (node) {
          console.log(`\n${'='.repeat(80)}`);
          console.log(`FRAME: ${node.name} (${id})`);
          console.log('='.repeat(80));
          summarize(node);
        }
      }
    } catch (e) {
      console.error('Error:', e.message);
    }
  });
}).on('error', err => console.error(err));
