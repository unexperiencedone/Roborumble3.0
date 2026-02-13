import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITeam extends Document {
    name: string;
    leaderId: mongoose.Types.ObjectId;
    members: mongoose.Types.ObjectId[];
    joinRequests: mongoose.Types.ObjectId[];
    isLocked: boolean;
    maxMembers: number;
    isEsports: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const TeamSchema = new Schema<ITeam>(
    {
        name: { type: String, required: true, unique: true },

        // Leader is the creator of the team
        leaderId: {
            type: Schema.Types.ObjectId,
            ref: "Profile",
            required: true,
        },

        // Members (includes leader)
        members: [
            {
                type: Schema.Types.ObjectId,
                ref: "Profile",
            },
        ],

        // Users who requested to join
        joinRequests: [
            {
                type: Schema.Types.ObjectId,
                ref: "Profile",
            },
        ],

        // Lock team after payment initiated (prevent member changes)
        isLocked: { type: Boolean, default: false },

        // Team pool size limit
        maxMembers: { type: Number, default: 50 },

        // Esports flag
        isEsports: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Strategic indexes for fast lookups
TeamSchema.index({ leaderId: 1 });
TeamSchema.index({ members: 1 });  // Array index for "find teams containing user"
TeamSchema.index({ leaderId: 1, members: 1 });  // Compound for team queries

// Helper to get models safely in hooks (prevents production crashes if not registered)
const getModels = () => ({
    Profile: mongoose.models.Profile || mongoose.model("Profile"),
    Registration: mongoose.models.Registration || mongoose.model("Registration"),
    Cart: mongoose.models.Cart || mongoose.model("Cart")
});

// Cascading delete hook - cleans up related data when team is deleted
TeamSchema.pre('deleteOne', { document: true, query: false }, async function () {
    const team = this as unknown as ITeam;
    const { Profile, Registration, Cart } = getModels();

    // 1. Clear team ID from all member profiles (leader + members)
    const allMemberIds = [team.leaderId, ...team.members];
    const unsetField = team.isEsports ? "esportsTeamId" : "currentTeamId";
    
    await Profile.updateMany(
        { _id: { $in: allMemberIds } },
        { $unset: { [unsetField]: 1 } }
    );

    // 2. Delete all registrations for this team
    await Registration.deleteMany({ teamId: team._id });

    // 3. Delete cart associated with this team
    await Cart.deleteMany({ teamId: team._id });
});

// Also handle findOneAndDelete
TeamSchema.pre('findOneAndDelete', async function () {
    const team = await this.model.findOne(this.getQuery());
    if (!team) return;

    const { Profile, Registration, Cart } = getModels();

    const allMemberIds = [team.leaderId, ...team.members];
    const unsetField = team.isEsports ? "esportsTeamId" : "currentTeamId";

    await Profile.updateMany(
        { _id: { $in: allMemberIds } },
        { $unset: { [unsetField]: 1 } }
    );
    await Registration.deleteMany({ teamId: team._id });
    await Cart.deleteMany({ teamId: team._id });
});

const Team: Model<ITeam> =
    mongoose.models.Team || mongoose.model<ITeam>("Team", TeamSchema);

export default Team;
