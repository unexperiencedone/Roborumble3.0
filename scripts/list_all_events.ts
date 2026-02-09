
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load environment variables
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://admin:admin123@cluster0.mongodb.net/roborumble?retryWrites=true&w=majority";

async function listEvents() {
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

        const events = await Event.find({});

        let output = "--- All Events ---\n";
        if (events.length === 0) {
            output += "No events found in database.\n";
        } else {
            events.forEach(event => {
                output += `ID: ${event.eventId}\n`;
                output += `Title: ${event.title}\n`;
                output += `Category: ${event.category}\n`;
                output += `Fee: ${event.fees}\n`;
                output += "----------------------------\n";
            });
        }
        
        fs.writeFileSync("all_events.txt", output);
        console.log("Listing complete. Results written to all_events.txt");
        process.exit(0);
    } catch (error) {
        console.error("Listing failed:", error);
        fs.writeFileSync("all_events.txt", `Error: ${error}`);
        process.exit(1);
    }
}

listEvents();
