import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Registration from "@/app/models/Registration";
import Profile from "@/app/models/Profile";
import Team from "@/app/models/Team";
import Event from "@/app/models/Event";

export const dynamic = "force-dynamic";

// Force import to register models
void Team;
void Event;

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const clerkId = searchParams.get("clerkId");
        const eventId = searchParams.get("eventId");
        const status = searchParams.get("status");

        if (!clerkId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        // Verify Admin Role
        const profile = await Profile.findOne({ clerkId });
        if (!profile || !["admin", "superadmin"].includes(profile.role)) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        // Build Query
        const query: Record<string, unknown> = {};
        if (eventId && eventId !== "all") query.eventId = eventId;
        if (status && status !== "all") query.paymentStatus = status;

        const registrations = await Registration.find(query)
            .populate({
                path: "teamId",
                populate: { path: "leaderId", select: "username email phone" },
            })
            .populate("eventId", "title fees")
            .sort({ createdAt: -1 });

        return NextResponse.json({ registrations });
    } catch (error) {
        console.error("Admin Registrations GET Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
