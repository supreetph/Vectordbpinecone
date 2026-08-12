import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vectorRoutes from "./routes/vectorRoutes.js";
import { createPineconeProxyMiddleware } from "./utils/pineconeProxy.js";
import { toErrorResponse } from "./utils/errors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "..");

export function createApp() {
  const app = express();

  app.use(express.json({ limit: "2mb" }));
  app.use(createPineconeProxyMiddleware());

  app.use("/api/vectors", vectorRoutes);

  app.use(express.static(workspaceRoot));

  app.use((error, req, res, next) => {
    const { statusCode, body } = toErrorResponse(error);
    res.status(statusCode).json(body);
  });

  return app;
}
