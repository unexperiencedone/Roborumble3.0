/**
 * Diagnostic: counts documents in AuthUser and Profile collections.
 * Run with: node scripts/db-check.mjs
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf-8");

let MONGODB_URI = "";
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (trimmed.startsWith("MONGODB_URI")) {
    MONGODB_URI = trimmed.split("=").slice(1).join("=").replace(/^["']|["']$/g, "").trim();
    break;
  }
}

await mongoose.connect(MONGODB_URI);
console.log("✅  Connected.\n");

const db = mongoose.connection.db;
const authUserCount = await db.collection("authusers").countDocuments();
const profileCount  = await db.collection("profiles").countDocuments();

console.log(`📦 AuthUser collection:  ${authUserCount} document(s)`);
console.log(`📦 Profile collection:   ${profileCount} document(s)`);

// Show all AuthUsers (with role)
const authUsers = await db.collection("authusers").find({}, { projection: { email: 1, role: 1, name: 1 } }).toArray();
console.log("\n── AuthUsers ──");
authUsers.forEach(u => console.log(`  ${u.role?.padEnd(10)} | ${u.email}`));

// Show first 5 profiles
const profiles = await db.collection("profiles").find({}, { projection: { email: 1, role: 1, firstName: 1, lastName: 1 } }).limit(5).toArray();
console.log("\n── Profiles (first 5) ──");
if (profiles.length === 0) console.log("  (none)");
profiles.forEach(p => console.log(`  ${(p.role||"user").padEnd(10)} | ${p.email}`));

await mongoose.disconnect();
