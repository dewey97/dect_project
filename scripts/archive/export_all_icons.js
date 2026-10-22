const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const token = process.env.FIGMA_ACCESS_TOKEN || '';
const fileKey = 'WzgF9gHuaOKu8te2SV3eEp';

const icons = {
  messages: '14:107',
  calendar: '14:121',
  photos: '14:131',
  camera: '14:148',
  weather: '14:158',
  clock: '14:168',
  maps: '14:185',
  videos: '14:211',
  notes: '14:229',
  reminders: '14:249',
  stocks: '14:268',
  wallet: '14:282',
  ibooks: '14:294',
  itunes: '14:303',
  appstore: '14:313',
  health: '14:323',
  phone: '14:43',
  mail: '14:52',
  safari: '14:66',
  music: '14:78'
};

const outDir = path.join(__dirname, '..', 'public', 'images', 'cases', 'case_000', 'phone', 'icons');
fs.mkdirSync(outDir, { recursive: true });

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        const redirectUrl = res.headers.location;
        const mod = redirectUrl.startsWith('https') ? https : http;
        mod.get(redirectUrl, (r2) => {
          r2.pipe(file);
          file.on('finish', () => { file.close(); resolve(); });
        }).on('error', reject);
      } else {
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve(); });
      }
    }).on('error', reject);
  });
}

async function main() {
  const ids = Object.values(icons);
  console.log('Requesting export URLs for', ids.length, 'icons from Figma API...');
  
  const options = {
    hostname: 'api.figma.com',
    path: `/v1/images/${fileKey}?ids=${ids.map(encodeURIComponent).join(',')}&scale=3&format=png`,
    headers: { 'X-Figma-Token': token }
  };

  https.get(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', async () => {
      try {
        const parsed = JSON.parse(data);
        const imageUrls = parsed.images || {};
        console.log('Received URLs for:', Object.keys(imageUrls).length, 'icons.');
        
        for (const [name, id] of Object.entries(icons)) {
          const url = imageUrls[id];
          if (!url) {
            console.warn(`No URL for ${name} (${id})`);
            continue;
          }
          const dest = path.join(outDir, `${name}.png`);
          console.log(`Downloading ${name} -> ${dest}...`);
          await downloadFile(url, dest);
        }
        console.log('All 20 icons downloaded successfully!');
      } catch (e) {
        console.error('Error:', e.message);
      }
    });
  }).on('error', err => console.error(err));
}

main();
