// Unit test PayOS signatures. Run: `pnpm test:unit`.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";

import {
  getPayosConfig,
  mapPayosStatus,
  orderDescription,
  signData,
  signPaymentRequest,
  verifyWebhookSignature,
} from "./payos.ts";

const KEY = "test-checksum-key";
const hmac = (text: string) =>
  createHmac("sha256", KEY).update(text).digest("hex");

test("payment request signature uses the fixed key order", () => {
  const fields = {
    orderCode: 100001,
    amount: 69000,
    description: "DH100001",
    returnUrl: "https://x.test/buy/result",
    cancelUrl: "https://x.test/buy/case_000",
  };
  assert.equal(
    signPaymentRequest(fields, KEY),
    hmac(
      "amount=69000&cancelUrl=https://x.test/buy/case_000&description=DH100001&orderCode=100001&returnUrl=https://x.test/buy/result",
    ),
  );
});

test("data signature sorts keys and turns null into an empty string", () => {
  const data = {
    orderCode: 1,
    amount: 2,
    counterAccountName: null,
    code: "00",
  };
  assert.equal(
    signData(data, KEY),
    hmac("amount=2&code=00&counterAccountName=&orderCode=1"),
  );
});

test("webhook signature: valid passes, any change fails", () => {
  const data = {
    orderCode: 100001,
    amount: 69000,
    reference: "FT1",
    desc: "success",
  };
  const signature = signData(data, KEY);
  assert.equal(verifyWebhookSignature(data, signature, KEY), true);
  assert.equal(
    verifyWebhookSignature(data, signature.toUpperCase(), KEY),
    true,
  );
  assert.equal(
    verifyWebhookSignature({ ...data, amount: 1000 }, signature, KEY),
    false,
  );
  const flipped = (signature[0] === "a" ? "b" : "a") + signature.slice(1);
  assert.equal(verifyWebhookSignature(data, flipped, KEY), false);
  assert.equal(verifyWebhookSignature(data, "", KEY), false);
  assert.equal(verifyWebhookSignature(data, signature, "other-key"), false);
});

test("config is null when any key is missing", () => {
  assert.equal(
    getPayosConfig({ PAYOS_CLIENT_ID: "a", PAYOS_API_KEY: "b" }),
    null,
  );
  assert.deepEqual(
    getPayosConfig({
      PAYOS_CLIENT_ID: "a",
      PAYOS_API_KEY: "b",
      PAYOS_CHECKSUM_KEY: "c",
    }),
    { clientId: "a", apiKey: "b", checksumKey: "c" },
  );
});

test("status mapping and description length", () => {
  assert.equal(mapPayosStatus("PAID"), "paid");
  assert.equal(mapPayosStatus("cancelled"), "cancelled");
  assert.equal(mapPayosStatus("SOMETHING_NEW"), null);
  assert.equal(orderDescription(100001), "DH100001");
  assert.ok(orderDescription(9_999_999).length <= 9);
});
