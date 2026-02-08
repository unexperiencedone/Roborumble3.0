
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

const TeamSchema = new mongoose.Schema({ name: String });
const Team = mongoose.models.Team || mongoose.model("Team", TeamSchema);

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    // Get the ID from the previous file
    const idPath = path.resolve(process.cwd(), "test_team_id.txt");
    if (!fs.existsSync(idPath)) return console.log("No test team created yet.");
    
    const regId = fs.readFileSync(idPath, 'utf8').trim();
    
    // But wait, the file contains the Registration ID, not the Team ID. 
    // And actually, the problem is that create-test-team.js stored the REGISTRATION ID.
    // So the teamID is stored in the registration.
    
    const RegistrationSchema = new mongoose.Schema({
      teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }
    });
    const Registration = mongoose.models.Registration || mongoose.model("Registration", RegistrationSchema);
    
    const reg = await Registration.findById(regId).populate('teamId');
    if (!reg) return console.log("Registration not found");
    
    const team = reg.teamId;
    if (!team) return console.log("Team not found");
    
    console.log("Current Name:", team.name);
    
    // Try to set it to just "Avengers Assemble"
    try {
        team.name = "Avengers Assemble";
        await team.save();
        console.log("Updated Name: Avengers Assemble");
    } catch (e) {
        if (e.code === 11000) { // Duplicate key
            team.name = "Avengers Assemble Test";
            await team.save();
            console.log("Updated Name: Avengers Assemble Test");
        } else {
            console.error(e);
        }
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
