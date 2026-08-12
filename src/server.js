import dotenv from "dotenv";
import { createApp } from "./app.js";

dotenv.config();

const port = Number(process.env.DEV_SERVER_PORT || "8080");
const app = createApp();

app.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on http://0.0.0.0:${port}/`);
  console.log("Static files, /pinecone proxy, and /api/vectors CRUD routes are enabled.");
});
