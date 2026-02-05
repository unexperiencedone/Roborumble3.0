import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Registration from "@/Models/Registration";
import Profile from "@/Models/Profile";
import Team from "@/Models/Team";

export async function POST(req) {
    try {
        const body = await req.json();
        const { clerkId, registrationId, action, notes } = body;
        // action: "verify" | "reject"

        if (!clerkId || !registrationId || !action) {
            return NextResponse.json({ message: "Invalid request" }, { status: 400 });
        }

        await connectDB();

        // Verify Admin Role
        const adminProfile = await Profile.findOne({ clerkId });
        if (!adminProfile || !["admin", "superadmin"].includes(adminProfile.role)) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const registration = await Registration.findById(registrationId);
        if (!registration) {
            return NextResponse.json({ message: "Registration not found" }, { status: 404 });
        }

        if (action === "verify") {
            await Registration.findByIdAndUpdate(registrationId, {
                paymentStatus: "manual_verified",
                manualVerification: {
                    verifiedBy: adminProfile._id,
                    verifiedAt: new Date(),
                    notes: notes || "Manually verified by admin",
                },
            });

            // Lock the team associated with this registration
            await Team.findByIdAndUpdate(registration.teamId, { isLocked: true });

            return NextResponse.json({ message: "Registration verified manually" });
        }

        if (action === "reject") {
            await Registration.findByIdAndUpdate(registrationId, {
                paymentStatus: "failed",
                manualVerification: {
                    verifiedBy: adminProfile._id,
                    verifiedAt: new Date(),
                    notes: notes || "Rejected by admin",
                },
            });
            return NextResponse.json({ message: "Registration marked as failed" });
        }

        return NextResponse.json({ message: "Invalid action" }, { status: 400 });

    } catch (error) {
        console.error("Admin Verify Payment Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
