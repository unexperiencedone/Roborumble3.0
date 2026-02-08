import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Registration from "@/app/models/Registration";
import Profile from "@/app/models/Profile"; // Still used for logging who verified, if adaptable
import Team from "@/app/models/Team";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import AuthUser from "@/app/models/AuthUser";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { registrationId, action, notes } = body;
        // action: "verify" | "verify_manual" | "reject"

        if (!registrationId || !action) {
            return NextResponse.json({ message: "Invalid request" }, { status: 400 });
        }

        await connectDB();
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        let adminId;
        try {
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
            if (decoded.role !== "ADMIN") {
                return NextResponse.json({ message: "Forbidden" }, { status: 403 });
            }
            adminId = decoded.userId;
        } catch (err) {
            return NextResponse.json({ message: "Invalid session" }, { status: 401 });
        }

        const registration = await Registration.findById(registrationId);
        if (!registration) {
            return NextResponse.json({ message: "Registration not found" }, { status: 404 });
        }

        if (action === "verify") {
            await Registration.findByIdAndUpdate(registrationId, {
                paymentStatus: "paid",
                manualVerification: {
                    verifiedBy: adminId, // Use admin ID from token
                    verifiedAt: new Date(),
                    notes: notes || "Manually verified by admin",
                },
            });

            return NextResponse.json({ message: "Registration verified manually" });
        }

        if (action === "reject") {
            await Registration.findByIdAndUpdate(registrationId, {
                paymentStatus: "failed",
                manualVerification: {
                    verifiedBy: adminId,
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
