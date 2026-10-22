/**
 * Script dọn rác Thư mục Google Drive:
 * Sử dụng `removeParents` để gỡ bỏ hoàn toàn tất cả các file lẻ ra khỏi thư mục Drive.
 *
 * Chạy: node scripts/cleanup-drive-folder.js
 */
const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");

const root = path.resolve(__dirname, "..");
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

const keyFilePath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH
  ? path.resolve(root, process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH)
  : path.resolve(root, "google-service-account.json");

const DRIVE_FOLDER_ID = "169qDUO29Us_LOcPGo1eEU-DV9nliTAfw";
const MASTER_DOC_ID = "1pJxlZpfCfIbnQ0YGx3mvCUmYTRng7zLyDxJ2EggJkgc";

async function main() {
  console.log("🧹 Đang gỡ bỏ các file lẻ ra khỏi thư mục Google Drive...");

  const auth = new google.auth.GoogleAuth({
    keyFile: keyFilePath,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  const drive = google.drive({ version: "v3", auth });

  // 1. Đổi tên file Master Doc
  try {
    await drive.files.update({
      fileId: MASTER_DOC_ID,
      requestBody: {
        name: "[Case 000] TẬP HỒ SƠ LỜI KHAI & BIÊN BẢN ĐIỀU TRA (MASTER)",
      },
    });
  } catch (e) {}

  // 2. Lấy danh sách toàn bộ file trong thư mục
  const res = await drive.files.list({
    q: `'${DRIVE_FOLDER_ID}' in parents and trashed = false`,
    fields: "files(id, name)",
  });

  const files = res.data.files || [];
  console.log(`📋 Tổng số file trong thư mục: ${files.length}`);

  let removedCount = 0;
  for (const file of files) {
    if (file.id === MASTER_DOC_ID) {
      console.log(`⭐ GIỮ LẠI: "${file.name}" (Master Doc ID: ${file.id})`);
      continue;
    }

    try {
      console.log(`🗑️ Gỡ bỏ file khỏi thư mục: "${file.name}"...`);
      await drive.files.update({
        fileId: file.id,
        removeParents: DRIVE_FOLDER_ID,
        fields: "id, parents",
      });
      removedCount++;
    } catch (e) {
      console.error(`❌ Lỗi gỡ file ${file.name}:`, e.message);
    }
  }

  console.log(`\n🎉 HOÀN TẤT! Đã dọn sạch ${removedCount} file lẻ ra khỏi thư mục.`);
}

main().catch((e) => console.error("LỖI:", e));
