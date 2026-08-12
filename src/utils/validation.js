import { getPineconeConfig } from "../config/pinecone.js";
import { AppError } from "./errors.js";

export function assertValidId(id, fieldName = "id") {
  if (typeof id !== "string" || id.trim().length === 0) {
    throw new AppError(`${fieldName} must be a non-empty string.`, 400);
  }
}

export function assertValidMetadata(metadata) {
  if (metadata === undefined) {
    return;
  }

  if (metadata === null || typeof metadata !== "object" || Array.isArray(metadata)) {
    throw new AppError("metadata must be a plain object.", 400);
  }
}

export function assertValidVector(values, dimension = getPineconeConfig().dimension) {
  if (!Array.isArray(values)) {
    throw new AppError("vector must be an array of numbers.", 400);
  }

  if (values.length === 0) {
    throw new AppError("vector cannot be empty.", 400);
  }

  if (values.length !== dimension) {
    throw new AppError(
      `vector dimension must be ${dimension}, received ${values.length}.`,
      400,
    );
  }

  if (!values.every((value) => typeof value === "number" && Number.isFinite(value))) {
    throw new AppError("vector values must be finite numbers.", 400);
  }
}

export function validateCreatePayload(payload) {
  assertValidId(payload.id);
  assertValidVector(payload.values);
  assertValidMetadata(payload.metadata);
}

export function validateUpdatePayload(payload) {
  assertValidId(payload.id);

  if (payload.values === undefined && payload.metadata === undefined) {
    throw new AppError("Provide values and/or metadata to update.", 400);
  }

  if (payload.values !== undefined) {
    assertValidVector(payload.values);
  }

  assertValidMetadata(payload.metadata);
}

export function validateSearchPayload(payload) {
  assertValidVector(payload.vector);

  if (payload.topK !== undefined) {
    if (!Number.isInteger(payload.topK) || payload.topK < 1) {
      throw new AppError("topK must be a positive integer.", 400);
    }
  }
}
