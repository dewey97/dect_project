const https = require('https');
const fs = require('fs');

const token = process.env.FIGMA_PAT || process.env.FIGMA_ACCESS_TOKEN || '';
const fileKey = 'WzgF9gHuaOKu8te2SV3eEp';

// Render images of all 4 frames directly from Figma API at 3x scale
const frameIds = ['22:389', '22:453', '22:582', '22:755'];

const options = {
  hostname: 'api.figma.com',
  path: `/v1/images/${fileKey}?ids=${frameIds.map(encodeURIComponent).join(',')}&scale=2&format=png`,
  headers: { 'X-Figma-Token': token }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('Rendered Images from Figma:', parsed.images);
      fs.writeFileSync('scripts/figma_images.json', JSON.stringify(parsed.images, null, 2));
    } catch (e) {
      console.error('Error:', e.message);
    }
  });
}).on('error', err => console.error(err));
