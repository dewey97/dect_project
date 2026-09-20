const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");

// Load environment variables from .env.local if exists
const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const idx = trimmed.indexOf("=");
    if (idx > -1) {
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      process.env[key] = val;
    }
  });
}

const spreadsheetId =
  process.env.GOOGLE_SHEETS_ID ||
  "1h2P9VaBC9PELUMhipo6ze1SkJIVv3IOm5SP3ynURm4Q";
const keyFilePath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH
  ? path.resolve(__dirname, "..", process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH)
  : path.resolve(__dirname, "../google-service-account.json");

async function createEvaluationsSheet() {
  try {
    console.log("Using spreadsheet ID:", spreadsheetId);
    console.log("Using key file:", keyFilePath);

    const auth = new google.auth.GoogleAuth({
      keyFile: keyFilePath,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // 1. Get existing sheets
    const metadata = await sheets.spreadsheets.get({ spreadsheetId });
    const existingSheets = (metadata.data.sheets || []).map(
      (s) => s.properties?.title,
    );
    console.log("Existing sheets:", existingSheets);

    // 2. Add 'evaluations' tab if not exist
    if (!existingSheets.includes("evaluations")) {
      console.log("Creating new tab: 'evaluations'...");
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: "evaluations",
                },
              },
            },
          ],
        },
      });
      console.log("Tab 'evaluations' created successfully.");
    } else {
      console.log("Tab 'evaluations' already exists. Updating data...");
    }

    // 3. Prepare headers and initial Case 000 data
    const headers = [
      "case_id",
      "culprit_name",
      "motive_title",
      "method_title",
      "critical_evidences",
      "correct_timeline",
      "strengths",
      "weaknesses",
      "missed_evidence",
      "radar_scores",
    ];

    const correctTimelineData = [
      "19:00 — Mai ném đơn đòi đất rồi rời đi",
      "19:30 — Vũ đón xe ôm ra Quán Bia 88",
      "20:00 — Tùng xô ngã Khang & vỡ bình trà",
      "20:15 — Tùng bỏ chạy về Cầu Bươu",
      "20:45 — Hà lẻn vào nhà Khang",
      "21:00 — Hà đâm đứt động mạch cảnh Khang",
    ].join("\n");

    const radarScoresData = [
      "Độ chính xác suy luận | 100 | Bóc tách chính xác mâu thuẫn mốc giờ ngoại phạm",
      "Pháp y & Giám định | 95 | Phân lập đúng 2 giai đoạn tổn thương",
      "Khai thác chứng cứ sinh học | 90 | Phát hiện lọn tóc ADN trong áo ngực",
    ].join("\n");

    const rowCase000 = [
      "case_000",
      "Trần Thị Hà",
      "Cơn ghen cuồng loạn & Tâm lý cuồng sở hữu",
      "Đâm đứt động mạch cảnh bằng mảnh bình trà vỡ",
      "EV-HAIR-DNA, EV-VOICEMAIL-TRAIN",
      correctTimelineData,
      "Phát hiện tiếng còi tàu 20:32 và lịch VTV3 bóc trần alibi của Hà, kết hợp lọn tóc ADN định tội tuyệt đối.",
      "Không bị rơi vào bẫy Red Herring do cú xô ngã của Tùng lúc 20:00.",
      "Không có.",
      radarScoresData,
    ];

    // 4. Write data to 'evaluations'!A1
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `'evaluations'!A1:J2`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [headers, rowCase000],
      },
    });

    console.log(
      "Successfully wrote headers & Case 000 data to 'evaluations' tab!",
    );
  } catch (error) {
    console.error("Error creating/updating evaluations sheet:", error.message);
  }
}

createEvaluationsSheet();
