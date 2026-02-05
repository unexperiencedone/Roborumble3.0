import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Team from "@/Models/Team";
import Profile from "@/Models/Profile";

// POST - Invite a user to team
export async function POST(req) {
    try {
        const body = await req.json();
        const { clerkId, inviteEmail } = body;

        if (!clerkId || !inviteEmail) {
            return NextResponse.json(
                { message: "clerkId and inviteEmail are required" },
                { status: 400 }
            );
        }

        await connectDB();

        // Get inviter's profile
        const inviterProfile = await Profile.findOne({ clerkId });
        if (!inviterProfile) {
            return NextResponse.json({ message: "Profile not found" }, { status: 404 });
        }

        // Get inviter's team (must be leader)
        const team = await Team.findOne({ leaderId: inviterProfile._id });
        if (!team) {
            return NextResponse.json(
                { message: "You must be a team leader to invite members" },
                { status: 403 }
            );
        }

        if (team.isLocked) {
            return NextResponse.json(
                { message: "Team is locked. Cannot add new members after payment." },
                { status: 400 }
            );
        }

        // Find the user to invite
        const inviteeProfile = await Profile.findOne({ email: inviteEmail });
        if (!inviteeProfile) {
            return NextResponse.json(
                { message: "User not found with this email" },
                { status: 404 }
            );
        }

        // Check if user is already in a team
        const userInTeam = await Team.findOne({
            $or: [
                { leaderId: inviteeProfile._id },
                { members: inviteeProfile._id }
            ]
        });

        if (userInTeam) {
            return NextResponse.json(
                { message: "User is already in a team" },
                { status: 400 }
            );
        }

        // Check if already invited
        if (inviteeProfile.invitations.includes(team._id)) {
            return NextResponse.json(
                { message: "User already has a pending invitation from your team" },
                { status: 400 }
            );
        }

        // Add invitation to user's profile
        await Profile.findByIdAndUpdate(inviteeProfile._id, {
            $push: { invitations: team._id }
        });

        return NextResponse.json(
            { message: `Invitation sent to ${inviteEmail}` },
            { status: 200 }
        );
    } catch (error) {
        console.error("Invite error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
