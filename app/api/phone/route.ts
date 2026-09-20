import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get('tab') || 'contacts';
    const caseIdFilter = searchParams.get('caseId') || 'case_000';

    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    const keyFilePath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH
      ? path.resolve(process.cwd(), process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH)
      : path.resolve(process.cwd(), 'google-service-account.json');

    const auth = new google.auth.GoogleAuth({
      keyFile: keyFilePath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${tab}'!A1:Z500`,
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return NextResponse.json({ success: true, tab, data: [] });
    }

    const headers = rows[0];
    const rawData = rows.slice(1).map(row => {
      const obj: Record<string, any> = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] !== undefined ? row[index] : '';
      });
      return obj;
    });

    // Filter by case_id if present in table
    const filteredData = rawData.filter(item => {
      if (item.case_id) {
        return item.case_id === caseIdFilter;
      }
      return true;
    });

    const res = NextResponse.json({
      success: true,
      caseId: caseIdFilter,
      tab,
      totalCount: filteredData.length,
      data: filteredData,
    });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return res;
  } catch (error: any) {
    console.error('Error fetching Google Sheets API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch data from Google Sheets' },
      { status: 500 }
    );
  }
}
