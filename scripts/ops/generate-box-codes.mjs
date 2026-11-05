#!/usr/bin/env node
// Generates activation codes for a print batch of boxes.
//
//   node scripts/ops/generate-box-codes.mjs <case_id> <count> <batch> <out_dir>
//   node scripts/ops/generate-box-codes.mjs case_000 500 2026-11-batch1 ../box-codes
//
// Writes two files into <out_dir> (keep it OUTSIDE the repo, never commit them):
//   <batch>.csv  plain codes and QR links, for the printer. Treat as secret.
//   <batch>.sql  INSERT of the sha256 hashes into public.box_codes, for Supabase.
// The database never stores plain codes. Node 22.18+ (imports a .ts module).
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  generateBoxCode,
  hashBoxCode,
  normalizeBoxCode,
} from "../../lib/payments/box-code.ts";

const [caseId, countArg, batch, outDir] = process.argv.slice(2);
const count = Number(countArg);
const BASE_URL = (process.env.APP_BASE_URL || "https://xplore.vn").replace(/\/+$/, "");

if (
  !/^[a-z0-9_]{1,64}$/.test(caseId ?? "") ||
  !Number.isInteger(count) || count < 1 || count > 100_000 ||
  !/^[A-Za-z0-9_.-]{1,64}$/.test(batch ?? "") ||
  !outDir
) {
  console.error("Usage: generate-box-codes.mjs <case_id> <count 1-100000> <batch> <out_dir>");
  process.exit(1);
}

const out = resolve(outDir);
if (out.startsWith(resolve("."))) {
  console.error("out_dir must be outside the repository.");
  process.exit(1);
}

const codes = new Set();
while (codes.size < count) codes.add(generateBoxCode());

const csv = ["code,qr_url"];
const values = [];
for (const code of codes) {
  csv.push(`${code},${BASE_URL}/cases/${caseId}?code=${code}`);
  values.push(`  ('${hashBoxCode(normalizeBoxCode(code))}', '${caseId}', '${batch}')`);
}

const sql = [
  `-- Box codes for ${caseId}, batch ${batch}, ${count} codes.`,
  "INSERT INTO public.box_codes (code_hash, case_id, batch) VALUES",
  values.join(",\n"),
  "ON CONFLICT (code_hash) DO NOTHING;",
  "",
].join("\n");

mkdirSync(out, { recursive: true });
writeFileSync(join(out, `${batch}.csv`), csv.join("\n") + "\n");
writeFileSync(join(out, `${batch}.sql`), sql);
console.log(`Wrote ${count} codes to ${join(out, `${batch}.csv`)} and ${join(out, `${batch}.sql`)}`);
