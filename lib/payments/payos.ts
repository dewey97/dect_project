// PayOS client: signatures and the two payment-link calls.
// Pure module (no "server-only") so unit tests can import it with node:test.
// Import it only from server code: it reads secret env vars.
// API contract: https://payos.vn/docs/api/ (see docs/plans/2026-11-05_payment_checkout.md).
import { createHmac, timingSafeEqual } from "node:crypto";

const PAYOS_API = "https://api-merchant.payos.vn";
const REQUEST_TIMEOUT_MS = 10_000;

export interface PayosConfig {
  clientId: string;
  apiKey: string;
  checksumKey: string;
}

type Env = Record<string, string | undefined>;

/** Returns null when any key is missing: payments are then disabled. */
export function getPayosConfig(env: Env = process.env): PayosConfig | null {
  const clientId = env.PAYOS_CLIENT_ID?.trim();
  const apiKey = env.PAYOS_API_KEY?.trim();
  const checksumKey = env.PAYOS_CHECKSUM_KEY?.trim();
  if (!clientId || !apiKey || !checksumKey) return null;
  return { clientId, apiKey, checksumKey };
}

/** Public base URL used for returnUrl / cancelUrl, without a trailing slash. */
export function getAppBaseUrl(env: Env = process.env): string | null {
  const raw = env.APP_BASE_URL?.trim();
  if (!raw || !/^https?:\/\//.test(raw)) return null;
  return raw.replace(/\/+$/, "");
}

function hmacHex(text: string, key: string): string {
  return createHmac("sha256", key).update(text).digest("hex");
}

export interface PaymentRequestFields {
  amount: number;
  cancelUrl: string;
  description: string;
  orderCode: number;
  returnUrl: string;
}

/** Signature of a create-payment-link request: fixed key order, raw values. */
export function signPaymentRequest(
  fields: PaymentRequestFields,
  checksumKey: string,
): string {
  const text =
    `amount=${fields.amount}&cancelUrl=${fields.cancelUrl}` +
    `&description=${fields.description}&orderCode=${fields.orderCode}` +
    `&returnUrl=${fields.returnUrl}`;
  return hmacHex(text, checksumKey);
}

function stringifyValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

/** Signature of a webhook `data` object: keys sorted, null/undefined as "". */
export function signData(
  data: Record<string, unknown>,
  checksumKey: string,
): string {
  const text = Object.keys(data)
    .sort()
    .map((key) => `${key}=${stringifyValue(data[key])}`)
    .join("&");
  return hmacHex(text, checksumKey);
}

export function verifyWebhookSignature(
  data: Record<string, unknown>,
  signature: string,
  checksumKey: string,
): boolean {
  if (typeof signature !== "string" || !/^[0-9a-f]{64}$/i.test(signature)) {
    return false;
  }
  const expected = Buffer.from(signData(data, checksumKey), "hex");
  const given = Buffer.from(signature.toLowerCase(), "hex");
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export type OrderStatus = "pending" | "paid" | "cancelled" | "expired";

/** Maps a PayOS link status to ours. Unknown statuses return null (keep as is). */
export function mapPayosStatus(status: unknown): OrderStatus | null {
  switch (String(status ?? "").toUpperCase()) {
    case "PENDING":
    case "PROCESSING":
      return "pending";
    case "PAID":
      return "paid";
    case "CANCELLED":
      return "cancelled";
    case "EXPIRED":
      return "expired";
    default:
      return null;
  }
}

export class PayosError extends Error {
  // Plain field, not a constructor parameter property: node type stripping
  // (unit tests, ops script) does not support parameter properties.
  code: string | undefined;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "PayosError";
    this.code = code;
  }
}

interface PayosEnvelope<T> {
  code?: string;
  desc?: string;
  data?: T | null;
}

async function callPayos<T>(
  config: PayosConfig,
  path: string,
  init: { method: "GET" | "POST"; body?: unknown },
): Promise<T> {
  const res = await fetch(`${PAYOS_API}${path}`, {
    method: init.method,
    headers: {
      "x-client-id": config.clientId,
      "x-api-key": config.apiKey,
      "Content-Type": "application/json",
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const json = (await res.json().catch(() => null)) as PayosEnvelope<T> | null;
  if (!res.ok || !json || json.code !== "00" || !json.data) {
    throw new PayosError(
      json?.desc || `PayOS HTTP ${res.status}`,
      json?.code ?? String(res.status),
    );
  }
  return json.data;
}

export interface CreatePaymentLinkInput extends PaymentRequestFields {
  items?: { name: string; quantity: number; price: number }[];
  buyerEmail?: string;
  /** Unix seconds. */
  expiredAt?: number;
}

export interface PaymentLink {
  checkoutUrl: string;
  paymentLinkId: string;
  status: string;
}

export async function createPaymentLink(
  config: PayosConfig,
  input: CreatePaymentLinkInput,
): Promise<PaymentLink> {
  const signature = signPaymentRequest(input, config.checksumKey);
  const data = await callPayos<PaymentLink>(config, "/v2/payment-requests", {
    method: "POST",
    body: { ...input, signature },
  });
  return {
    checkoutUrl: data.checkoutUrl,
    paymentLinkId: data.paymentLinkId,
    status: data.status,
  };
}

export interface PaymentLinkInfo {
  orderCode: number;
  amount: number;
  amountPaid?: number;
  status: string;
}

export async function getPaymentLink(
  config: PayosConfig,
  orderCode: number,
): Promise<PaymentLinkInfo> {
  return callPayos<PaymentLinkInfo>(
    config,
    `/v2/payment-requests/${encodeURIComponent(String(orderCode))}`,
    { method: "GET" },
  );
}

/** Registers the webhook URL with PayOS. Used once by scripts/ops/payos-confirm-webhook.mjs. */
export async function confirmWebhook(
  config: PayosConfig,
  webhookUrl: string,
): Promise<void> {
  await callPayos<unknown>(config, "/confirm-webhook", {
    method: "POST",
    body: { webhookUrl },
  });
}

/** Transfer description, max 9 chars for banks not linked through payOS. */
export function orderDescription(orderCode: number): string {
  return `DH${orderCode}`.slice(0, 9);
}
