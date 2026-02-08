
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

// Define Schemas appropriately to allow population
const ProfileSchema = new mongoose.Schema({ fullName: String, email: String });
const TeamSchema = new mongoose.Schema({ name: String, leaderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' }, members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Profile' }] });
const EventSchema = new mongoose.Schema({ title: String });
const RegistrationSchema = new mongoose.Schema({
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  selectedMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Profile' }],
  paymentStatus: String,
  checkedIn: Boolean,
});

const Profile = mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);
const Team = mongoose.models.Team || mongoose.model("Team", TeamSchema);
const Event = mongoose.models.Event || mongoose.model("Event", EventSchema);
const Registration = mongoose.models.Registration || mongoose.model("Registration", RegistrationSchema);

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const regId = "69879c608c6506624dbe1ee3"; // The specific ID
    const reg = await Registration.findById(regId)
      .populate({
        path: 'teamId',
        populate: { path: 'members leaderId', model: 'Profile' }
      })
      .populate('selectedMembers')
      .populate('eventId');

    if (reg) {
      console.log("Writing to debug_reg.json");
      fs.writeFileSync("debug_reg.json", JSON.stringify({
          _id: reg._id,
          teamId: reg.teamId,
          selectedMembers: reg.selectedMembers,
          paymentStatus: reg.paymentStatus
      }, null, 2));
    } else {
      console.log("Registration not found");
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
