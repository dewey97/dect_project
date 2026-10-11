import { checkMotiveValid, checkAlibiValid } from "../lib/cases/case-000-clues";
import { validateCheckpointAnswer } from "../components/investigation/evidence/checkpoints/utils";

let failed = 0;

function assert(name: string, actual: boolean, expected: boolean) {
  if (actual !== expected) {
    console.error(`FAIL [${name}]: got ${actual}, expected ${expected}`);
    failed++;
  } else {
    console.log(`PASS [${name}] => ${actual}`);
  }
}

// 1. checkMotiveValid tests
assert("Motive exact match", checkMotiveValid(["10", "dev-00"], ["10", "dev-00"]), true);
assert("Motive missing clue", checkMotiveValid(["10", "dev-00"], ["10"]), false);
// BUG TEST: Motive correct + wrong clue added MUST BE FALSE
assert("Motive correct + 1 wrong clue added", checkMotiveValid(["10", "dev-00"], ["10", "dev-00", "99_WRONG"]), false);
assert("Motive with optional allowed clue", checkMotiveValid(["10", "dev-00"], ["10", "dev-00", "p10"], ["p10"]), true);

// 2. checkAlibiValid tests
assert("Alibi exact match", checkAlibiValid(["p10"], ["p10"]), true);
// BUG TEST: Alibi correct + wrong clue added MUST BE FALSE
assert("Alibi correct + 1 wrong clue added", checkAlibiValid(["p10"], ["p10", "99_WRONG"]), false);

// 3. validateCheckpointAnswer (Evidence Picker) tests
const mockCp = {
  id: "cp-000-1a",
  type: "evidence_picker" as const,
  pickerConfig: {
    requiredEvidenceIds: ["10", "dev-00", "p6"],
    optionalEvidenceIds: ["p10"],
    validSuspects: ["Vũ", "Lê Quang Vũ"],
  },
};

assert(
  "Picker exact required",
  validateCheckpointAnswer(mockCp as any, {
    suspectInput: "Vũ",
    selectedEvidenceIds: ["10", "dev-00", "p6"],
    textMatchValues: {},
    mismatchTypeSelect: "",
    motiveSelect: "",
    convergenceSelections: {},
  }),
  true
);

assert(
  "Picker required + optional",
  validateCheckpointAnswer(mockCp as any, {
    suspectInput: "Vũ",
    selectedEvidenceIds: ["10", "dev-00", "p6", "p10"],
    textMatchValues: {},
    mismatchTypeSelect: "",
    motiveSelect: "",
    convergenceSelections: {},
  }),
  true
);

// BUG TEST: Picker required + wrong clue added MUST BE FALSE
assert(
  "Picker required + wrong clue added",
  validateCheckpointAnswer(mockCp as any, {
    suspectInput: "Vũ",
    selectedEvidenceIds: ["10", "dev-00", "p6", "99_WRONG"],
    textMatchValues: {},
    mismatchTypeSelect: "",
    motiveSelect: "",
    convergenceSelections: {},
  }),
  false
);

if (failed === 0) {
  console.log("=== ALL CLUE & EVIDENCE PICKER TESTS PASSED! ===");
} else {
  console.error(`=== ${failed} TESTS FAILED! ===`);
  process.exit(1);
}
