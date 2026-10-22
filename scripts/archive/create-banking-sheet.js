const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const keyFilePath = path.resolve(__dirname, '../google-service-account.json');
const auth = new google.auth.GoogleAuth({
  keyFile: keyFilePath,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });
const spreadsheetId = '1h2P9VaBC9PELUMhipo6ze1SkJIVv3IOm5SP3ynURm4Q';

async function createBankingSheet() {
  console.log('Fetching spreadsheet metadata...');
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const existingTab = meta.data.sheets.find(
    (s) => s.properties.title.toLowerCase() === 'banking'
  );

  if (!existingTab) {
    console.log('Creating "banking" tab...');
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: 'banking',
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
    console.log('Tab "banking" created successfully.');
  } else {
    console.log('Tab "banking" already exists.');
  }

  const headers = [
    '🔑 case_id',
    '🔑 tx_id',
    '⚡ ref_id',
    '⚡ title',
    '⚡ receiver',
    '⚡ account_no',
    '⚡ amount',
    '⚡ timestamp',
    '⚡ category',
    '⚡ note',
    '⚡ is_evidence',
  ];

  const rows = [
    [
      'case_000',
      'tx-01',
      'FT1620498102948',
      'Chuyển tiền cọc Tour Đà Lạt (2 người)',
      'CÔNG TY CP DU LỊCH VIỆT',
      '0181.000.492.812 (Vietcombank)',
      '-12000000',
      '15:30 (22/07/2016)',
      'Du lịch & Giải trí',
      'Khang CK coc tour Da Lat 25/7 - Yen Nhi',
      'TRUE',
    ],
    [
      'case_000',
      'tx-02',
      'FT1620119284019',
      'Nhận tiền trả nợ lãi tháng 7',
      'LE QUANG VU',
      '1902.948.102.391 (Techcombank)',
      '10500000',
      '11:20 (19/07/2016)',
      'Thu hồi nợ',
      'Vu tra lai thang 7 khoan 350tr',
      'TRUE',
    ],
    [
      'case_000',
      'tx-03',
      'FT1619602910481',
      'Nhận tiền cọc mua đất Bờ Sông đợt 1',
      'NGUYEN HOANG HAI',
      '0071.000.918.231 (Vietcombank)',
      '200000000',
      '09:15 (15/07/2016)',
      'Bất động sản',
      'Tien coc giay tay thua dat 14 bo song',
      'TRUE',
    ],
    [
      'case_000',
      'tx-04',
      'FT1619182391024',
      'Thanh toán hóa đơn Tiệm vàng Kim Thành',
      'TIEM VANG KIM THANH',
      '1020.192.839.102 (BIDV)',
      '-18500000',
      '16:45 (10/07/2016)',
      'Mua sắm trang sức',
      'Mua day chuyen vang trang tang Nhi',
      'FALSE',
    ],
    [
      'case_000',
      'tx-05',
      'FT1618691029481',
      'Nhận tiền đền bù GPMB đợt 1 Ban QLDA Bờ Sông',
      'KHO BAC NHA NUOC DONG DA',
      '0141.000.119.201 (Agribank)',
      '2100000000',
      '14:00 (05/07/2016)',
      'Đền bù nhà đất',
      'Tien den bu dot 1 thua dat 14 bo song - Nguyen Van Khang',
      'TRUE',
    ],
    [
      'case_000',
      'tx-06',
      'FT1618301928410',
      'Chuyển phí dịch vụ pháp lý thừa kế di chúc',
      'VP LUAT SU NAM VAP CONG SU',
      '1903.291.049.102 (Techcombank)',
      '-50000000',
      '10:30 (02/07/2016)',
      'Pháp lý',
      'Thanh toan phi dich vu ho so thua ke & hop dong di chúc',
      'TRUE',
    ],
  ];

  console.log('Writing headers and initial rows to "banking"...');
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "'banking'!A1:K7",
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [headers, ...rows],
    },
  });

  console.log('Done! Tab "banking" populated with 6 transactions.');
}

createBankingSheet().catch(console.error);
