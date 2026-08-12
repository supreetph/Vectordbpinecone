import { createSampleVector } from "../src/utils/sampleData.js";
import { searchVectors } from "../src/services/pineconeService.js";

async function main() {
  const results = await searchVectors({
    vector: createSampleVector(1),
    topK: 3,
  });

  console.log("Similarity search results:");
  results.matches.forEach((match) => {
    console.log(`- ${match.id} (score: ${match.score})`, match.metadata);
  });
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
