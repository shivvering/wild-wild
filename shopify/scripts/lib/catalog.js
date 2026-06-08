import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function loadCatalog() {
  const file = path.join(__dirname, "../../config/products.catalog.json");
  return JSON.parse(fs.readFileSync(file, "utf8"));
}
