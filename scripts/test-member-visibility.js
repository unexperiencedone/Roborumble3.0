
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

// Schemas
const ProfileSchema = new mongoose.Schema({ clerkId: String, email: String, firstName: String });
const TeamSchema = new mongoose.Schema({ 
    name: String, 
    leaderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' }, 
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Profile' }],
});
const RegistrationSchema = new mongoose.Schema({
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' }, // Dummy
  selectedMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Profile' }],
  paymentStatus: String,
  createdAt: { type: Date, default: Date.now }
});

const Profile = mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);
const Team = mongoose.models.Team || mongoose.model("Team", TeamSchema);
const Registration = mongoose.models.Registration || mongoose.model("Registration", RegistrationSchema);

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // 1. Create Data
    const leader = await Profile.create({ clerkId: "L_"+Date.now(), email: "leader@demo.com", firstName: "Leader" });
    const member = await Profile.create({ clerkId: "M_"+Date.now(), email: "member@demo.com", firstName: "Member" });

    const team = await Team.create({
        name: "Visibility Test Team",
        leaderId: leader._id,
        members: [leader._id, member._id] // Both are members
    });

    const reg = await Registration.create({
        teamId: team._id,
        paymentStatus: 'paid',
        selectedMembers: [leader._id, member._id]
    });

    console.log("Created Team:", team.name);
    console.log("Created Registration:", reg._id);

    // 2. Simulate API Logic for MEMBER
    console.log("\n--- SIMULATING API FOR MEMBER ---");
    const memberProfile = await Profile.findOne({ clerkId: member.clerkId });
    console.log("Member Profile Found:", memberProfile.firstName);

    // Find teams member is in
    const teams = await Team.find({ members: memberProfile._id });
    const teamIds = teams.map(t => t._id);
    console.log("Member is in teams:", teamIds);

    // Find registrations
    const foundRegs = await Registration.find({
        $or: [
            { teamId: { $in: teamIds } }, 
            { selectedMembers: memberProfile._id }
        ]
    });

    console.log(`Found ${foundRegs.length} registrations for Member.`);
    if (foundRegs.length > 0) {
        console.log("SUCCESS: Member can see the registration.");
    } else {
        console.log("FAILURE: Member cannot see the registration.");
    }

    // Cleanup
    await Registration.deleteOne({ _id: reg._id });
    await Team.deleteOne({ _id: team._id });
    await Profile.deleteOne({ _id: leader._id });
    await Profile.deleteOne({ _id: member._id });
    console.log("\nCleanup Complete");

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
