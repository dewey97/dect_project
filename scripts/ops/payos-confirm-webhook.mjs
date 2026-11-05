#!/usr/bin/env node
// Registers the PayOS webhook URL once, after the PayOS keys are set.
//
// Run from a repo checkout (Node 22.18+ for .ts imports), with PAYOS_* and
// APP_BASE_URL set in the shell, for example loaded from .env.local:
//   node --env-file=.env.local scripts/ops/payos-confirm-webhook.mjs
//
// It calls POST https://api-merchant.payos.vn/confirm-webhook with
// webhookUrl = <APP_BASE_URL>/api/payments/payos/webhook. PayOS then sends a
// test request to that URL, so the app must be deployed and reachable first.
// Prints no secret values.
import {
  confirmWebhook,
  getAppBaseUrl,
  getPayosConfig,
} from "../../lib/payments/payos.ts";

const config = getPayosConfig();
const baseUrl = getAppBaseUrl();
if (!config || !baseUrl) {
  console.error(
    "Missing PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY or APP_BASE_URL.",
  );
  process.exit(1);
}

const webhookUrl = `${baseUrl}/api/payments/payos/webhook`;
try {
  await confirmWebhook(config, webhookUrl);
  console.log(`Webhook registered: ${webhookUrl}`);
} catch (err) {
  console.error(`PayOS refused the webhook: ${err?.message ?? err}`);
  process.exit(1);
}
