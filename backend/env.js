import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load backend/.env first (primary)
dotenv.config({ path: path.join(__dirname, ".env") });
// Fallback: check project root or parent directory if deployed as a subfolder
dotenv.config({ path: path.resolve(__dirname, "../.env") });
// Fallback: check current working directory (e.g. Passenger app root)
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
