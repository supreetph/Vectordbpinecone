import { deleteVector } from "../src/services/pineconeService.js";

async function main() {
  const result = await deleteVector("product-003");
  console.log("Deleted vector:", result);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
