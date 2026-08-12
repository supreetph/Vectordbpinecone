import dotenv from "dotenv";
import { getPineconeConfig } from "../src/config/pinecone.js";
import {
  createVector,
  deleteVector,
  fetchLegacyAvatarVector,
  getVectorById,
  searchVectors,
  updateVector,
} from "../src/services/pineconeService.js";
import { AppError } from "../src/utils/errors.js";
import { createSampleVector } from "../src/utils/sampleData.js";

dotenv.config();

const DEMO_VECTOR_ID = "crud-demo-001";
const DEMO_SEED = 101;

const INITIAL_METADATA = {
  name: "CRUD Demo Product",
  category: "Learning",
  description: "Pinecone CRUD demonstration",
  status: "Created",
  source: "crud-demo",
};

const UPDATED_METADATA = {
  name: "CRUD Demo Product - Updated",
  category: "Learning",
  description: "Pinecone CRUD demonstration",
  status: "Updated",
  source: "crud-demo",
};

function divider(title) {
  console.log(`\n${"=".repeat(40)}`);
  console.log(title);
  console.log("=".repeat(40));
}

function printMetadata(metadata) {
  console.log(JSON.stringify(metadata, null, 2));
}

function printIntro(config) {
  console.log("PINECONE CRUD LEARNING DEMO");
  console.log("===========================\n");
  console.log("This demo will execute:\n");
  console.log("CREATE");
  console.log("  ↓");
  console.log("READ");
  console.log("  ↓");
  console.log("UPDATE");
  console.log("  ↓");
  console.log("READ");
  console.log("  ↓");
  console.log("QUERY");
  console.log("  ↓");
  console.log("DELETE");
  console.log("  ↓");
  console.log("VERIFY DELETE\n");
  console.log(`Index: ${config.indexName}`);
  console.log(`Namespace: ${config.namespace}`);
  console.log(`Vector ID: ${DEMO_VECTOR_ID}`);
}

async function cleanupExistingDemoVector(namespace) {
  try {
    await getVectorById(DEMO_VECTOR_ID, { namespace });
    await deleteVector(DEMO_VECTOR_ID, { namespace });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(`Cleaned up existing demo vector: ${DEMO_VECTOR_ID}`);
  } catch (error) {
    if (!(error instanceof AppError) || error.statusCode !== 404) {
      throw error;
    }
  }
}

async function runStep(stepName, fn) {
  try {
    return await fn();
  } catch (error) {
    console.error(`\n✗ ${stepName} FAILED\n`);
    console.error("Error:");
    console.error(error instanceof AppError ? error.message : error.message);
    process.exit(1);
  }
}

async function main() {
  const config = getPineconeConfig();
  const namespace = config.namespace;
  const demoVector = {
    id: DEMO_VECTOR_ID,
    values: createSampleVector(DEMO_SEED, config.dimension),
    metadata: INITIAL_METADATA,
  };

  printIntro(config);
  await cleanupExistingDemoVector(namespace);

  await runStep("STEP 1: CREATE", async () => {
    divider("STEP 1: CREATE");
    console.log(`\nCreating vector: ${DEMO_VECTOR_ID}`);
    console.log(`Namespace: ${namespace}\n`);

    const result = await createVector(demoVector, { namespace });

    console.log("✓ Vector created successfully");
    console.log(`Upserted ID: ${result.id}`);
    console.log(`Namespace: ${result.namespace}`);
  });

  let createdVector;

  await runStep("STEP 2: READ", async () => {
    divider("STEP 2: READ");
    console.log(`\nFetching vector: ${DEMO_VECTOR_ID}\n`);

    createdVector = await getVectorById(DEMO_VECTOR_ID, { namespace });

    console.log("✓ Vector found\n");
    console.log(`ID: ${createdVector.id}`);
    console.log(`Vector dimension: ${createdVector.values.length}`);
    console.log("Metadata:");
    printMetadata(createdVector.metadata);
  });

  await runStep("STEP 3: UPDATE", async () => {
    divider("STEP 3: UPDATE");
    console.log(`\nUpdating vector: ${DEMO_VECTOR_ID}\n`);
    console.log("Changing:");
    console.log(`status: ${INITIAL_METADATA.status} → ${UPDATED_METADATA.status}`);
    console.log(`name: ${INITIAL_METADATA.name} → ${UPDATED_METADATA.name}\n`);

    await updateVector(
      {
        id: DEMO_VECTOR_ID,
        metadata: UPDATED_METADATA,
      },
      { namespace },
    );

    console.log("✓ Vector updated successfully");
  });

  await runStep("STEP 4: READ AFTER UPDATE", async () => {
    divider("STEP 4: READ AFTER UPDATE");
    console.log("\nFetching vector again...\n");

    const updatedVector = await getVectorById(DEMO_VECTOR_ID, { namespace });

    console.log("✓ Vector found\n");
    console.log("Updated metadata:");
    printMetadata(updatedVector.metadata);
  });

  await runStep("STEP 5: QUERY / SEARCH", async () => {
    divider("STEP 5: QUERY / SEARCH");
    console.log(`\nSearching vectors in namespace: ${namespace}\n`);
    console.log("FETCH = retrieve a vector using its ID");
    console.log("QUERY = find similar vectors using vector similarity\n");

    const results = await searchVectors(
      {
        vector: demoVector.values,
        topK: 5,
      },
      { namespace },
    );

    if (results.matches.length === 0) {
      console.log("No matches returned.");
      return;
    }

    console.log("Top matches:\n");
    results.matches.forEach((match, index) => {
      console.log(`${index + 1}. ${match.id}`);
      console.log(`   Score: ${match.score?.toFixed(4) ?? "n/a"}`);
      console.log(`   Metadata: ${JSON.stringify(match.metadata)}`);
      console.log("");
    });
  });

  await runStep("STEP 6: DELETE", async () => {
    divider("STEP 6: DELETE");
    console.log(`\nDeleting vector: ${DEMO_VECTOR_ID}\n`);

    await deleteVector(DEMO_VECTOR_ID, { namespace });

    console.log("✓ Vector deleted successfully");
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  await runStep("STEP 7: VERIFY DELETE", async () => {
    divider("STEP 7: VERIFY DELETE");
    console.log("\nAttempting to fetch deleted vector...\n");

    let stillExists = false;

    for (let attempt = 0; attempt < 6; attempt += 1) {
      try {
        await getVectorById(DEMO_VECTOR_ID, { namespace });
        stillExists = true;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        if (error instanceof AppError && error.statusCode === 404) {
          stillExists = false;
          break;
        }
        throw error;
      }
    }

    if (stillExists) {
      throw new Error("Vector still exists after delete.");
    }

    console.log("✓ Vector no longer exists\n");
    console.log("DELETE verified successfully.");
  });

  const avatar = await fetchLegacyAvatarVector();
  if (avatar.metadata.title !== "Avatar") {
    throw new Error("Legacy sample movie data may have been modified unexpectedly.");
  }

  divider("CRUD DEMO COMPLETE");
  console.log("\n✓ CREATE");
  console.log("✓ READ");
  console.log("✓ UPDATE");
  console.log("✓ READ AFTER UPDATE");
  console.log("✓ QUERY");
  console.log("✓ DELETE");
  console.log("✓ VERIFY DELETE");
  console.log(`\nNamespace: ${namespace}`);
  console.log(`Vector ID: ${DEMO_VECTOR_ID}`);
  console.log("\nThe complete Pinecone CRUD lifecycle was successfully demonstrated.");
  console.log("Existing sample movie data (Avatar) remains untouched.");
}

main().catch((error) => {
  console.error("\nDemo failed unexpectedly.\n");
  console.error(error.message);
  process.exit(1);
});
