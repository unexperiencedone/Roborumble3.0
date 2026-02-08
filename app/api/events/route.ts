import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Event from "@/app/models/Event";

// GET - Fetch all events (public)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get("category");
        const liveOnly = searchParams.get("live") !== "false";

        await connectDB();

        const filter: Record<string, unknown> = {};
        if (liveOnly) filter.isLive = true;
        if (category) filter.category = category;

        const events = await Event.find(filter)
            .select("-createdBy -__v")
            .sort({ category: 1, title: 1 });

        const eventsWithId = events.map((event: any) => ({
            ...event.toObject(),
            _id: event._id.toString(), // Expose _id as string just in case
        }));

        return NextResponse.json({ events: eventsWithId });
    } catch (error) {
        console.error("Fetch events error:", error);
        return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
    }
}
