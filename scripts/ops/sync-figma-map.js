/**
 * Script đồng bộ Bản đồ Hà Nội Master từ Figma sang Web App
 * Frame ID: 96:9215 ("Bản đồ Hà Nội — các lớp chỉnh sửa")
 * File Key: sIAYKRy84xtmgGs7oAqxg6
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const FIGMA_TOKEN = process.env.FIGMA_ACCESS_TOKEN || '';
const FILE_KEY = 'sIAYKRy84xtmgGs7oAqxg6';
const MAP_NODE_ID = '96:9215';

const OUTPUT_DIR = path.resolve(process.cwd(), 'public/images/cases/case_000/map');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'hanoi_master_map.png');

function fetchJson(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          } else {
            resolve(JSON.parse(data));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode >= 400) {
        file.close();
        fs.unlinkSync(dest);
        reject(new Error(`Download failed with status ${res.statusCode}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      reject(err);
    });
  });
}

async function syncFigmaMap() {
  console.log('🔄 Đang kết nối Figma API để lấy render ảnh Bản đồ Master...');
  console.log(`📍 File Key: ${FILE_KEY} | Node ID: ${MAP_NODE_ID}`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const exportUrl = `https://api.figma.com/v1/images/${FILE_KEY}?ids=${MAP_NODE_ID}&scale=2&format=png`;
  const response = await fetchJson(exportUrl, {
    'X-Figma-Token': FIGMA_TOKEN,
  });

  const imageUrl = response.images && response.images[MAP_NODE_ID];
  if (!imageUrl) {
    throw new Error(`Không tìm thấy Image URL cho node ${MAP_NODE_ID} trong response: ${JSON.stringify(response)}`);
  }

  console.log('⬇️ Đang tải ảnh độ phân giải cao từ CDN của Figma...');
  await downloadFile(imageUrl, OUTPUT_FILE);

  const stats = fs.statSync(OUTPUT_FILE);
  console.log(`✅ Đồng bộ thành công!`);
  console.log(`📁 File lưu tại: ${OUTPUT_FILE}`);
  console.log(`📦 Dung lượng: ${(stats.size / 1024).toFixed(1)} KB`);
}

syncFigmaMap().catch((err) => {
  console.error('❌ Lỗi khi đồng bộ bản đồ từ Figma:', err.message);
  process.exit(1);
});
