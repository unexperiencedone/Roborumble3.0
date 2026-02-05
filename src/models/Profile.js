import mongoose from "mongoose";

// Profile model for Clerk-authenticated users
// This is separate from the existing User model which handles old-style registrations
const ProfileSchema = new mongoose.Schema(
    {
        // Clerk Integration
        clerkId: { type: String, unique: true, sparse: true },
        email: { type: String, required: true },
        firstName: String,
        lastName: String,
        avatarUrl: String,

        // Profile Data
        username: { type: String, unique: true, sparse: true },
        bio: { type: String, maxlength: 500 },
        phone: String,
        college: String,
        course: String,

        // Role Management
        role: {
            type: String,
            enum: ["user", "admin", "superadmin"],
            default: "user",
        },

        // Interests for matching
        interests: [{ type: String }],

        // Team Relationships
        currentTeamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
        invitations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],

        // Status
        onboardingCompleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);
