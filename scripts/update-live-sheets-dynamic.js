const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const root = 'D:/code_world/dect_project';
const envPath = path.resolve(root, '.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const t = line.trim();
    if (!t || t.startsWith('#')) return;
    const i = t.indexOf('=');
    if (i > -1) process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  });
}

(async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.resolve(root, 'google-service-account.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID || '1h2P9VaBC9PELUMhipo6ze1SkJIVv3IOm5SP3ynURm4Q';

  console.log('=== 1. CẬP NHẬT TAB EVIDENCES ===');
  // Lấy toàn bộ tab evidences
  const evRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "'evidences'!A1:Z60",
  });
  const evRows = evRes.data.values || [];
  const evHeaders = evRows[0].map(h => h.trim());
  
  // Đảm bảo header is_suspect không có khoảng trắng thừa
  const isSuspectColIdx = evHeaders.findIndex(h => h.toLowerCase() === 'is_suspect');
  const pinOnBoardColIdx = evHeaders.findIndex(h => h.toLowerCase() === 'pin_on_board');
  const codeColIdx = evHeaders.findIndex(h => h.toLowerCase() === 'code');

  console.log(`Col indices: code=${codeColIdx}, pin_on_board=${pinOnBoardColIdx}, is_suspect=${isSuspectColIdx}`);

  // Cập nhật header A1:I1 nếu cần
  if (evRows[0][isSuspectColIdx] !== 'is_suspect') {
    evRows[0][isSuspectColIdx] = 'is_suspect';
  }

  for (let r = 1; r < evRows.length; r++) {
    const row = evRows[r];
    const code = row[codeColIdx];
    if (code === 'avatar_tung') {
      row[pinOnBoardColIdx] = 'TRUE';
      row[isSuspectColIdx] = 'TRUE';
      console.log(`Updated avatar_tung at row ${r + 1}: pin_on_board=TRUE, is_suspect=TRUE`);
    } else if (code === 'avatar_lua') {
      row[isSuspectColIdx] = '';
      console.log(`Updated avatar_lua at row ${r + 1}: is_suspect=""`);
    } else if (code === 'avatar_tien') {
      row[isSuspectColIdx] = '';
      console.log(`Updated avatar_tien at row ${r + 1}: is_suspect=""`);
    }
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'evidences'!A1:${String.fromCharCode(65 + evHeaders.length - 1)}${evRows.length}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: evRows },
  });
  console.log('Đã cập nhật xong tab evidences.');

  console.log('\n=== 2. CẬP NHẬT TAB CHECKPOINTS ===');
  const cpRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "'checkpoints'!A1:Z60",
  });
  const cpRows = cpRes.data.values || [];
  const cpHeaders = cpRows[0].map(h => h.trim());
  const cpIdIdx = cpHeaders.findIndex(h => h.toLowerCase() === 'checkpoint_id');

  const existingCpIds = new Set(cpRows.slice(1).map(r => r[cpIdIdx]));
  console.log('Existing Checkpoint IDs:', Array.from(existingCpIds));

  // Thêm cp-000-convergence nếu chưa có
  if (!existingCpIds.has('cp-000-convergence')) {
    const newConvergenceRow = new Array(cpHeaders.length).fill('');
    newConvergenceRow[cpHeaders.indexOf('case_id')] = 'case_000';
    newConvergenceRow[cpHeaders.indexOf('checkpoint_id')] = 'cp-000-convergence';
    newConvergenceRow[cpHeaders.indexOf('dossier')] = 'Bộ B';
    newConvergenceRow[cpHeaders.indexOf('title')] = 'Khám Xét Lại Hiện Trường';
    newConvergenceRow[cpHeaders.indexOf('question')] = 'Tái khám xét số 14 Đường Bờ Sông sau khi làm rõ các mâu thuẫn lời khai.';
    newConvergenceRow[cpHeaders.indexOf('type')] = 'evidence_picker';
    newConvergenceRow[cpHeaders.indexOf('answers')] = 'bat_buoc: vu, tung';
    newConvergenceRow[cpHeaders.indexOf('answers_id')] = 'bat_buoc: vu, tung';
    newConvergenceRow[cpHeaders.indexOf('hints')] = 'Gợi ý 1: Hoàn thành thẩm tra mâu thuẫn của Lê Quang Vũ và Nguyễn Thanh Tùng để mở khóa tái khám xét.';
    newConvergenceRow[cpHeaders.indexOf('narrative')] = 'Lệnh tái khám xét hiện trường số 14 Đường Bờ Sông đã được phê duyệt. Hãy tỉ mỉ rà soát lại từng ngóc ngách để tìm kiếm dấu vết hung thủ để lại!';
    cpRows.push(newConvergenceRow);
    console.log('Added cp-000-convergence.');
  }

  // Thêm cp-000-1b-followup nếu chưa có
  if (!existingCpIds.has('cp-000-1b-followup')) {
    const newTungFollowup = new Array(cpHeaders.length).fill('');
    newTungFollowup[cpHeaders.indexOf('case_id')] = 'case_000';
    newTungFollowup[cpHeaders.indexOf('checkpoint_id')] = 'cp-000-1b-followup';
    newTungFollowup[cpHeaders.indexOf('dossier')] = 'Bộ B';
    newTungFollowup[cpHeaders.indexOf('title')] = 'Nghi vấn đối tượng Nguyễn Thanh Tùng';
    newTungFollowup[cpHeaders.indexOf('question')] = 'Dựa vào những gì đang nắm giữ, bạn có tin đối tượng này vô tội?';
    newTungFollowup[cpHeaders.indexOf('type')] = 'mcq';
    newTungFollowup[cpHeaders.indexOf('answers')] = 'option: CÓ\noption: KHÔNG\ncorrect: KHÔNG';
    newTungFollowup[cpHeaders.indexOf('answers_id')] = 'option: CÓ\noption: KHÔNG\ncorrect: KHÔNG';
    newTungFollowup[cpHeaders.indexOf('hints')] = 'Gợi ý 1: Đối chiếu dấu vân tay trên khung ảnh và lời thú nhận xô xát của đương sự.';
    newTungFollowup[cpHeaders.indexOf('narrative')] = 'Lời khai và diễn biến tâm lý của Nguyễn Thanh Tùng đã được ghi nhận vào hồ sơ điều tra.';
    cpRows.push(newTungFollowup);
    console.log('Added cp-000-1b-followup.');
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'checkpoints'!A1:${String.fromCharCode(65 + cpHeaders.length - 1)}${cpRows.length}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: cpRows },
  });
  console.log('Đã cập nhật xong tab checkpoints.');
})();
