import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import connectDB from "@/lib/db";
import Profile from "@/Models/Profile";
import Team from "@/Models/Team";
import Event from "@/Models/Event";
import Registration from "@/Models/Registration";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST - Create Razorpay order for event registration
export async function POST(req) {
    try {
        const body = await req.json();
        const { clerkId, eventId } = body;

        if (!clerkId || !eventId) {
            return NextResponse.json(
                { message: "clerkId and eventId are required" },
                { status: 400 }
            );
        }

        await connectDB();

        // Get user profile
        const profile = await Profile.findOne({ clerkId });
        if (!profile) {
            return NextResponse.json({ message: "Profile not found" }, { status: 404 });
        }

        // Get user's team (must be leader)
        const team = await Team.findOne({ leaderId: profile._id });
        if (!team) {
            return NextResponse.json(
                { message: "You must be a team leader to register for events" },
                { status: 403 }
            );
        }

        // Get event
        const event = await Event.findById(eventId);
        if (!event) {
            return NextResponse.json({ message: "Event not found" }, { status: 404 });
        }

        if (!event.isLive) {
            return NextResponse.json(
                { message: "Event registration is closed" },
                { status: 400 }
            );
        }

        // Check registration deadline
        if (event.registrationDeadline && new Date() > event.registrationDeadline) {
            return NextResponse.json(
                { message: "Registration deadline has passed" },
                { status: 400 }
            );
        }

        // Check team size
        if (team.members.length < event.minTeamSize) {
            return NextResponse.json(
                { message: `Minimum team size is ${event.minTeamSize}` },
                { status: 400 }
            );
        }

        if (team.members.length > event.maxTeamSize) {
            return NextResponse.json(
                { message: `Maximum team size is ${event.maxTeamSize}` },
                { status: 400 }
            );
        }

        // Check if already registered
        const existingReg = await Registration.findOne({
            teamId: team._id,
            eventId: event._id,
        });

        if (existingReg) {
            if (existingReg.paymentStatus === "paid") {
                return NextResponse.json(
                    { message: "Already registered for this event" },
                    { status: 400 }
                );
            }
            // If pending/failed, allow retry
        }

        // Check max registrations
        if (event.maxRegistrations) {
            const paidCount = await Registration.countDocuments({
                eventId: event._id,
                paymentStatus: "paid",
            });
            if (paidCount >= event.maxRegistrations) {
                return NextResponse.json(
                    { message: "Event is fully booked" },
                    { status: 400 }
                );
            }
        }

        // Handle free events
        if (event.fees === 0) {
            const registration = await Registration.findOneAndUpdate(
                { teamId: team._id, eventId: event._id },
                {
                    teamId: team._id,
                    eventId: event._id,
                    paymentStatus: "paid",
                    amountExpected: 0,
                    amountPaid: 0,
                },
                { upsert: true, new: true }
            );

            // Lock team
            await Team.findByIdAndUpdate(team._id, { isLocked: true });

            return NextResponse.json({
                message: "Registered successfully (free event)",
                registration,
                isFree: true,
            });
        }

        // Create Razorpay order for paid events
        const amountInPaise = event.fees * 100; // Razorpay expects paise

        const order = await razorpay.orders.create({
            amount: amountInPaise,
            currency: "INR",
            receipt: `reg_${team._id}_${event._id}`,
            notes: {
                teamId: team._id.toString(),
                eventId: event._id.toString(),
                teamName: team.name,
                eventTitle: event.title,
            },
        });

        // Create/Update registration with pending status
        const registration = await Registration.findOneAndUpdate(
            { teamId: team._id, eventId: event._id },
            {
                teamId: team._id,
                eventId: event._id,
                paymentStatus: "initiated",
                razorpayOrderId: order.id,
                amountExpected: event.fees,
                $push: {
                    paymentAttempts: {
                        attemptedAt: new Date(),
                        razorpayOrderId: order.id,
                        status: "initiated",
                    },
                },
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({
            orderId: order.id,
            amount: amountInPaise,
            currency: "INR",
            keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            registrationId: registration._id,
            teamName: team.name,
            eventTitle: event.title,
        });
    } catch (error) {
        console.error("Create order error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
