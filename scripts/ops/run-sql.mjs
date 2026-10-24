// Usage: node scripts/ops/run-sql.mjs <file.sql>   |   node scripts/ops/run-sql.mjs --query "select 1"
import { readFileSync } from "node:fs";

process.loadEnvFile(".env.local");
const ref = process.env.SUPABASE_PROJECT_REF;
const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!ref || !token) throw new Error("Missing SUPABASE_PROJECT_REF / SUPABASE_ACCESS_TOKEN in .env.local");

const [flag, arg] = process.argv.slice(2);
const query = flag === "--query" ? arg : readFileSync(flag, "utf8");
if (!query) throw new Error("Pass a .sql file or --query");

const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query }),
});
const text = await res.text();
console.log(res.status, text);
if (!res.ok) process.exit(1);
