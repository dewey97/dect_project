const https = require('https');
const fs = require('fs');

const token = process.env.FIGMA_ACCESS_TOKEN || '';
const fileKey = 'WzgF9gHuaOKu8te2SV3eEp';

// Query full document hierarchy to find any Home Screen / App Icons frames
const options = {
  hostname: 'api.figma.com',
  path: `/v1/files/${fileKey}`,
  headers: { 'X-Figma-Token': token }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('Pages count:', parsed.document.children.length);
      
      const allFrames = [];
      function collectFrames(n, pageName = '') {
        if (n.type === 'FRAME' || n.type === 'COMPONENT') {
          allFrames.push({
            id: n.id,
            name: n.name,
            type: n.type,
            page: pageName,
            bounds: n.absoluteBoundingBox,
            childCount: n.children ? n.children.length : 0
          });
        }
        if (n.children) {
          n.children.forEach(c => collectFrames(c, n.type === 'CANVAS' ? n.name : pageName));
        }
      }
      
      parsed.document.children.forEach(p => collectFrames(p, p.name));
      
      console.log('Total frames found:', allFrames.length);
      // Filter frames related to Home, App, Icons, or screens
      const relevant = allFrames.filter(f => 
        /home|springboard|icon|màn hình|app|dock/i.test(f.name) ||
        (f.bounds && f.bounds.width >= 350 && f.bounds.width <= 420 && f.bounds.height >= 600 && f.bounds.height <= 900)
      );
      
      console.log('Relevant frames:', relevant.slice(0, 30));
      fs.writeFileSync('scripts/figma_frames_overview.json', JSON.stringify(relevant, null, 2));
    } catch (e) {
      console.error('Error:', e.message);
    }
  });
}).on('error', err => console.error(err));
