import { updateVector } from "../src/services/pineconeService.js";

async function main() {
  const updated = await updateVector({
    id: "product-001",
    metadata: {
      name: "Laptop Pro",
      category: "Electronics",
      description: "Updated developer laptop",
      source: "sample-catalog",
    },
  });

  console.log("Updated vector:", updated);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
