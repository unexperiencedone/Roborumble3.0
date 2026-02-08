
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = require("dotenv").parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI in .env.local");
  process.exit(1);
}

// Minimal Profile Schema
const ProfileSchema = new mongoose.Schema({
  email: String,
  role: String,
  firstName: String,
  lastName: String,
});

const Profile = mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);

// Minimal AuthUser Schema
const AuthUserSchema = new mongoose.Schema({
  email: String,
  role: String,
  name: String,
});

const AuthUser = mongoose.models.AuthUser || mongoose.model("AuthUser", AuthUserSchema);

async function makeAdmin(email) {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Update Profile
    const profile = await Profile.findOne({ email });
    if (profile) {
      profile.role = "admin";
      await profile.save();
      console.log(`[Profile] Updated ${email} to admin.`);
    } else {
      console.log(`[Profile] User ${email} not found.`);
    }

    // Update AuthUser
    const authUser = await AuthUser.findOne({ email });
    if (authUser) {
      authUser.role = "admin";
      await authUser.save();
      console.log(`[AuthUser] Updated ${email} to admin.`);
    } else {
      console.log(`[AuthUser] User ${email} not found.`);
    }

    if (!profile && !authUser) {
        console.log("Available emails (Profile):");
        const profiles = await Profile.find({}, "email role");
        profiles.forEach(u => console.log(`- ${u.email} (${u.role || 'user'})`));
        
        console.log("Available emails (AuthUser):");
        const authUsers = await AuthUser.find({}, "email role");
        authUsers.forEach(u => console.log(`- ${u.email} (${u.role || 'user'})`));
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected");
  }
}

const email = process.argv[2];
if (!email) {
  console.log("Usage: node scripts/make-admin.js <email>");
  
  // List all users to help
  (async () => {
     try {
        await mongoose.connect(MONGODB_URI);
        const count = await Profile.countDocuments();
        if (count > 0) {
            console.log("\nCurrent Users in DB:");
            const users = await Profile.find({}, "email role firstName lastName").limit(10);
            users.forEach(u => console.log(`- ${u.email} [${u.role || 'user'}] (${u.firstName} ${u.lastName})`));
        } else {
            console.log("No users found in database.");
        }
     } catch(e) {
         console.error(e);
     } finally {
         await mongoose.disconnect();
     }
  })();
} else {
  makeAdmin(email);
}
