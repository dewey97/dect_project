/**
 * Cập nhật Header dòng 1 trên tất cả các tab Google Sheet kèm icon phân loại:
 * 🔑 = Core Identifier (Router / Key)
 * ⚡ = Live Reactive (Dữ liệu runtime)
 * 📝 = Editorial Note (Ghi chú GM / Game Designer)
 *
 * Chạy: node scripts/update-sheet-headers-with-icons.js
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

const spreadsheetId =
  process.env.GOOGLE_SHEETS_ID ||
  "1h2P9VaBC9PELUMhipo6ze1SkJIVv3IOm5SP3ynURm4Q";

const keyFilePath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH
  ? path.resolve(root, process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH)
  : path.resolve(root, "google-service-account.json");

const auth = new google.auth.GoogleAuth({
  keyFile: keyFilePath,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

// Định nghĩa prefix icon cho từng cột theo từng tab
const TAB_SCHEMAS = {
  contacts: [
    "🔑 case_id",
    "🔑 contact_id",
    "⚡ name",
    "⚡ phone_number",
    "⚡ is_saved",
    "⚡ category",
    "⚡ note",
  ],
  calls: [
    "🔑 case_id",
    "🔑 call_id",
    "⚡ date_str",
    "⚡ time_str",
    "⚡ display_name",
    "⚡ phone_number",
    "⚡ call_type",
    "⚡ is_missed",
    "⚡ is_key_clue",
  ],
  messages: [
    "🔑 case_id",
    "🔑 contact_name",
    "⚡ phone_number",
    "⚡ avatar_color",
    "⚡ unread",
    "⚡ timestamp",
    "⚡ preview_text",
    "⚡ messages_text",
  ],
  photos: [
    "🔑 case_id",
    "🔑 photo_code",
    "⚡ title",
    "⚡ category",
    "⚡ file_name",
    "📝 aspect_ratio",
    "📝 local_file_path",
    "⚡ drive_url",
    "⚡ direct_cdn_url",
    "⚡ description_prompt",
    "⚡ is_key_asset",
  ],
  notes_and_browser: [
    "🔑 case_id",
    "🔑 type",
    "⚡ title_or_domain",
    "⚡ content_or_url",
    "⚡ timestamp",
    "⚡ category",
    "⚡ clue_tag",
  ],
  checkpoints: [
    "🔑 case_id",
    "🔑 checkpoint_id",
    "📝 dossier",
    "⚡ title",
    "⚡ question",
    "🔑 type",
    "⚡ unlocked_evidence_id",
    "⚡ answers",
    "⚡ hints",
  ],
  narratives: [
    "🔑 case_id",
    "🔑 phase",
    "📝 dossier",
    "⚡ date",
    "⚡ monologue",
  ],
  evidences: [
    "🔑 case_id",
    "🔑 code",
    "⚡ label",
    "⚡ type",
    "⚡ category",
    "⚡ description",
    "📝 unlocked_by_phase",
    "📝 position_x",
    "📝 position_y",
    "📝 logic_data",
  ],
  audios: [
    "🔑 case_id",
    "🔑 audio_code",
    "⚡ title",
    "⚡ category",
    "⚡ file_path",
    "⚡ duration_sec",
    "⚡ transcript",
    "⚡ acoustic_filter",
    "⚡ is_clue",
  ],
  motive_ideas: [
    "🔑 id",
    "⚡ category",
    "⚡ title",
    "⚡ summary",
    "⚡ psychological_trigger",
    "⚡ victim_relation",
    "⚡ evidence_signatures",
  ],
  method_ideas: [
    "🔑 id",
    "⚡ category",
    "⚡ title",
    "⚡ summary",
    "⚡ required_tools",
    "⚡ forensic_traces",
    "⚡ alibi_trick",
    "⚡ flaw_counter",
  ],
  characters: [
    "🔑 case_id",
    "🔑 code",
    "⚡ role",
    "⚡ full_name",
    "⚡ alias",
    "⚡ dob",
    "⚡ gender",
    "⚡ id_card_no",
    "⚡ phone_number",
    "⚡ occupation",
    "⚡ current_address",
    "⚡ height_cm",
    "⚡ weight_kg",
    "⚡ physical_build",
    "⚡ distinguishing_features",
    "⚡ psych_classification",
    "⚡ motive_type",
    "⚡ motive_description",
    "⚡ alibi_statement",
    "⚡ is_alibi_fake",
    "⚡ flaw_in_alibi",
    "⚡ key_evidence_ids",
  ],
  locations: [
    "🔑 case_id",
    "🔑 code",
    "⚡ title",
    "⚡ source_type",
    "⚡ category",
    "⚡ address",
    "⚡ details",
    "⚡ distance_from_scene",
    "⚡ travel_time_motorbike",
    "⚡ travel_time_walk",
    "⚡ travel_time_car",
    "⚡ position_x",
    "⚡ position_y",
    "⚡ is_key_location",
  ],
  relations: [
    "🔑 case_id",
    "🔑 source_code",
    "🔑 target_code",
    "⚡ relation_type",
    "⚡ description",
    "⚡ unlocked_by_evidence",
  ],
  timeline: [
    "🔑 case_id",
    "🔑 time_str",
    "⚡ character_name",
    "⚡ event_title",
    "⚡ location",
    "⚡ is_truth",
    "⚡ is_fatal",
    "⚡ description",
  ],
};

async function updateHeaders() {
  const sheets = google.sheets({ version: "v4", auth });
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const existingTitles = meta.data.sheets.map((s) => s.properties.title);

  console.log("Existing tabs on Sheet:", existingTitles);

  for (const [tabName, headers] of Object.entries(TAB_SCHEMAS)) {
    if (!existingTitles.includes(tabName)) {
      console.log(`[SKIP] Tab '${tabName}' not found on Google Sheet`);
      continue;
    }

    const range = `'${tabName}'!A1:${String.fromCharCode(64 + headers.length)}1`;
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [headers],
      },
    });

    console.log(
      `[OK] Updated headers for '${tabName}' (${headers.length} cols)`,
    );
  }

  console.log("\nAll Google Sheet headers updated successfully with icons!");
}

updateHeaders().catch((err) => {
  console.error("Error updating headers:", err);
  process.exit(1);
});
