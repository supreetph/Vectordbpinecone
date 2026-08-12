const DEFAULT_DIMENSION = Number(process.env.PINECONE_DIMENSION || "1024");

/**
 * Builds a deterministic vector for learning examples.
 * Vectors are small and repeatable so tests/examples stay easy to follow.
 */
export function createSampleVector(seed, dimension = DEFAULT_DIMENSION) {
  const values = new Array(dimension);

  for (let index = 0; index < dimension; index += 1) {
    values[index] = Number(Math.sin(seed + index * 0.01).toFixed(6));
  }

  return values;
}

export const sampleVectors = [
  {
    id: "product-001",
    values: createSampleVector(1),
    metadata: {
      name: "Laptop",
      category: "Electronics",
      description: "Developer laptop for everyday coding",
      source: "sample-catalog",
    },
  },
  {
    id: "product-002",
    values: createSampleVector(2),
    metadata: {
      name: "Notebook",
      category: "Stationery",
      description: "Dot-grid notebook for notes and sketches",
      source: "sample-catalog",
    },
  },
  {
    id: "product-003",
    values: createSampleVector(3),
    metadata: {
      name: "Coffee Mug",
      category: "Kitchen",
      description: "Ceramic mug for long study sessions",
      source: "sample-catalog",
    },
  },
];
