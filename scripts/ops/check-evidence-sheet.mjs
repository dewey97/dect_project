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

const saKeyPath = path.resolve(ROOT, 'google-service-account.json');
const auth = new google.auth.GoogleAuth({
  keyFile: saKeyPath,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });

// List all tabs first
try {
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const sheetNames = meta.data.sheets.map(s => s.properties.title);
  console.log('=== All tabs in spreadsheet ===');
  console.log(sheetNames.join(', '));
} catch (err) {
  console.log('Failed to list tabs:', err.message);
}

// Try different tab names for evidence data
const tabNames = ['evidences', 'photos', 'case_000_evidences', 'case_000_photos', 'photos_old', 'evidences_old'];

for (const tab of tabNames) {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${tab}!A1:Z500`,
    });
    const rows = res.data.values || [];
    console.log(`\n=== Tab "${tab}" — ${rows.length} rows ===`);
    if (rows.length > 0) {
      console.log('Headers:', rows[0].join(' | '));
      console.log(`Data rows: ${rows.length - 1}`);
      for (let i = 1; i < Math.min(6, rows.length); i++) {
        console.log(`  [${i}]:`, rows[i].slice(0, 8).join(' | '));
      }
      if (rows.length > 6) console.log(`  ... (${rows.length - 6} more rows)`);
    }
  } catch (err) {
    const msg = err.message?.split('\n')[0] || String(err);
    console.log(`\nTab "${tab}": NOT FOUND / ${msg}`);
  }
}
