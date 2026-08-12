import {
  createVector,
  deleteVector,
  getVectorById,
  searchVectors,
  updateVector,
} from "../services/pineconeService.js";
import { toErrorResponse } from "../utils/errors.js";

function getNamespaceFromQuery(query) {
  return query.namespace || undefined;
}

export async function createVectorHandler(req, res) {
  try {
    const result = await createVector(req.body, {
      namespace: getNamespaceFromQuery(req.query),
    });
    res.status(201).json(result);
  } catch (error) {
    const { statusCode, body } = toErrorResponse(error);
    res.status(statusCode).json(body);
  }
}

export async function getVectorHandler(req, res) {
  try {
    const result = await getVectorById(req.params.id, {
      namespace: getNamespaceFromQuery(req.query),
    });
    res.json(result);
  } catch (error) {
    const { statusCode, body } = toErrorResponse(error);
    res.status(statusCode).json(body);
  }
}

export async function searchVectorsHandler(req, res) {
  try {
    const result = await searchVectors(req.body, {
      namespace: getNamespaceFromQuery(req.query),
    });
    res.json(result);
  } catch (error) {
    const { statusCode, body } = toErrorResponse(error);
    res.status(statusCode).json(body);
  }
}

export async function updateVectorHandler(req, res) {
  try {
    const result = await updateVector(
      {
        id: req.params.id,
        values: req.body.values,
        metadata: req.body.metadata,
      },
      { namespace: getNamespaceFromQuery(req.query) },
    );
    res.json(result);
  } catch (error) {
    const { statusCode, body } = toErrorResponse(error);
    res.status(statusCode).json(body);
  }
}

export async function deleteVectorHandler(req, res) {
  try {
    const result = await deleteVector(req.params.id, {
      namespace: getNamespaceFromQuery(req.query),
    });
    res.json(result);
  } catch (error) {
    const { statusCode, body } = toErrorResponse(error);
    res.status(statusCode).json(body);
  }
}
