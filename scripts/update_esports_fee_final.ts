
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load environment variables
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://admin:admin123@cluster0.mongodb.net/roborumble?retryWrites=true&w=majority";

async function updateFee() {
    try {
        const mongoose = (await import("mongoose")).default;
        
        if (!mongoose.connection.readyState) {
            await mongoose.connect(MONGODB_URI);
        }

        const EventSchema = new mongoose.Schema({
            eventId: String,
            title: String,
            category: String,
            fees: Number,
        }, { strict: false });

        const Event = mongoose.models.Event || mongoose.model("Event", EventSchema);

        const event = await Event.findOne({ eventId: "e-sports" });

        if (!event) {
            console.error("❌ Event 'e-sports' not found!");
            process.exit(1);
        }

        console.log(`Found event: ${event.title}`);
        console.log(`Old Fee: ${event.fees}`);

        event.fees = 250;
        await event.save();

        console.log(`✅ New Fee: ${event.fees}`);
        
        // Write verification to file for the agent to read
        fs.writeFileSync("fee_update_result.txt", `Updated ${event.title} fee to ${event.fees}`);

        process.exit(0);
    } catch (error) {
        console.error("Update failed:", error);
        process.exit(1);
    }
}

updateFee();
