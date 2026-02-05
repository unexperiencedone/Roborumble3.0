import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import Registration from "@/Models/Registration";
import Team from "@/Models/Team";

// POST - Verify payment on client side (backup verification)
export async function POST(req) {
    try {
        const body = await req.json();
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            registrationId,
        } = body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json(
                { message: "Missing payment verification data" },
                { status: 400 }
            );
        }

        // Verify signature
        const secret = process.env.RAZORPAY_KEY_SECRET;
        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (razorpay_signature !== expectedSignature) {
            return NextResponse.json(
                { message: "Invalid payment signature" },
                { status: 400 }
            );
        }

        await connectDB();

        // Update registration (if not already updated by webhook)
        const registration = await Registration.findOne({
            razorpayOrderId: razorpay_order_id,
        });

        if (!registration) {
            return NextResponse.json(
                { message: "Registration not found" },
                { status: 404 }
            );
        }

        // Only update if not already paid (webhook might have already updated)
        if (registration.paymentStatus !== "paid") {
            await Registration.findByIdAndUpdate(registration._id, {
                paymentStatus: "paid",
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
            });

            // Lock the team
            await Team.findByIdAndUpdate(registration.teamId, { isLocked: true });
        }

        return NextResponse.json({
            message: "Payment verified successfully",
            success: true,
        });
    } catch (error) {
        console.error("Payment verification error:", error);
        return NextResponse.json({ message: "Verification failed" }, { status: 500 });
    }
}
