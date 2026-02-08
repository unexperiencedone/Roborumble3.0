
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = require("dotenv").parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

const MONGODB_URI = process.env.MONGODB_URI;

const ProfileSchema = new mongoose.Schema({
  email: String,
  role: String,
  firstName: String,
  lastName: String,
});
const Profile = mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);

const AuthUserSchema = new mongoose.Schema({
  email: String,
  role: String,
  name: String,
});
const AuthUser = mongoose.models.AuthUser || mongoose.model("AuthUser", AuthUserSchema);

async function checkUser(email) {
  try {
    await mongoose.connect(MONGODB_URI);
    
    const profile = await Profile.findOne({ email });
    const authUser = await AuthUser.findOne({ email });

    console.log("--- User Check ---");
    console.log(`Email: ${email}`);
    
    if (profile) {
        console.log(`Profile Role: ${profile.role}`);
        console.log(`Profile Name: ${profile.firstName} ${profile.lastName}`);
    } else {
        console.log("Profile: Not Found");
    }

    if (authUser) {
        console.log(`AuthUser Role: ${authUser.role}`);
        console.log(`AuthUser Name: ${authUser.name}`);
    } else {
        console.log("AuthUser: Not Found");
    }
    console.log("------------------");

  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
}

checkUser("kumaraakshant2005@gmail.com");
