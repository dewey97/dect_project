const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const images = {
  '22:389': { url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/cb813ece-2a95-4ac4-94b8-be5a3fc69308', name: 'lockscreen.png' },
  '22:453': { url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/0d1223b6-6a27-4db3-aac8-5666d458eb81', name: 'phone_keypad.png' },
  '22:582': { url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/469289f9-d326-4635-ae6a-aede6dbde97b', name: 'recents.png' },
  '22:755': { url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/b4553215-71df-4c52-af93-04650bfee206', name: 'messages.png' }
};

const outDir = path.join(__dirname, '..', 'docs', 'cases', 'case_000', '01_design', 'figma_refs');
fs.mkdirSync(outDir, { recursive: true });

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Follow redirect
        const redirectUrl = response.headers.location;
        const mod = redirectUrl.startsWith('https') ? https : http;
        mod.get(redirectUrl, (res2) => {
          res2.pipe(file);
          file.on('finish', () => { file.close(); resolve(); });
        }).on('error', reject);
      } else {
        response.pipe(file);
        file.on('finish', () => { file.close(); resolve(); });
      }
    }).on('error', reject);
  });
}

async function main() {
  for (const [id, info] of Object.entries(images)) {
    const dest = path.join(outDir, info.name);
    console.log(`Downloading ${id} -> ${dest}...`);
    await downloadFile(info.url, dest);
    const stat = fs.statSync(dest);
    console.log(`  Done: ${stat.size} bytes`);
  }
  console.log('All downloads complete!');
}

main().catch(console.error);
