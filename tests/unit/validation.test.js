import test from "node:test";
import assert from "node:assert/strict";
import {
  assertValidId,
  assertValidMetadata,
  assertValidVector,
  validateCreatePayload,
  validateSearchPayload,
  validateUpdatePayload,
} from "../../src/utils/validation.js";
import { AppError } from "../../src/utils/errors.js";
import { createSampleVector } from "../../src/utils/sampleData.js";

test("assertValidId rejects empty ids", () => {
  assert.throws(() => assertValidId(""), AppError);
});

test("assertValidVector enforces dimension and numeric values", () => {
  assert.doesNotThrow(() => assertValidVector(createSampleVector(1), 1024));
  assert.throws(() => assertValidVector([1, 2, 3], 1024), AppError);
  assert.throws(() => assertValidVector(createSampleVector(1).map(String), 1024), AppError);
});

test("assertValidMetadata requires a plain object", () => {
  assert.doesNotThrow(() => assertValidMetadata({ name: "Laptop" }));
  assert.throws(() => assertValidMetadata([]), AppError);
});

test("validateCreatePayload accepts a complete vector payload", () => {
  assert.doesNotThrow(() =>
    validateCreatePayload({
      id: "product-001",
      values: createSampleVector(1),
      metadata: { name: "Laptop", category: "Electronics" },
    }),
  );
});

test("validateUpdatePayload requires at least one update field", () => {
  assert.throws(
    () => validateUpdatePayload({ id: "product-001" }),
    AppError,
  );
});

test("validateSearchPayload requires a query vector", () => {
  assert.throws(() => validateSearchPayload({ topK: 3 }), AppError);
});
