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

// Define Schemas
const ProfileSchema = new mongoose.Schema({
  clerkId: String,
  email: String,
  firstName: String,
  lastName: String,
  fullName: String,
  username: String,
});

const TeamSchema = new mongoose.Schema({
  name: String,
  leaderId: { type: mongoose.Schema.Types.ObjectId, ref: "Profile" },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "Profile" }],
  isLocked: Boolean,
});

const EventSchema = new mongoose.Schema({ title: String, fees: Number });

const RegistrationSchema = new mongoose.Schema({
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
  selectedMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Profile" }],
  paymentStatus: String,
  checkedIn: Boolean,
});

const Profile =
  mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);
const Team = mongoose.models.Team || mongoose.model("Team", TeamSchema);
const Event = mongoose.models.Event || mongoose.model("Event", EventSchema);
const Registration =
  mongoose.models.Registration ||
  mongoose.model("Registration", RegistrationSchema);

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // 1. Create Dummy Profiles
    const leader = await Profile.create({
      clerkId: "test_leader_" + Date.now(),
      email: "leader@test.com",
      firstName: "Captain",
      lastName: "Rogers",
      fullName: "Captain Rogers",
      username: "cap_rogers_" + Date.now(),
    });

    const member1 = await Profile.create({
      clerkId: "test_member1_" + Date.now(),
      email: "tony@test.com",
      firstName: "Tony",
      lastName: "Stark",
      fullName: "Tony Stark",
      username: "ironman_" + Date.now(),
    });

    const member2 = await Profile.create({
      clerkId: "test_member2_" + Date.now(),
      email: "bruce@test.com",
      firstName: "Bruce",
      lastName: "Banner",
      fullName: "Bruce Banner",
      username: "hulk_" + Date.now(),
    });

    console.log("Profiles created.");

    // 2. Create Team
    const team = await Team.create({
      name: "Avengers Assemble " + Date.now(),
      leaderId: leader._id,
      members: [leader._id, member1._id, member2._id],
      isLocked: true,
    });
    console.log("Team created:", team.name);

    // 3. Find an Event (or create one)
    let event = await Event.findOne();
    if (!event) {
      event = await Event.create({ title: "Robo War", fees: 1000 });
    }

    // 4. Create Registration
    const registration = await Registration.create({
      teamId: team._id,
      eventId: event._id,
      selectedMembers: [leader._id, member1._id, member2._id], // Full Squad
      paymentStatus: "paid",
      checkedIn: false,
    });

    console.log("\n--- TEST DATA GENERATED ---");
    console.log("Team Name:", team.name);
    console.log("TEST REGISTRATION ID:", registration._id.toString());
    console.log("---------------------------\n");

    // Write ID to file for easy reading
    fs.writeFileSync("test_team_id.txt", registration._id.toString());
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
