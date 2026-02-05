import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Event from "@/Models/Event";
import Profile from "@/Models/Profile";
import Registration from "@/Models/Registration";

// GET - List all events or get specific event
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get("slug");
        const eventId = searchParams.get("id");

        await connectDB();

        if (slug) {
            const event = await Event.findOne({ slug });
            if (!event) {
                return NextResponse.json({ message: "Event not found" }, { status: 404 });
            }

            // Get registration count
            const registrationCount = await Registration.countDocuments({
                eventId: event._id,
                paymentStatus: "paid",
            });

            return NextResponse.json({
                event,
                registrationCount,
                spotsLeft: event.maxRegistrations
                    ? event.maxRegistrations - registrationCount
                    : null,
            });
        }

        if (eventId) {
            const event = await Event.findById(eventId);
            return NextResponse.json({ event });
        }

        // List all live events
        const events = await Event.find({ isLive: true }).sort({ createdAt: -1 });

        // Get registration counts for each event
        const eventsWithCounts = await Promise.all(
            events.map(async (event) => {
                const count = await Registration.countDocuments({
                    eventId: event._id,
                    paymentStatus: "paid",
                });
                return {
                    ...event.toObject(),
                    registrationCount: count,
                    spotsLeft: event.maxRegistrations
                        ? event.maxRegistrations - count
                        : null,
                };
            })
        );

        return NextResponse.json({ events: eventsWithCounts });
    } catch (error) {
        console.error("Events GET error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

// POST - Create new event (admin/superadmin only)
export async function POST(req) {
    try {
        const body = await req.json();
        const {
            clerkId,
            title,
            description,
            fees,
            minTeamSize,
            maxTeamSize,
            maxRegistrations,
            registrationDeadline,
        } = body;

        if (!clerkId || !title) {
            return NextResponse.json(
                { message: "clerkId and title are required" },
                { status: 400 }
            );
        }

        await connectDB();

        // Check if user is admin/superadmin
        const profile = await Profile.findOne({ clerkId });
        if (!profile) {
            return NextResponse.json({ message: "Profile not found" }, { status: 404 });
        }

        if (!["admin", "superadmin"].includes(profile.role)) {
            return NextResponse.json(
                { message: "Only admins can create events" },
                { status: 403 }
            );
        }

        const newEvent = await Event.create({
            title,
            description: description || "",
            fees: fees || 0,
            minTeamSize: minTeamSize || 1,
            maxTeamSize: maxTeamSize || 4,
            maxRegistrations: maxRegistrations || null,
            registrationDeadline: registrationDeadline
                ? new Date(registrationDeadline)
                : null,
            isLive: true,
            createdBy: profile._id,
        });

        return NextResponse.json(
            { message: "Event created", event: newEvent },
            { status: 201 }
        );
    } catch (error) {
        console.error("Events POST error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
