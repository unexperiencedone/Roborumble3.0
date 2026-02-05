import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Registration from "@/Models/Registration";
import Profile from "@/Models/Profile";
import Team from "@/Models/Team"; // Ensure Team is registered
import Event from "@/Models/Event"; // Ensure Event is registered

export async function GET(req) {
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
    const query = {};
    if (eventId && eventId !== "all") query.eventId = eventId;
    if (status && status !== "all") query.paymentStatus = status;

    const registrations = await Registration.find(query)
      .populate({
        path: "teamId",
        populate: { path: "leaderId", select: "username email phone" }
      })
      .populate("eventId", "title fees")
      .sort({ createdAt: -1 });

    return NextResponse.json({ registrations });
  } catch (error) {
    console.error("Admin Registrations GET Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}