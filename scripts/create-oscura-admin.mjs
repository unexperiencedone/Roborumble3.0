/**
 * One-shot script: creates or updates oscuragamer1@gmail.com as admin 
 * Run with: node scripts/create-oscura-admin.mjs
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ── Read MONGODB_URI ──────────────────────────────────────────────────────────
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

// ── Admin credentials ─────────────────────────────────────────────────────────
const ADMIN_EMAIL    = "oscuragamer1@gmail.com";
const ADMIN_PASSWORD = "robo@2026@uiet";
const ADMIN_NAME     = "Oscura Gamer";

const AuthUserSchema = new mongoose.Schema({
    name: String, email: String, password: String, college: String, role: String,
    paymentStatus: String, teamName: String, events: [String]
}, { timestamps: true });

const ProfileSchema = new mongoose.Schema({
    email: String, firstName: String, lastName: String, college: String, role: String,
    username: String, onboardingCompleted: Boolean, boarding: Boolean,
    interests: [String], registeredEvents: [String], paidEvents: [String]
}, { timestamps: true });

const AuthUser = mongoose.models.AuthUser || mongoose.model("AuthUser", AuthUserSchema);
const Profile  = mongoose.models.Profile  || mongoose.model("Profile",  ProfileSchema);

async function main() {
  await mongoose.connect(MONGODB_URI);
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  // 1. AuthUser
  const existingAuthUser = await AuthUser.findOne({ email: ADMIN_EMAIL });
  if (existingAuthUser) {
    await AuthUser.updateOne({ email: ADMIN_EMAIL }, { $set: { password: hashedPassword, role: "ADMIN" } });
  } else {
    await AuthUser.create({
      name: ADMIN_NAME, email: ADMIN_EMAIL, password: hashedPassword,
      college: "UIET", role: "ADMIN", paymentStatus: "approved", teamName: "ADMIN_CORE", events: []
    });
  }

  // 2. Profile
  const existingProfile = await Profile.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (existingProfile) {
    await Profile.updateOne({ email: ADMIN_EMAIL.toLowerCase() }, { $set: { role: "admin" } });
  } else {
    await Profile.create({
      email: ADMIN_EMAIL.toLowerCase(), firstName: "Oscura", lastName: "Gamer",
      college: "UIET", role: "admin", username: "admin_oscura",
      onboardingCompleted: true, boarding: true, interests: [], registeredEvents: [], paidEvents: []
    });
  }

  console.log(`Setup complete for: ${ADMIN_EMAIL}`);
  await mongoose.disconnect();
}

main();
