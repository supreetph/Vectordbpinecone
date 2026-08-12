import test from "node:test";
import assert from "node:assert/strict";
import {
  createVector,
  deleteVector,
  fetchLegacyAvatarVector,
  getVectorById,
  searchVectors,
  updateVector,
} from "../../src/services/pineconeService.js";
import { createSampleVector, sampleVectors } from "../../src/utils/sampleData.js";
import { AppError } from "../../src/utils/errors.js";

const hasCredentials = Boolean(process.env.PINECONE_API_KEY);

test("integration: legacy Avatar fetch still works", { skip: !hasCredentials }, async () => {
  const avatar = await fetchLegacyAvatarVector();
  assert.equal(avatar.metadata.title, "Avatar");
  assert.equal(avatar.metadata.year, 2009);
});

test("integration: CRUD flow in learning namespace", { skip: !hasCredentials }, async () => {
  const record = sampleVectors[0];

  try {
    await deleteVector(record.id);
  } catch {
    // Ignore cleanup errors when the record does not exist yet.
  }

  await createVector(record);
  const created = await getVectorById(record.id);
  assert.equal(created.metadata.name, "Laptop");

  const searchResults = await searchVectors({
    vector: createSampleVector(1),
    topK: 1,
  });
  assert.ok(searchResults.matches.length > 0);

  const updated = await updateVector({
    id: record.id,
    metadata: {
      ...record.metadata,
      description: "Updated developer laptop",
    },
  });
  assert.match(updated.metadata.description, /Updated developer laptop/);

  const deleted = await deleteVector(record.id);
  assert.equal(deleted.deleted, true);

  await new Promise((resolve) => setTimeout(resolve, 1500));
  await assert.rejects(() => getVectorById(record.id), AppError);
});
