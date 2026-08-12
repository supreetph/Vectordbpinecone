import { getPineconeConfig, getPineconeIndex } from "../config/pinecone.js";
import { AppError } from "../utils/errors.js";
import {
  validateCreatePayload,
  validateSearchPayload,
  validateUpdatePayload,
  assertValidId,
} from "../utils/validation.js";

function getNamespaceIndex(namespace) {
  const resolvedNamespace =
    namespace === undefined ? getPineconeConfig().namespace : namespace;
  return getPineconeIndex(resolvedNamespace);
}

function mapFetchResponse(response, id) {
  const record = response.records?.[id] || response.vectors?.[id];

  if (!record) {
    throw new AppError(`Vector with id "${id}" was not found.`, 404);
  }

  return {
    id,
    values: record.values,
    metadata: record.metadata || {},
  };
}

/**
 * CREATE / UPSERT
 * Inserts a new vector or replaces an existing vector with the same id.
 */
export async function createVector(payload, options = {}) {
  validateCreatePayload(payload);

  const index = getNamespaceIndex(options.namespace);
  await index.upsert([
    {
      id: payload.id,
      values: payload.values,
      metadata: payload.metadata || {},
    },
  ]);

  // Upserts can take a moment to become readable in serverless indexes.
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    id: payload.id,
    namespace: options.namespace ?? getPineconeConfig().namespace,
    upserted: true,
  };
}

/**
 * READ BY ID (Fetch)
 * Retrieves exact vector records by id. This is not similarity search.
 */
export async function getVectorById(id, options = {}) {
  assertValidId(id);

  const index = getNamespaceIndex(options.namespace);
  const response = await index.fetch([id]);

  return mapFetchResponse(response, id);
}

/**
 * READ BY QUERY (Similarity Search)
 * Finds the most similar vectors to an input vector.
 */
export async function searchVectors(payload, options = {}) {
  validateSearchPayload(payload);

  const index = getNamespaceIndex(options.namespace);
  const response = await index.query({
    vector: payload.vector,
    topK: payload.topK || 3,
    includeValues: payload.includeValues ?? false,
    includeMetadata: payload.includeMetadata ?? true,
  });

  return {
    matches: (response.matches || []).map((match) => ({
      id: match.id,
      score: match.score,
      values: match.values,
      metadata: match.metadata || {},
    })),
  };
}

/**
 * UPDATE
 * Updates an existing vector's values and/or metadata by id.
 */
export async function updateVector(payload, options = {}) {
  validateUpdatePayload(payload);

  const index = getNamespaceIndex(options.namespace);

  // Confirm the vector exists before updating so callers get a clear 404.
  await getVectorById(payload.id, options);

  await index.update({
    id: payload.id,
    ...(payload.values ? { values: payload.values } : {}),
    ...(payload.metadata ? { metadata: payload.metadata } : {}),
  });

  // Pinecone updates can be eventually consistent; wait briefly before re-fetching.
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return getVectorById(payload.id, options);
}

/**
 * DELETE
 * Removes one vector by id.
 */
export async function deleteVector(id, options = {}) {
  assertValidId(id);

  const index = getNamespaceIndex(options.namespace);
  await index.deleteOne(id);

  return {
    id,
    deleted: true,
    namespace: options.namespace ?? getPineconeConfig().namespace,
  };
}

/**
 * DELETE MANY
 * Removes multiple vectors by id list.
 */
export async function deleteVectors(ids, options = {}) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new AppError("ids must be a non-empty array.", 400);
  }

  ids.forEach((id) => assertValidId(id));

  const index = getNamespaceIndex(options.namespace);
  await index.deleteMany(ids);

  return {
    ids,
    deleted: true,
    namespace: options.namespace ?? getPineconeConfig().namespace,
  };
}

/**
 * Legacy read helper used by the original browser demo.
 * Fetches vector id "0" from the default namespace (sample movies index).
 */
export async function fetchLegacyAvatarVector() {
  const index = getPineconeIndex("");
  const response = await index.fetch(["0"]);
  return mapFetchResponse(response, "0");
}
