import {
  createVector,
  deleteVector,
  getVectorById,
  searchVectors,
  updateVector,
} from "../src/services/pineconeService.js";
import { sampleVectors } from "../src/utils/sampleData.js";

async function main() {
  const record = sampleVectors[0];
  const result = await createVector(record);
  console.log("Created vector:", result);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
