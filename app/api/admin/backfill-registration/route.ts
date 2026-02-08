import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Team from "@/app/models/Team";
import Event from "@/app/models/Event";
import Registration from "@/app/models/Registration";

export async function POST(req: Request) {
    try {
        const { teamName } = await req.json();

        if (!teamName) {
            return NextResponse.json({ message: "Team name required" }, { status: 400 });
        }

        await connectDB();

        const team = await Team.findOne({ name: teamName });
        if (!team) {
            return NextResponse.json({ message: "Team not found" }, { status: 404 });
        }

        // Find default event (active one)
        const event = await Event.findOne({ isLive: true });
        if (!event) {
            return NextResponse.json({ message: "No active event found" }, { status: 404 });
        }

        // Check if registration exists
        const existing = await Registration.findOne({ teamId: team._id, eventId: event._id });
        if (existing) {
             existing.paymentStatus = "manual_verified";
             await existing.save();
             return NextResponse.json({ message: "Updated existing registration to verified", registration: existing });
        }

        // Create new registration
        const newReg = await Registration.create({
            teamId: team._id,
            eventId: event._id,
            paymentStatus: "manual_verified",
            currency: "INR",
            amountExpected: event.fees,
            amountPaid: event.fees,
            selectedMembers: team.members, 
            createdAt: new Date(),
            updatedAt: new Date()
        });

        return NextResponse.json({ message: "Created backfill registration", registration: newReg });

    } catch (error) {
        console.error("Backfill error:", error);
        return NextResponse.json({ message: "Error" }, { status: 500 });
    }
}
