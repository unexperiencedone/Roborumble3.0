import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import Registration from "@/Models/Registration";
import Team from "@/Models/Team";
import Event from "@/Models/Event";
import Profile from "@/Models/Profile";

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        // 1. Get User Profile to find their ID
        const profile = await Profile.findOne({ clerkId: userId });
        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        // 2. Find teams where user is a member or leader
        const myTeams = await Team.find({
            $or: [{ leaderId: profile._id }, { members: profile._id }]
        }).select('_id');

        const teamIds = myTeams.map(t => t._id);

        if (teamIds.length === 0) {
            return NextResponse.json({ registrations: [] });
        }

        // 3. Find registrations for these teams
        const registrations = await Registration.find({ teamId: { $in: teamIds } })
            .populate('eventId', 'title fees registrationDeadline')
            .populate('teamId', 'name leaderId')
            .sort({ createdAt: -1 });

        return NextResponse.json({ registrations });
    } catch (error) {
        console.error("Fetch User Registrations Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
