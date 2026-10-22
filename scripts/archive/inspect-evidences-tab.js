const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");

const root = "D:/code_world/dect_project";
const envPath = path.resolve(root, ".env.local");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf-8")
    .split("\n")
    .forEach((line) => {
      const t = line.trim();
      if (!t || t.startsWith("#")) return;
      const i = t.indexOf("=");
      if (i > -1) process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
    });
}

const spreadsheetId =
  process.env.GOOGLE_SHEETS_ID ||
  "1h2P9VaBC9PELUMhipo6ze1SkJIVv3IOm5SP3ynURm4Q";
const keyFilePath = path.resolve(root, "google-service-account.json");

(async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: keyFilePath,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });

  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  console.log("=== TABS ===");
  meta.data.sheets.forEach((s) => console.log(" -", s.properties.title));

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "'evidences'!A1:Z100",
  });
  const rows = res.data.values || [];
  console.log("\n=== EVIDENCES TAB ===");
  console.log("ROWS:", rows.length);
  console.log("HEADERS:", JSON.stringify(rows[0]));
  rows.slice(1).forEach((r, i) => {
    console.log(
      `${i + 1}. code=${r[1]} | title=${r[2]} | cat=${r[4]} | phase=${r[6]}`,
    );
  });
})().catch((e) => console.error("ERR:", e.message));
