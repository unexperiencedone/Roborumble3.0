import mongoose from "mongoose";
import * as dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const ProfileSchema = new mongoose.Schema({
    email: String,
    firstName: String,
    lastName: String,
    phone: String,
}, { collection: 'profiles' });

const AuthUserSchema = new mongoose.Schema({
    email: String,
    name: String,
    phone: String,
}, { collection: 'authusers' });

async function exportUsers() {
    console.log("Connecting to MongoDB...");
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error("MONGODB_URI is not set!");
        process.exit(1);
    }

    try {
        await mongoose.connect(uri);
        console.log("Connected to MongoDB.");

        const Profile = mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);
        const AuthUser = mongoose.models.AuthUser || mongoose.model("AuthUser", AuthUserSchema);
        
        const profiles = await Profile.find({}, 'email firstName lastName phone').lean();
        const authUsers = await AuthUser.find({}, 'email name phone').lean();

        let csvContent = "Name,Email,Phone,Source\n";

        for (const p of profiles) {
            const name = `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Unknown';
            csvContent += `"${name}","${p.email || ''}","${p.phone || ''}","Profile"\n`;
        }

        for (const a of authUsers) {
            csvContent += `"${a.name || 'Unknown'}","${a.email || ''}","${a.phone || ''}","AuthUser"\n`;
        }

        fs.writeFileSync('users_export.csv', csvContent);
        console.log(`Exported ${profiles.length + authUsers.length} users to users_export.csv`);

    } catch (e) {
        console.error("Error exporting users:", e);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    }
}

exportUsers();
