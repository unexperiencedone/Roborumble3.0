import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Team from "@/Models/Team";
import Profile from "@/Models/Profile";

// POST - Accept or reject an invitation/join request
export async function POST(req) {
    try {
        const body = await req.json();
        const { clerkId, action, teamId, userId } = body;
        // action: "accept_invitation" | "reject_invitation" | "accept_request" | "reject_request"

        if (!clerkId || !action) {
            return NextResponse.json(
                { message: "clerkId and action are required" },
                { status: 400 }
            );
        }

        await connectDB();

        const profile = await Profile.findOne({ clerkId });
        if (!profile) {
            return NextResponse.json({ message: "Profile not found" }, { status: 404 });
        }

        // Handle user accepting/rejecting an invitation
        if (action === "accept_invitation" || action === "reject_invitation") {
            if (!teamId) {
                return NextResponse.json({ message: "teamId is required" }, { status: 400 });
            }

            // Check if invitation exists
            if (!profile.invitations.includes(teamId)) {
                return NextResponse.json({ message: "No invitation from this team" }, { status: 400 });
            }

            // Remove invitation from profile
            await Profile.findByIdAndUpdate(profile._id, {
                $pull: { invitations: teamId }
            });

            if (action === "accept_invitation") {
                const team = await Team.findById(teamId);
                if (!team) {
                    return NextResponse.json({ message: "Team no longer exists" }, { status: 404 });
                }

                if (team.isLocked) {
                    return NextResponse.json({ message: "Team is locked" }, { status: 400 });
                }

                // Add user to team
                await Team.findByIdAndUpdate(teamId, {
                    $push: { members: profile._id }
                });

                // Update user's currentTeamId
                await Profile.findByIdAndUpdate(profile._id, {
                    currentTeamId: teamId
                });

                return NextResponse.json({ message: "You have joined the team!" });
            }

            return NextResponse.json({ message: "Invitation rejected" });
        }

        // Handle leader accepting/rejecting a join request
        if (action === "accept_request" || action === "reject_request") {
            if (!userId) {
                return NextResponse.json({ message: "userId is required" }, { status: 400 });
            }

            // Must be a team leader
            const team = await Team.findOne({ leaderId: profile._id });
            if (!team) {
                return NextResponse.json({ message: "You are not a team leader" }, { status: 403 });
            }

            // Check if join request exists
            if (!team.joinRequests.includes(userId)) {
                return NextResponse.json({ message: "No join request from this user" }, { status: 400 });
            }

            // Remove from joinRequests
            await Team.findByIdAndUpdate(team._id, {
                $pull: { joinRequests: userId }
            });

            if (action === "accept_request") {
                if (team.isLocked) {
                    return NextResponse.json({ message: "Team is locked" }, { status: 400 });
                }

                // Add user to team
                await Team.findByIdAndUpdate(team._id, {
                    $push: { members: userId }
                });

                // Update user's currentTeamId
                await Profile.findByIdAndUpdate(userId, {
                    currentTeamId: team._id
                });

                return NextResponse.json({ message: "User added to team!" });
            }

            return NextResponse.json({ message: "Join request rejected" });
        }

        return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("Respond error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
