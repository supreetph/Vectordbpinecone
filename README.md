# Vectordbpinecone

A beginner-friendly JavaScript project for learning [Pinecone](https://www.pinecone.io/) vector database operations.

The repository includes:

- A **legacy browser demo** that fetches the sample movie vector with id `0` (Avatar)
- A **Node.js CRUD API** for create, read, update, delete, and similarity search
- **Examples** and **tests** that demonstrate each operation

## Quick start

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Set `PINECONE_API_KEY` in `.env` or in your Cloud Agent environment secrets.

3. Install dependencies:

```bash
npm install
```

4. Start the dev server:

```bash
npm start
```

5. Open http://127.0.0.1:8080/ for the original browser demo.

## Environment variables

| Variable | Description |
| --- | --- |
| `PINECONE_API_KEY` | Pinecone API key (required) |
| `PINECONE_INDEX_NAME` | Index name (`sample-movies`) |
| `PINECONE_HOST` | Index host URL |
| `PINECONE_DIMENSION` | Vector dimension (`1024`) |
| `PINECONE_NAMESPACE` | Namespace for CRUD learning examples (`learning`) |
| `DEV_SERVER_PORT` | Server port (`8080`) |

Never commit real secrets. `.env` is gitignored.

## API routes

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/vectors` | Create / upsert a vector |
| `GET` | `/api/vectors/:id` | Fetch a vector by id |
| `PUT` | `/api/vectors/:id` | Update vector values and/or metadata |
| `DELETE` | `/api/vectors/:id` | Delete a vector by id |
| `POST` | `/api/vectors/search` | Similarity search / query |

Optional query parameter: `?namespace=learning`

Legacy browser proxy (unchanged):

```text
GET /pinecone/vectors/fetch?ids=0
```

## Examples

```bash
npm run example:create
npm run example:read
npm run example:search
npm run example:update
npm run example:delete
```

## End-to-End CRUD Demo

Run a single command to walk through the complete Pinecone vector lifecycle:

```bash
npm run demo:crud
```

### What it demonstrates

1. Create / Upsert
2. Read / Fetch
3. Update
4. Read again to verify update
5. Query / Similarity Search
6. Delete
7. Verify deletion

### Lifecycle

```text
Create
  ↓
Read
  ↓
Update
  ↓
Read Again
  ↓
Query
  ↓
Delete
  ↓
Verify Delete
```

### Fetch vs Query

| Operation | Purpose |
| --- | --- |
| **FETCH** | Find a vector by its exact ID |
| **QUERY** | Find similar vectors using vector similarity |

The demo uses the `learning` namespace and a dedicated vector id (`crud-demo-001`). It does not modify the original sample movie vectors such as Avatar.

## Tests

Unit tests (no Pinecone credentials required):

```bash
npm test
```

Integration tests (require `PINECONE_API_KEY`):

```bash
npm run test:integration
```

---

## Pinecone CRUD Operations

This section explains the five core vector operations implemented in this repository.

### Architecture flow

```text
Application
     |
     v
Controller / Route
     |
     v
Pinecone Service
     |
     v
Pinecone Index
     |
     v
Vectors + Metadata
```

```text
                Pinecone
                   |
        +----------+----------+
        |          |          |
      CREATE      READ      DELETE
        |          |
      Upsert    Fetch/Query
                   |
                UPDATE
```

### 1. Create / Upsert

**What it does:** Inserts a new vector or replaces an existing vector with the same id.

**SDK method:** `index.upsert([{ id, values, metadata }])`

**Required parameters:**
- `id` — unique vector id
- `values` — numeric array matching index dimension (`1024`)
- `metadata` — optional object with fields like `name`, `category`, `description`, `source`

**Returns:** Upsert confirmation from Pinecone.

**Example:**

```javascript
await createVector({
  id: "product-001",
  values: createSampleVector(1),
  metadata: {
    name: "Laptop",
    category: "Electronics",
    description: "Developer laptop",
    source: "sample-catalog",
  },
});
```

### 2. Read / Fetch (Get by ID)

**What it does:** Retrieves exact vector records by id. This is **not** similarity search.

**SDK method:** `index.fetch(["product-001"])`

**Required parameters:** vector id

**Returns:** Vector values and metadata for the requested id.

**Example:**

```javascript
const vector = await getVectorById("product-001");
```

**Get by ID vs similarity search**

| Operation | Purpose | SDK method |
| --- | --- | --- |
| Get by ID | Retrieve known records exactly | `fetch` |
| Similarity search | Find nearest vectors to an input vector | `query` |

### 3. Query / Similarity Search

**What it does:** Finds the most similar vectors to an input vector.

**SDK method:** `index.query({ vector, topK, includeMetadata })`

**Required parameters:**
- `vector` — query vector (`1024` numbers)
- `topK` — number of matches to return

**Returns:** Ranked matches with similarity scores.

**Example:**

```javascript
const results = await searchVectors({
  vector: createSampleVector(1),
  topK: 3,
});
```

### 4. Update

**What it does:** Updates an existing vector's values and/or metadata.

**SDK method:** `index.update({ id, values?, metadata? })`

**Required parameters:**
- `id`
- at least one of `values` or `metadata`

**Returns:** Updated vector record.

**Example:**

```javascript
await updateVector({
  id: "product-001",
  metadata: {
    name: "Laptop Pro",
    category: "Electronics",
    description: "Updated developer laptop",
    source: "sample-catalog",
  },
});
```

### 5. Delete

**What it does:** Removes vectors from the index.

**SDK methods:**
- `index.deleteOne(id)` — delete one vector
- `index.deleteMany([ids])` — delete multiple vectors

**Required parameters:** vector id(s)

**Returns:** Delete confirmation.

**Example:**

```javascript
await deleteVector("product-001");
```

### Terminology

| Term | Meaning |
| --- | --- |
| **Upsert** | Create or replace a vector |
| **Fetch** | Read exact vectors by id |
| **Query** | Similarity search using a vector |
| **Update** | Change values/metadata for an existing id |
| **Delete** | Remove vectors from the index |

### Sample learning data

CRUD examples use the `learning` namespace so they do not modify the original sample movie vectors in the default namespace.

Three sample records are defined in `src/utils/sampleData.js`:

- `product-001` — Laptop / Electronics
- `product-002` — Notebook / Stationery
- `product-003` — Coffee Mug / Kitchen

Each sample vector has **1024 dimensions** to match the `sample-movies` index.

## Project structure

```text
src/
  config/pinecone.js          # Shared Pinecone client initialization
  services/pineconeService.js # Reusable CRUD functions
  controllers/vectorController.js
  routes/vectorRoutes.js
  utils/                      # Validation, errors, proxy, sample data
  app.js
  server.js
examples/                     # Runnable CRUD demos
tests/                        # Unit + integration tests
script.js                     # Legacy browser fetch demo (Avatar)
```

## Legacy browser demo

`script.js` still fetches vector id `0` from the default namespace and logs Avatar metadata to the browser console. In local development, requests go through `/pinecone/*` so the API key stays on the server.
