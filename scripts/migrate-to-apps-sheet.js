const { google } = require('googleapis');
const path = require('path');

const keyFilePath = path.resolve(__dirname, '../google-service-account.json');
const auth = new google.auth.GoogleAuth({
  keyFile: keyFilePath,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });
const spreadsheetId = '1h2P9VaBC9PELUMhipo6ze1SkJIVv3IOm5SP3ynURm4Q';

async function migrateToAppsSheet() {
  console.log('1. Fetching spreadsheet metadata...');
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const allSheets = meta.data.sheets;
  
  const notesTab = allSheets.find(
    (s) => s.properties.title.toLowerCase() === 'notes_and_browser'
  );
  const bankingTab = allSheets.find(
    (s) => s.properties.title.toLowerCase() === 'banking'
  );
  const existingAppsTab = allSheets.find(
    (s) => s.properties.title.toLowerCase() === 'apps'
  );

  // 2. Rename or ensure 'apps' tab exists
  if (notesTab && !existingAppsTab) {
    console.log(`Renaming sheet "${notesTab.properties.title}" (ID: ${notesTab.properties.sheetId}) to "apps"...`);
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            updateSheetProperties: {
              properties: {
                sheetId: notesTab.properties.sheetId,
                title: 'apps',
              },
              fields: 'title',
            },
          },
        ],
      },
    });
    console.log('Renamed successfully to "apps".');
  } else if (!existingAppsTab) {
    console.log('Creating new "apps" tab...');
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: 'apps',
                gridProperties: {
                  rowCount: 100,
                  columnCount: 15,
                  frozenRowCount: 1,
                },
              },
            },
          },
        ],
      },
    });
    console.log('Created "apps" tab.');
  }

  // 3. Clear old data in 'apps'
  console.log('Clearing old data in "apps" tab...');
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: "'apps'!A1:Z100",
  });

  // 4. Construct unified data for 'apps'
  const headers = [
    '🔑 case_id',
    '🔑 type',
    '⚡ title_or_domain',
    '⚡ content_or_url',
    '⚡ timestamp',
    '⚡ category',
    '⚡ account_no',
    '⚡ amount',
  ];

  const rows = [
    headers,
    // [NOTE: Ghi chú cá nhân của nạn nhân]
    [
      'case_000',
      'NOTE',
      'Nợ Vũ Đen & Phương án',
      'Thằng Vũ còn nợ 350tr tiền họ. Lãi tháng 7 mới nộp 10tr5. Con Mai vợ nó làm căng vụ đất đai ở Bờ Sông. Bảo thằng Vũ nếu không cản được con Mai rút đơn kiện thì tao cho đàn em tới tận xưởng cơ khí xiết đồ.',
      '22/07 • 21:00',
      'Tài chính',
      '',
      '',
    ],
    [
      'case_000',
      'NOTE',
      'Kế hoạch đi Đà Lạt',
      'Tour khởi hành sáng 25/07. Đã cọc cho bên công ty du lịch 12tr. Chuẩn bị giấy tờ đất và rút bớt tiền mặt trong tài khoản mang theo. Hẹn Nhi đón ở sân bay Nội Bài.',
      '23/07 • 14:15',
      'Cá nhân',
      '',
      '',
    ],
    // [SAFARI: Lịch sử duyệt web & tìm kiếm]
    [
      'case_000',
      'SAFARI',
      'google.com',
      'Cách xóa lịch sử cuộc gọi Viettel không để lại vết trên tổng đài',
      '24/07 • 19:45',
      'Lịch sử tìm kiếm',
      '',
      '',
    ],
    [
      'case_000',
      'SAFARI',
      'vnr.com.vn',
      'https://vnr.com.vn/gio-tau-chay-ha-noi-phu-ly-2016-tau-hang-d19e',
      '24/07 • 20:10',
      'Trang web đã xem',
      '',
      '',
    ],
    [
      'case_000',
      'SAFARI',
      'google.com',
      'Quy định về hợp đồng vay nợ tiền mặt không chứng thực',
      '23/07 • 11:20',
      'Lịch sử tìm kiếm',
      '',
      '',
    ],
    [
      'case_000',
      'SAFARI',
      'dantri.com.vn',
      'https://dantri.com.vn/the-thao/ket-qua-chung-ket-euro-2016-portugal-vo-vuc.htm',
      '11/07 • 07:15',
      'Tin tức',
      '',
      '',
    ],
    // [BANK: Biến động tài khoản ngân hàng]
    [
      'case_000',
      'BANK',
      'CÔNG TY CP DU LỊCH VIỆT',
      'Khang CK coc tour Da Lat 25/7 - Yen Nhi',
      '15:30 (22/07/2016)',
      'Du lịch & Giải trí',
      '0181.000.492.812 (Vietcombank)',
      '-12000000',
    ],
    [
      'case_000',
      'BANK',
      'LE QUANG VU',
      'Vu tra lai thang 7 khoan 350tr',
      '11:20 (19/07/2016)',
      'Thu hồi nợ',
      '1902.948.102.391 (Techcombank)',
      '10500000',
    ],
    [
      'case_000',
      'BANK',
      'NGUYEN HOANG HAI',
      'Tien coc giay tay thua dat 14 bo song',
      '09:15 (15/07/2016)',
      'Bất động sản',
      '0071.000.918.231 (Vietcombank)',
      '200000000',
    ],
    [
      'case_000',
      'BANK',
      'TIEM VANG KIM THANH',
      'Mua day chuyen vang trang tang Nhi',
      '16:45 (10/07/2016)',
      'Tiệm vàng',
      '1020.192.839.102 (BIDV)',
      '-18500000',
    ],
    [
      'case_000',
      'BANK',
      'KHO BAC NHA NUOC DONG DA',
      'Tien den bu dot 1 thua dat 14 bo song - Nguyen Van Khang',
      '14:00 (05/07/2016)',
      'Bồi thường',
      '0141.000.119.201 (Agribank)',
      '2100000000',
    ],
    [
      'case_000',
      'BANK',
      'VP LUAT SU NAM VAP CONG SU',
      'Thanh toan phi dich vu ho so thua ke & hop dong di chúc',
      '10:30 (02/07/2016)',
      'Pháp lý',
      '1903.291.049.102 (Techcombank)',
      '-50000000',
    ],
  ];

  console.log('Writing clean unified data to "apps"...');
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'apps'!A1:H${rows.length}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: rows },
  });
  console.log(`Successfully written ${rows.length} rows to "apps".`);

  // 5. Delete old 'banking' tab to avoid duplicates
  if (bankingTab) {
    console.log(`Deleting old "banking" tab (ID: ${bankingTab.properties.sheetId})...`);
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteSheet: {
              sheetId: bankingTab.properties.sheetId,
            },
          },
        ],
      },
    });
    console.log('Deleted old "banking" tab.');
  }

  console.log('All migrations completed successfully!');
}

migrateToAppsSheet().catch(console.error);
