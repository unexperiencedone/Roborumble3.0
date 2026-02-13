import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("Please define the MONGODB_URI environment variable inside .env.local");
    process.exit(1);
}

async function exportRegistrations() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI!);
        console.log("Connected successfully.");

        const db = mongoose.connection.db;

        console.log("Fetching supporting data...");
        const events = await db.collection("events").find().toArray();
        const profiles = await db.collection("profiles").find().toArray();
        const teams = await db.collection("teams").find().toArray();

        const eventMap = new Map(events.map(e => [e._id.toString(), e]));
        const profileMap = new Map(profiles.map(p => [p._id.toString(), p]));
        const teamMap = new Map(teams.map(t => [t._id.toString(), t]));

        console.log("Fetching registrations...");
        const registrations = await db.collection("registrations").find().toArray();
        console.log(`Found ${registrations.length} registrations.`);

        let output = "ROBO RUMBLE 3.0 REGISTRATIONS EXPORT\n";
        output += "====================================\n\n";

        for (const reg of registrations) {
            const eventId = reg.eventId?.toString();
            const event = eventMap.get(eventId);
            const denorm = reg._denormalized || {};

            const teamId = reg.teamId?.toString();
            const team = teamMap.get(teamId);

            const eventTitle = event?.title || denorm.eventTitle || "Unknown Event";
            const teamName = team?.name || denorm.teamName || "Individual/No Team";
            
            // Selected Members
            const memberDetails = (reg.selectedMembers || [])
                .map((mId: any) => {
                    const p = profileMap.get(mId.toString());
                    if (!p) return `Unknown (${mId})`;
                    const name = `${p.firstName || ""} ${p.lastName || ""}`.trim() || p.username || "N/A";
                    return `${name} (${p.email})`;
                })
                .join(", ");

            const status = reg.paymentStatus || "N/A";
            const date = reg.createdAt ? new Date(reg.createdAt).toLocaleString() : "N/A";

            output += `Event:   ${eventTitle.padEnd(30)}\n`;
            output += `Team:    ${teamName.padEnd(30)}\n`;
            output += `Members: ${memberDetails || "None"}\n`;
            output += `Status:  ${status.toUpperCase()}\n`;
            output += `Created: ${date}\n`;
            output += `ID:      ${reg._id}\n`;
            output += "------------------------------------\n\n";
        }

        const fileName = "registrations_export.txt";
        fs.writeFileSync(fileName, output);
        console.log(`Export completed! Data saved to ${fileName}`);

    } catch (error) {
        console.error("Export Error:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    }
}

exportRegistrations();
