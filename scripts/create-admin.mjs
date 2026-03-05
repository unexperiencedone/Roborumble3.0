/**
 * One-shot script: creates or updates admin user in BOTH AuthUser and Profile collections.
 * Run with: node scripts/create-admin.mjs
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ── Read MONGODB_URI from .env.local ──────────────────────────────────────────
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

if (!MONGODB_URI) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}

// ── Admin credentials ─────────────────────────────────────────────────────────
const ADMIN_EMAIL    = "kumaraakshant2005@gmail.com";
const ADMIN_PASSWORD = "robo@2026";
const ADMIN_NAME     = "Aakshant Kumar";

// ── AuthUser Schema (uppercase roles) ────────────────────────────────────────
const AuthUserSchema = new mongoose.Schema(
  {
    name:          { type: String, required: true },
    email:         { type: String, required: true, unique: true },
    password:      { type: String, required: true },
    college:       { type: String, required: true },
    events:        [{ type: String }],
    teamMembers:   [{ type: String }],
    paymentStatus: { type: String, default: "approved" },
    role:          { type: String, enum: ["USER", "ADMIN", "SUPERADMIN"], default: "USER" },
    teamName:      String,
    paidEvents:    [{ type: String }],
  },
  { timestamps: true }
);

// ── Profile Schema (lowercase roles) ─────────────────────────────────────────
const ProfileSchema = new mongoose.Schema(
  {
    clerkId:           { type: String, unique: true, sparse: true },
    email:             { type: String, required: true, lowercase: true, trim: true },
    firstName:         String,
    lastName:          String,
    password:          { type: String, select: false },
    username:          { type: String, unique: true, sparse: true },
    phone:             String,
    college:           String,
    role:              { type: String, enum: ["user", "admin", "superadmin"], default: "user" },
    interests:         [{ type: String }],
    registeredEvents:  [{ type: String }],
    paidEvents:        [{ type: String }],
    onboardingCompleted: { type: Boolean, default: true },
    boarding:          { type: Boolean, default: true },
  },
  { timestamps: true }
);

const AuthUser = mongoose.models.AuthUser || mongoose.model("AuthUser", AuthUserSchema);
const Profile  = mongoose.models.Profile  || mongoose.model("Profile",  ProfileSchema);

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected.\n");

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  // --- 1. Upsert AuthUser (used for legacy JWT login) ---
  const existingAuthUser = await AuthUser.findOne({ email: ADMIN_EMAIL });
  if (existingAuthUser) {
    await AuthUser.updateOne(
      { email: ADMIN_EMAIL },
      { $set: { password: hashedPassword, role: "ADMIN", paymentStatus: "approved", teamName: "ADMIN_CORE" } }
    );
    console.log("[AuthUser] Updated -> role: ADMIN");
  } else {
    await AuthUser.create({
      name: ADMIN_NAME, email: ADMIN_EMAIL, password: hashedPassword,
      college: "CSJMU", role: "ADMIN", paymentStatus: "approved",
      teamName: "ADMIN_CORE", events: [],
    });
    console.log("[AuthUser] Created -> role: ADMIN");
  }

  // --- 2. Upsert Profile (used by dashboard user list and admin guard fallback) ---
  const existingProfile = await Profile.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (existingProfile) {
    await Profile.updateOne(
      { email: ADMIN_EMAIL.toLowerCase() },
      { $set: { role: "admin", firstName: "Aakshant", lastName: "Kumar", college: "CSJMU", onboardingCompleted: true, boarding: true } }
    );
    console.log("[Profile]  Updated -> role: admin");
  } else {
    await Profile.create({
      email: ADMIN_EMAIL.toLowerCase(), firstName: "Aakshant", lastName: "Kumar",
      college: "CSJMU", role: "admin", username: "admin_aakshant",
      onboardingCompleted: true, boarding: true, interests: [], registeredEvents: [], paidEvents: [],
    });
    console.log("[Profile]  Created -> role: admin");
  }

  console.log(`\nAdmin setup complete!`);
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  console.log(`  Login at: /admin/login`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
