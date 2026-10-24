/**
 * Full audit: đọc TẤT CẢ tab data trên Google Sheets Master và in tóm tắt.
 * So sánh với dữ liệu đang có trên Supabase production.
 */
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const SHEET_ID = '1h2P9VaBC9PELUMhipo6ze1SkJIVv3IOm5SP3ynURm4Q';

function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    const p = path.resolve(ROOT, file);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, 'utf-8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx < 0) continue;
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
        val = val.slice(1, -1);
      if (!process.env[key]) process.env[key] = val;
    }
  }
}
loadEnv();

const auth = new google.auth.GoogleAuth({
  keyFile: path.resolve(ROOT, 'google-service-account.json'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});
const sheets = google.sheets({ version: 'v4', auth });

async function fetchTab(tab) {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${tab}!A1:AZ1000`,
    });
    return res.data.values || [];
  } catch {
    return null;
  }
}

function rowsToObjects(rows) {
  if (!rows || rows.length < 2) return [];
  const headers = rows[0].map(h => h.trim().toLowerCase());
  return rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i] || ''; });
    return obj;
  });
}

// Fetch all relevant tabs
const dataTabs = ['evidences', 'contacts', 'calls', 'messages', 'apps'];

const output = {};
for (const tab of dataTabs) {
  const raw = await fetchTab(tab);
  if (!raw) {
    console.log(`Tab "${tab}": NOT FOUND`);
    continue;
  }
  const objs = rowsToObjects(raw);
  output[tab] = objs;
  console.log(`\nTab "${tab}": ${objs.length} records`);
  console.log('  Headers:', raw[0]?.join(' | '));
  // Show first 3
  for (let i = 0; i < Math.min(3, objs.length); i++) {
    const keys = Object.keys(objs[i]).slice(0, 6);
    console.log(`  [${i}]:`, keys.map(k => `${k}=${objs[i][k]}`).join(' | '));
  }
}

// Write full JSON dump for review
const outPath = path.resolve(ROOT, 'data/_review/sheet-data-dump.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf-8');
console.log(`\nFull data dump: ${outPath}`);
