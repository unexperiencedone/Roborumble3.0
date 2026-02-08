
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs"); // Using bcryptjs as seen in package.json

const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = require("dotenv").parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

const MONGODB_URI = process.env.MONGODB_URI;

// Minimal AuthUser Schema
const AuthUserSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: String,
});

const AuthUser = mongoose.models.AuthUser || mongoose.model("AuthUser", AuthUserSchema);

async function setPassword(email, password) {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    let user = await AuthUser.findOne({ email });
    if (!user) {
      console.log(`AuthUser with email ${email} not found. Creating new admin user.`);
      user = new AuthUser({
        email,
        name: "Admin User",
        role: "ADMIN",
        college: "N/A", // Required field
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.role = "ADMIN"; // Ensure role is set
    await user.save();
    
    console.log(`Successfully updated password for ${email}`);

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected");
  }
}

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log("Usage: node scripts/set-admin-password.js <email> <password>");
} else {
  setPassword(email, password);
}
