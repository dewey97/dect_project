export async function executeSql(query: string) {
  try {
    process.loadEnvFile(".env.local");
  } catch {}
  try {
    process.loadEnvFile(".env");
  } catch {}

  const ref = process.env.SUPABASE_PROJECT_REF;
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!ref || !token) {
    throw new Error(
      "Missing SUPABASE_PROJECT_REF / SUPABASE_ACCESS_TOKEN in env files",
    );
  }

  const res = await fetch(
    `https://api.supabase.com/v1/projects/${ref}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    },
  );

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`executeSql failed (${res.status}): ${text}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
