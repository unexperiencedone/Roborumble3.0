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

const emailToFind = "oscuragamer1@gmail.com";

const authUser = await mongoose.connection.db.collection("authusers").findOne({ email: emailToFind });
const profile = await mongoose.connection.db.collection("profiles").findOne({ email: emailToFind });

console.log("---- Check Results ----");
console.log(`Email: ${emailToFind}`);
console.log(`AuthUser role:`, authUser ? authUser.role : 'NOT_FOUND');
if (authUser) {
    console.log(`AuthUser password length: ${authUser.password.length} (indicates it is hashed)`);
}
console.log(`Profile role:`, profile ? profile.role : 'NOT_FOUND');

await mongoose.disconnect();
