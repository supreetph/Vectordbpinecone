import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";

dotenv.config();

const requiredEnv = ["PINECONE_API_KEY", "PINECONE_INDEX_NAME", "PINECONE_HOST"];

function getConfig() {
  const missing = requiredEnv.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(
      `Missing Pinecone configuration: ${missing.join(", ")}. See .env.example.`,
    );
  }

  return {
    apiKey: process.env.PINECONE_API_KEY,
    indexName: process.env.PINECONE_INDEX_NAME,
    host: process.env.PINECONE_HOST,
    dimension: Number(process.env.PINECONE_DIMENSION || "1024"),
    namespace: process.env.PINECONE_NAMESPACE || "learning",
  };
}

let pineconeClient;

export function getPineconeConfig() {
  return getConfig();
}

export function getPineconeClient() {
  if (!pineconeClient) {
    const { apiKey } = getConfig();
    pineconeClient = new Pinecone({ apiKey });
  }

  return pineconeClient;
}

export function getPineconeIndex(namespace) {
  const { indexName, host } = getConfig();
  const client = getPineconeClient();
  const index = client.index(indexName, host);

  if (namespace && namespace.length > 0) {
    return index.namespace(namespace);
  }

  return index;
}
