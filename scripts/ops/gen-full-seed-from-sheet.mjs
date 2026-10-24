/**
 * Sinh SQL migration từ sheet-data-dump.json (output của full-sheet-audit.mjs).
 * Thay thế toàn bộ hardcode seed bằng dữ liệu thật từ Google Sheets.
 *
 * Output: data/_review/37_reseed_from_sheets.sql
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

const dump = JSON.parse(
  fs.readFileSync(path.resolve(ROOT, 'data/_review/sheet-data-dump.json'), 'utf-8')
);

function esc(v) {
  if (v === null || v === undefined || v === '') return 'NULL';
  const s = String(v).replace(/'/g, "''");
  return `'${s}'`;
}

function escOrNull(v) {
  if (!v || v.trim() === '') return 'NULL';
  return esc(v);
}

const lines = [];
lines.push('-- ==============================================================================');
lines.push('-- 37. RE-SEED ALL CASE_000 DATA FROM GOOGLE SHEETS (replaces hardcoded data)');
lines.push(`-- Generated: ${new Date().toISOString()}`);
lines.push('-- ==============================================================================');
lines.push('');
lines.push('BEGIN;');

// ===================== 1. EVIDENCE =====================
const evidences = dump.evidences || [];
lines.push('');
lines.push(`-- 1. case_evidence: ${evidences.length} records from Sheet tab "evidences"`);
lines.push("DELETE FROM public.case_evidence WHERE case_slug = 'case_000';");

if (evidences.length > 0) {
  lines.push('INSERT INTO public.case_evidence (case_slug, code, title, kind, file_url, thumb_url, phase, description, slot_index, metadata) VALUES');

  const rows = evidences.map((e, i) => {
    const caseId = e.case_id || 'case_000';
    const code = e.code || `ev-${i}`;
    const label = e.label || '';
    // Map category to kind
    let kind = 'photo';
    const cat = (e.category || '').toUpperCase();
    if (cat === 'DOCUMENT' || cat === 'PDF') kind = 'pdf';
    else if (cat === 'AUDIO') kind = 'audio';
    else if (cat === 'OBJECT') kind = 'object';
    else if (cat === 'PHOTO' || cat === 'SCENE' || cat === 'EVIDENCE' || cat === 'AVATAR' || cat === 'HOTSPOT') kind = 'photo';
    else if (cat === 'IMAGE') kind = 'image';
    else kind = cat ? 'photo' : 'photo';

    // Phase from "bộ hồ sơ" column
    const dossier = (e['bộ hồ sơ'] || '').toUpperCase().trim();
    let phase = 0;
    if (dossier === 'A') phase = 0;
    else if (dossier === 'B') phase = 1;
    else if (dossier === 'C') phase = 2;
    else if (dossier === 'D') phase = 3;

    const driveUrl = e.drive_url || null;
    const description = e.description || null;
    const isSuspect = (e.is_suspect || '').toUpperCase() === 'TRUE';
    const pinOnBoard = (e.pin_on_board || '').toUpperCase() === 'TRUE';

    const metadata = {};
    if (isSuspect) metadata.is_suspect = true;
    if (pinOnBoard) metadata.pin_on_board = true;
    if (e.code) metadata.original_code = e.code;

    return `  (${esc(caseId)}, ${esc(code)}, ${esc(label)}, ${esc(kind)}, ${escOrNull(driveUrl)}, ${escOrNull(driveUrl)}, ${phase}, ${escOrNull(description)}, ${i}, ${esc(JSON.stringify(metadata))})`;
  });

  lines.push(rows.join(',\n'));
  lines.push('ON CONFLICT (case_slug, code) DO UPDATE SET');
  lines.push('  title = EXCLUDED.title, kind = EXCLUDED.kind, file_url = EXCLUDED.file_url,');
  lines.push('  thumb_url = EXCLUDED.thumb_url, phase = EXCLUDED.phase, description = EXCLUDED.description,');
  lines.push('  slot_index = EXCLUDED.slot_index, metadata = EXCLUDED.metadata, updated_at = NOW();');
}

// ===================== 2. CONTACTS =====================
const contacts = dump.contacts || [];
const validContacts = contacts.filter(c => c.name && c.name.trim());
lines.push('');
lines.push(`-- 2. phone_contacts: ${validContacts.length} records from Sheet tab "contacts" (${contacts.length - validContacts.length} skipped, empty name)`);
lines.push("DELETE FROM public.phone_contacts WHERE case_slug = 'case_000';");

if (validContacts.length > 0) {
  lines.push('INSERT INTO public.phone_contacts (case_slug, contact_id, name, display_name, phone_number, category, note, is_saved, avatar_url, is_suspicious, slot_index) VALUES');
  const rows = validContacts.map((c, i) => {
    const isSaved = (c.is_saved || '').toUpperCase() === 'TRUE';
    const category = c.category || null;
    const note = c.note || null;
    return `  (${esc(c.case_id || 'case_000')}, ${esc(c.contact_id)}, ${esc(c.name.trim())}, ${esc(c.name.trim())}, ${esc(c.phone_number)}, ${escOrNull(category)}, ${escOrNull(note)}, ${isSaved}, NULL, false, ${i})`;
  });

  lines.push(rows.join(',\n') + ';');
}

// ===================== 3. CALLS =====================
const calls = dump.calls || [];
lines.push('');
lines.push(`-- 3. phone_calls: ${calls.length} records from Sheet tab "calls"`);
lines.push("DELETE FROM public.phone_calls WHERE case_slug = 'case_000';");

if (calls.length > 0) {
  lines.push('INSERT INTO public.phone_calls (case_slug, code, contact_name, phone_number, call_type, timestamp, duration, audio_url, is_key_clue, clue_title, clue_analysis, slot_index) VALUES');

  const rows = calls.map((c, i) => {
    const callType = (c.call_type || 'INCOMING').toUpperCase();
    const isMissed = (c.is_missed || '').toUpperCase() === 'TRUE';
    const actualType = isMissed ? 'MISSED' : callType;
    const displayName = c.display_name || c.contact_name || 'Không rõ';
    const timestamp = [c.date_str, c.time_str].filter(Boolean).join(' ') || null;
    const duration = c.duration || null;
    const audioUrl = c.audio_url || null;
    const isKeyClue = (c.is_key_clue || '').toUpperCase() === 'TRUE';
    const clueTitle = c.clue_title || null;
    const clueAnalysis = c.clue_analysis || null;

    return `  (${esc('case_000')}, ${escOrNull(c.call_id)}, ${esc(displayName)}, ${esc(c.phone_number)}, ${esc(actualType)}, ${escOrNull(timestamp)}, ${escOrNull(duration)}, ${escOrNull(audioUrl)}, ${isKeyClue}, ${escOrNull(clueTitle)}, ${escOrNull(clueAnalysis)}, ${i})`;
  });

  lines.push(rows.join(',\n') + ';');
}

// ===================== 4. MESSAGES =====================
const messages = dump.messages || [];
lines.push('');
lines.push(`-- 4. phone_messages: ${messages.length} threads from Sheet tab "messages"`);
lines.push("DELETE FROM public.phone_messages WHERE case_slug = 'case_000';");

if (messages.length > 0) {
  lines.push('INSERT INTO public.phone_messages (case_slug, thread_key, thread_name, thread_phone, sender, role, body, timestamp, code, is_clue, clue_title, clue_analysis, attachment_type, attachment_url, attachment_duration, slot_index) VALUES');

  const rows = messages.map((m, i) => {
    const threadKey = `thread_${(m.contact_name || 'unknown').toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const body = m.messages_text || '';
    const unread = (m.unread || '').toUpperCase() === 'TRUE';

    return `  (${esc('case_000')}, ${esc(threadKey)}, ${esc(m.contact_name || 'Hội thoại')}, ${escOrNull(m.phone_number)}, ${esc(m.contact_name || 'Người gửi')}, 'received', ${esc(body)}, NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, ${i})`;
  });

  lines.push(rows.join(',\n') + ';');
}

// ===================== 5. APPS (NOTE/SAFARI/BANK) =====================
const apps = dump.apps || [];
lines.push('');
lines.push(`-- 5. phone_notes/phone_browser/phone_bank: ${apps.length} records from Sheet tab "apps"`);

const notes = apps.filter(a => (a['🔑 type'] || a.type || '').toUpperCase() === 'NOTE');
const safari = apps.filter(a => (a['🔑 type'] || a.type || '').toUpperCase() === 'SAFARI');
const bank = apps.filter(a => (a['🔑 type'] || a.type || '').toUpperCase() === 'BANK');

// Notes — table: phone_notes (title, body, is_pinned, code, is_clue, slot_index)
if (notes.length > 0) {
  lines.push('');
  lines.push(`-- 5a. phone_notes: ${notes.length} records`);
  lines.push("DELETE FROM public.phone_notes WHERE case_slug = 'case_000';");
  lines.push('INSERT INTO public.phone_notes (case_slug, title, body, is_pinned, is_clue, slot_index) VALUES');

  const rows = notes.map((n, i) => {
    const title = n['⚡ title_or_domain'] || n.title_or_domain || '';
    const body = n['⚡ content_or_url'] || n.content_or_url || '';
    return `  (${esc('case_000')}, ${esc(title)}, ${esc(body)}, false, false, ${i})`;
  });
  lines.push(rows.join(',\n') + ';');
}

// Safari — table: phone_browser_history (title, url, visited_at, favicon_url, code, is_clue, slot_index)
if (safari.length > 0) {
  lines.push('');
  lines.push(`-- 5b. phone_browser_history: ${safari.length} records`);
  lines.push("DELETE FROM public.phone_browser_history WHERE case_slug = 'case_000';");
  lines.push('INSERT INTO public.phone_browser_history (case_slug, title, url, visited_at, is_clue, slot_index) VALUES');

  const rows = safari.map((s, i) => {
    const title = s['⚡ title_or_domain'] || s.title_or_domain || '';
    const url = s['⚡ content_or_url'] || s.content_or_url || '';
    const ts = s['⚡ timestamp'] || s.timestamp || null;
    return `  (${esc('case_000')}, ${esc(title)}, ${esc(url)}, ${escOrNull(ts)}, false, ${i})`;
  });
  lines.push(rows.join(',\n') + ';');
}

// Bank — table: phone_bank_transactions (tx_type, amount, counterparty, note, timestamp, code, is_clue, slot_index)
if (bank.length > 0) {
  lines.push('');
  lines.push(`-- 5c. phone_bank_transactions: ${bank.length} records`);
  lines.push("DELETE FROM public.phone_bank_transactions WHERE case_slug = 'case_000';");
  lines.push('INSERT INTO public.phone_bank_transactions (case_slug, tx_type, amount, counterparty, note, timestamp, is_clue, slot_index) VALUES');

  const rows = bank.map((b, i) => {
    const counterparty = b['⚡ title_or_domain'] || b.title_or_domain || '';
    const desc = b['⚡ content_or_url'] || b.content_or_url || '';
    const ts = b['⚡ timestamp'] || b.timestamp || null;
    const rawAmount = b['⚡ amount'] || b.amount || '0';
    const amount = parseInt(String(rawAmount).replace(/[^0-9-]/g, ''), 10) || 0;
    const txType = amount < 0 ? 'out' : 'in';
    return `  (${esc('case_000')}, ${esc(txType)}, ${Math.abs(amount)}, ${esc(counterparty)}, ${esc(desc)}, ${escOrNull(ts)}, false, ${i})`;
  });
  lines.push(rows.join(',\n') + ';');
}

// ===================== 6. REMOVE JUNK APPS =====================
lines.push('');
lines.push('-- 6. Remove junk placeholder apps (app_0..app_11 from old migrate-phone-sheets)');
lines.push("DELETE FROM public.case_phone_apps WHERE case_slug = 'case_000' AND app_type LIKE 'app_%';");

lines.push('');
lines.push('COMMIT;');

// Write output
const outPath = path.resolve(ROOT, 'db/schema/37_reseed_from_sheets.sql');
fs.writeFileSync(outPath, lines.join('\n') + '\n', 'utf-8');
console.log(`Generated: ${outPath}`);
console.log(`  Evidence: ${evidences.length} records`);
console.log(`  Contacts: ${validContacts.length} records (${contacts.length - validContacts.length} skipped, empty name)`);
console.log(`  Calls: ${calls.length} records`);
console.log(`  Messages: ${messages.length} threads`);
console.log(`  Notes: ${notes.length}, Safari: ${safari.length}, Bank: ${bank.length}`);
console.log(`  Cleanup: remove junk app_0..app_11`);
