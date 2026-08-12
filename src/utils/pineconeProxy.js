import http from "node:http";
import https from "node:https";
import { URL } from "node:url";
import dotenv from "dotenv";

dotenv.config();

const PINECONE_HOST = process.env.PINECONE_HOST;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;

export function createPineconeProxyMiddleware() {
  return async function pineconeProxy(req, res, next) {
    if (!req.path.startsWith("/pinecone/")) {
      next();
      return;
    }

    if (!PINECONE_API_KEY || !PINECONE_HOST) {
      res.status(503).json({
        error: "PINECONE_API_KEY is not configured in the environment.",
      });
      return;
    }

    const upstreamPath = req.path.replace(/^\/pinecone/, "");
    const upstreamUrl = new URL(upstreamPath, PINECONE_HOST);
    upstreamUrl.search = new URL(req.originalUrl, "http://localhost").search;

    const requestBody =
      req.method === "GET" || req.method === "HEAD"
        ? null
        : JSON.stringify(req.body ?? {});

    const transport = upstreamUrl.protocol === "https:" ? https : http;

    const proxyRequest = transport.request(
      upstreamUrl,
      {
        method: req.method,
        headers: {
          "Api-Key": PINECONE_API_KEY,
          "Content-Type": req.get("content-type") || "application/json",
          ...(requestBody ? { "Content-Length": Buffer.byteLength(requestBody) } : {}),
        },
      },
      (proxyResponse) => {
        res.status(proxyResponse.statusCode || 502);
        Object.entries(proxyResponse.headers).forEach(([key, value]) => {
          if (value !== undefined) {
            res.setHeader(key, value);
          }
        });
        proxyResponse.pipe(res);
      },
    );

    proxyRequest.on("error", (error) => {
      res.status(502).json({ error: error.message });
    });

    if (requestBody) {
      proxyRequest.write(requestBody);
    }

    proxyRequest.end();
  };
}
