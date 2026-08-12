import { getVectorById } from "../src/services/pineconeService.js";

async function main() {
  const vector = await getVectorById("product-001");
  console.log("Fetched vector by id:", vector);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
