
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

// Define Schemas matches what we saw in other files
const ProfileSchema = new mongoose.Schema({ 
    clerkId: String,
    email: String,
    firstName: String, 
    lastName: String,
    fullName: String,
});

const TeamSchema = new mongoose.Schema({ 
    name: String, 
    leaderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' }, 
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Profile' }],
});

const RegistrationSchema = new mongoose.Schema({
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' }, // Assuming Event exists/is simple
  selectedMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Profile' }],
  paymentStatus: String,
  amountExpected: Number,
  createdAt: { type: Date, default: Date.now }
});

const Profile = mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);
const Team = mongoose.models.Team || mongoose.model("Team", TeamSchema);
const Registration = mongoose.models.Registration || mongoose.model("Registration", RegistrationSchema);

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const clerkId = "user_39HisLkksQ83gRmFmlbOpgfPrdf"; // From debug_reg.json
    console.log("Searching for profile with clerkId:", clerkId);

    const profile = await Profile.findOne({ clerkId });
    if (!profile) {
        console.log("Profile not found!");
        return;
    }
    console.log("Profile Found:", profile._id, profile.email);

    // 1. Find Teams
    const teams = await Team.find({ members: profile._id });
    const teamIds = teams.map(t => t._id);
    console.log("User is member of teams:", teamIds.length, teamIds);

    // 2. Find Registrations
    const query = {
        $or: [
            { teamId: { $in: teamIds } }, 
            { selectedMembers: profile._id } 
        ]
    };
    console.log("Query:", JSON.stringify(query));

    const registrations = await Registration.find(query);
    console.log(`Found ${registrations.length} registrations`);
    
    registrations.forEach(r => {
        console.log(`- Reg ID: ${r._id}, Status: ${r.paymentStatus}, TeamId: ${r.teamId}, SelectedMembers: ${r.selectedMembers}`);
    });

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
