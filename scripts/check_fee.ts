
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load environment variables
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://admin:admin123@cluster0.mongodb.net/roborumble?retryWrites=true&w=majority";

async function verify() {
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

        const events = await Event.find({
            $or: [
                { category: { $regex: /esport/i } },
                { title: { $regex: /esport/i } }
            ]
        });

        let output = "--- Verification Results ---\n";
        if (events.length === 0) {
            output += "No Esports events found.\n";
        } else {
            events.forEach(event => {
                output += `Event: ${event.title}\n`;
                output += `Category: ${event.category}\n`;
                output += `Fee: ${event.fees}\n`;
                output += "----------------------------\n";
            });
        }
        
        fs.writeFileSync("fee_check.txt", output);
        console.log("Verification complete. Results written to fee_check.txt");
        process.exit(0);
    } catch (error) {
        console.error("Verification failed:", error);
        fs.writeFileSync("fee_check.txt", `Error: ${error}`);
        process.exit(1);
    }
}

verify();
