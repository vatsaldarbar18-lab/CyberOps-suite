import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { hashPassword, validateEmail, validatePasswordPolicy } from "../server/auth.js";
import { createUser, findUserByEmail } from "../server/storage.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

async function loadEnvFile() {
  try {
    const envFile = await fs.readFile(path.join(root, ".env"), "utf8");
    for (const line of envFile.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const [key, ...valueParts] = trimmed.split("=");
      if (!process.env[key]) process.env[key] = valueParts.join("=").trim();
    }
  } catch {
    // .env is optional.
  }
}

await loadEnvFile();

const name = process.env.ADMIN_NAME?.trim();
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || "";

if (!name || !email || !password) {
  console.error("Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD in your environment, then run npm run admin:create.");
  process.exit(1);
}

if (!validateEmail(email)) {
  console.error("ADMIN_EMAIL must be a valid email address.");
  process.exit(1);
}

const passwordErrors = validatePasswordPolicy(password);
if (passwordErrors.length) {
  console.error(passwordErrors[0]);
  process.exit(1);
}

const existing = await findUserByEmail(email);
if (existing) {
  console.error("An account already exists for ADMIN_EMAIL. Promote it manually in the database if needed.");
  process.exit(1);
}

const credential = await hashPassword(password);
const created = await createUser({ name, email, role: "admin", credential });
console.log(`Admin account created for ${created.user.email} using ${created.storage} storage.`);
