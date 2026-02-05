import mongoose from "mongoose";

const TeamSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },

        // Leader is the creator of the team
        leaderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Profile",
            required: true
        },

        // Members (includes leader)
        members: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Profile"
        }],

        // Users who requested to join
        joinRequests: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Profile"
        }],

        // Lock team after payment initiated (prevent member changes)
        isLocked: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.models.Team || mongoose.model("Team", TeamSchema);
