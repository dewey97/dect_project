// Unit test linter Checkpoint Studio. Chạy: `pnpm test:unit`.
import { test } from "node:test";
import assert from "node:assert/strict";

import type { DbCaseCheckpoint } from "../types/database";
import { lintCase } from "./case-linter.ts";

const cp = (
  checkpoint_id: string,
  kind: string,
  answer_config: Record<string, unknown>,
): DbCaseCheckpoint =>
  ({
    checkpoint_id,
    kind,
    type: kind,
    depends_on: [],
    answer_config,
  }) as unknown as DbCaseCheckpoint;

const errorsOf = (checkpoints: DbCaseCheckpoint[], codes: string[] = []) =>
  lintCase({ checkpoints, availableEvidenceCodes: codes }).issues.filter(
    (issue) => issue.level === "error",
  );

test("kết luận chưa có hung thủ hoặc vật chứng bắt buộc là lỗi chặn xuất bản", () => {
  const errors = errorsOf([cp("cp-end", "indictment", {})]);
  assert.equal(errors.length, 2);
});

test("ô tra cứu không có đáp án là lỗi", () => {
  const errors = errorsOf([
    cp("cp-phone", "phone_lookup", {
      textMatchInputs: [
        { id: "p1", label: "0988", validAnswers: ["Lê Quang Vũ"] },
        { id: "p2", label: "0912", validAnswers: ["  "] },
      ],
    }),
  ]);
  assert.equal(errors.length, 1);
  assert.match(errors[0].message, /0912/);
});

test("mã vật chứng tùy chọn không tồn tại bị cảnh báo", () => {
  const result = lintCase({
    checkpoints: [
      cp("cp-end", "indictment", {
        validSuspects: ["Hà"],
        requiredEvidenceIds: ["D04"],
        optionalEvidenceIds: ["Z99"],
      }),
    ],
    availableEvidenceCodes: ["D04"],
  });
  assert.equal(result.errorCount, 0);
  const unknown = result.issues.filter(
    (i) => i.rule === "unknown_evidence_code",
  );
  assert.equal(unknown.length, 1);
  assert.equal(unknown[0].level, "warning");
  assert.match(unknown[0].message, /Z99/);
});
