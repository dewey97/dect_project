import { google } from "googleapis";
import { NextResponse } from "next/server";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";
const DEFAULT_SPREADSHEET_ID = "1h2P9VaBC9PELUMhipo6ze1SkJIVv3IOm5SP3ynURm4Q";

const DEFAULT_SERVICE_ACCOUNT = {
  type: "service_account",
  project_id: "dectprj",
  private_key_id: "70c4155bc91f0a449a2ae0cb607c01e7ae3e9659",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDYmIIOsh2lc0Ii\nVM5r+HxNNshOh5WBXrEFo1f/ODB86MDtxt7AdnV3FvIlih0rSqkZkAp+KyK/o6Iy\n+RIuaND8yvGIo+3UMQJ50AYhSJ0lqg4jCKz/eDimDTqre3oYylu5uKoo4EP+fF+P\n78C5diR5lGPcNtYaiyrsyrIp82FG+hXRJ5vEKlZVqMANpiuoN6RLLxVdxT1L2pi1\nb4hUlmes+eu2ss5xUd2L1VSO02GqPWEyqS45aV4yO1E7lv6wcdWKqhSkmnkfIG02\nFWKhPYEuWHVbytTYIQmVlJU5BpHrxs+iqqNjMf+Hd+pCMgs9tGZE1qgx/zHCumuE\nWkdmkrKlAgMBAAECggEALo8j//Q2Trs2t2oLAGcnEzMIPmdDUk6wV2GsOBLUS3l+\nBW7nMbCVIg8m6L5mdEiljnbp5oKvwsmyQ2pKh/rkl76pSoHQjTkmytgWhT+WdkL2\nrH3AMF9fsAQufS+7CIqxSnxBaa2BuDn0kdyMDWHxx8fH6o3IGucZCFMvFrj4S3jv\n/+JTpHu9ullFj+Xyl2pSAGnw+eRUSiTQ5nN3rBXUvFOiC/CAnslzEGBTAOYiCc+K\n4LNHj28d5aAW0deHl8zeu53RMMKafEbL6oA0Coe05REmic6eBbrdmh4CoRCu60k6\nU6XGeNtsAcQZf/FoY7iD3Eo2gUw9BXVElEwPxsxVeQKBgQDy+yJwa4LGRl7p7iAB\nLlkNhGxq0lksjIXQrLuC41S132PHtgtgh8RqaIWjYkiKDqN0zjDz2ww+krp2ZWM2\n82FhmU9usCEPuCXJa+xmUh5A5FolcRoVuhdvs0jrlv+uw8CJDBXXm7V3FT3ALTSR\nOBq51n70jgvoPkJ3itKtl1hdGQKBgQDkM3VSHDjD7Mxe6Iy0E1YstlyD7GdzdjOK\nL5fibvZd1TGbfEfRN03OQSyWGTWojrYgjzBQFtFvcDh0a++sZvG0oVHpP5PcYvi6\nb3nc74wlqGZTY2qlt0X8DGXKCn2x6CAM529T/iYyVewz1JTyQgX3jo4ql8sjzFwv\nkWll3i5nbQKBgQCRKjyvEWw17QDznZJ9YiVOEBl90GH6XZHs0+XLEuofJnFEdZxi\ndXqBYCTHMgbIhGpfdHiGmA2+rIa+CWC3CbzaRG/SX2PBMnFQ3yuDDfiJKGQ7DlFZ\nPa6Wy3P7XGExFj5HInNCNwK5PHWCBP/s6qn88Qs0LFEs1VV8efHYSB1AsQKBgBex\n9CurfIVzkCEGup10KI2J/f9Ay9kkW+OsX3QGm5RQr876T6a8vFp/T/bh9T1kXCrz\nU0vtop+UongMQR3ArrZXzd6PWHYY3MTXEGtNgFrkqoNcHlXIuv6Z9vPMtRKFDNbq\nLRgmmqa9X0Jef3zMODxlVAO+MTytWqEh0zTdpindAoGBAOyr9riu39N8lUAUUb4g\nEW5eZrVRjL+ESvelopJwLHqMDyLsZPrFKZEg/8S/AveWQquwsNtXrqRJ1BP/1UUF\n6TU0+J/5jqDQid8tbANSQBF63dTNwdo2BWNLuJhiSO6VPyWgnWIleZ1vroNplwSG\nNgUGksgwdp56+zeD01TevuEo\n-----END PRIVATE KEY-----\n",
  client_email: "lrp-project@dectprj.iam.gserviceaccount.com",
  client_id: "116801634020238289800",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/lrp-project%40dectprj.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

/**
 * Dựng cấu hình xác thực Google Sheets an toàn và tự phục hồi (Self-healing).
 */
function createGoogleAuth(): InstanceType<typeof google.auth.GoogleAuth> {
  const inlineCredentials = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  if (inlineCredentials) {
    try {
      return new google.auth.GoogleAuth({
        credentials: JSON.parse(inlineCredentials),
        scopes: [SHEETS_SCOPE],
      });
    } catch {}
  }

  const relativeKeyPath =
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH ||
    "google-service-account.json";

  try {
    return new google.auth.GoogleAuth({
      keyFile: path.resolve(
        /* turbopackIgnore: true */ process.cwd(),
        relativeKeyPath,
      ),
      scopes: [SHEETS_SCOPE],
    });
  } catch {
    return new google.auth.GoogleAuth({
      credentials: DEFAULT_SERVICE_ACCOUNT,
      scopes: [SHEETS_SCOPE],
    });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tab = searchParams.get("tab") || "contacts";
  const caseIdFilter = searchParams.get("caseId") || "case_000";

  try {
    const spreadsheetId =
      process.env.GOOGLE_SHEETS_ID || DEFAULT_SPREADSHEET_ID;
    const auth = createGoogleAuth();

    const sheets = google.sheets({ version: "v4", auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${tab}'!A1:Z500`,
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return NextResponse.json({ success: true, tab, data: [] });
    }

    const headers = rows[0].map((h: string) =>
      typeof h === "string" ? h.replace(/^[🔑⚡📝🔴🟢⚪\s]+/, "").trim() : h,
    );
    const rawData = rows.slice(1).map((row) => {
      const obj: Record<string, any> = {};
      headers.forEach((header, index) => {
        if (header) {
          obj[header] = row[index] !== undefined ? row[index] : "";
        }
      });
      return obj;
    });

    // Filter by case_id if present in table
    const filteredData = rawData.filter((item) => {
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
    res.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    return res;
  } catch (error: any) {
    console.error("Error fetching Google Sheets API:", error);
    // Trả về dữ liệu rỗng an toàn thay vì HTTP 500 để không làm sập giao diện client
    return NextResponse.json({
      success: false,
      caseId: caseIdFilter,
      tab,
      totalCount: 0,
      data: [],
      error: error.message || "Failed to fetch data from Google Sheets",
    });
  }
}
