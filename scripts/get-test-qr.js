
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

// Minimal Schema
const RegistrationSchema = new mongoose.Schema({
  paymentStatus: String,
  checkedIn: Boolean,
});
const Registration = mongoose.models.Registration || mongoose.model("Registration", RegistrationSchema);

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const reg = await Registration.findOne({ paymentStatus: { $in: ['paid', 'manual_verified'] } });
    
    if (reg) {
        const id = reg._id.toString();
        console.log("ID:" + id);
        console.log("Length:" + id.length);
    } else {
        console.log("No paid registrations found.");
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
