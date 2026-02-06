/**
 * Script to sync Clerk users to MongoDB
 * Run with: npx tsx scripts/sync-clerk-users.ts
 */

import "dotenv/config";
import { createClerkClient } from "@clerk/backend";
import mongoose from "mongoose";

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI!;

// Profile Schema (inline to avoid import issues)
const ProfileSchema = new mongoose.Schema(
    {
        clerkId: { type: String, unique: true, sparse: true },
        email: { type: String, required: true },
        firstName: String,
        lastName: String,
        avatarUrl: String,
        username: { type: String, unique: true, sparse: true },
        bio: { type: String, maxlength: 500 },
        phone: String,
        college: String,
        course: String,
        role: {
            type: String,
            enum: ["user", "admin", "superadmin"],
            default: "user",
        },
        interests: [{ type: String }],
        currentTeamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
        invitations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
        registeredEvents: [{ type: String }],
        paidEvents: [{ type: String }],
        onboardingCompleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const Profile = mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);

async function syncClerkUsers() {
    console.log("🔄 Starting Clerk → MongoDB sync...\n");

    // Initialize Clerk
    const clerkClient = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY!,
    });

    // Connect to MongoDB
    console.log("📦 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Fetch all users from Clerk
    console.log("👥 Fetching users from Clerk...");
    const clerkUsers = await clerkClient.users.getUserList({ limit: 100 });
    console.log(`✅ Found ${clerkUsers.data.length} users in Clerk\n`);

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const user of clerkUsers.data) {
        const email = user.emailAddresses?.[0]?.emailAddress || "";
        const clerkId = user.id;

        console.log(`Processing: ${user.firstName} ${user.lastName} (${email})`);

        try {
            // Check if profile exists
            const existing = await Profile.findOne({ clerkId });

            if (existing) {
                // Update existing profile
                await Profile.findOneAndUpdate(
                    { clerkId },
                    {
                        email,
                        firstName: user.firstName || "",
                        lastName: user.lastName || "",
                        avatarUrl: user.imageUrl || "",
                        username: user.username || existing.username,
                    }
                );
                console.log(`   ↻ Updated existing profile`);
                updated++;
            } else {
                // Create new profile
                await Profile.create({
                    clerkId,
                    email,
                    firstName: user.firstName || "",
                    lastName: user.lastName || "",
                    avatarUrl: user.imageUrl || "",
                    username: user.username || "",
                    role: "user",
                    interests: [],
                    onboardingCompleted: false,
                });
                console.log(`   ✓ Created new profile`);
                created++;
            }
        } catch (error: unknown) {
            const err = error as Error;
            console.log(`   ✗ Error: ${err.message}`);
            skipped++;
        }
    }

    console.log("\n" + "=".repeat(40));
    console.log("📊 Sync Complete!");
    console.log(`   Created: ${created}`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Skipped: ${skipped}`);
    console.log("=".repeat(40));

    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
}

syncClerkUsers().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
