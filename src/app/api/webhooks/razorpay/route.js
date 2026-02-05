import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import Registration from "@/Models/Registration";
import Team from "@/Models/Team";

// POST - Razorpay webhook handler
export async function POST(req) {
    try {
        const body = await req.text();
        const signature = req.headers.get("x-razorpay-signature");
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (!secret) {
            console.error("Missing RAZORPAY_WEBHOOK_SECRET");
            return new Response("Missing webhook secret", { status: 500 });
        }

        // Verify signature
        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(body)
            .digest("hex");

        if (signature !== expectedSignature) {
            console.error("Invalid Razorpay webhook signature");
            return new Response("Invalid signature", { status: 400 });
        }

        const event = JSON.parse(body);
        console.log(`Razorpay webhook received: ${event.event}`);

        await connectDB();

        // Handle payment captured
        if (event.event === "payment.captured") {
            const payment = event.payload.payment.entity;
            const orderId = payment.order_id;
            const paymentId = payment.id;
            const amountPaid = payment.amount / 100; // Convert from paise

            // Find registration by orderId
            const registration = await Registration.findOne({
                razorpayOrderId: orderId,
            });

            if (!registration) {
                console.error(`Registration not found for order: ${orderId}`);
                return new Response("Registration not found", { status: 404 });
            }

            // Check for duplicate (idempotency)
            if (registration.razorpayPaymentId === paymentId) {
                console.log(`Duplicate webhook for payment: ${paymentId}`);
                return new Response("Already processed", { status: 200 });
            }

            // Update registration
            await Registration.findByIdAndUpdate(registration._id, {
                paymentStatus: "paid",
                razorpayPaymentId: paymentId,
                amountPaid,
                $push: {
                    paymentAttempts: {
                        attemptedAt: new Date(),
                        razorpayOrderId: orderId,
                        status: "paid",
                    },
                },
            });

            // Lock the team
            await Team.findByIdAndUpdate(registration.teamId, { isLocked: true });

            console.log(`Payment successful for registration: ${registration._id}`);
        }

        // Handle payment failed
        if (event.event === "payment.failed") {
            const payment = event.payload.payment.entity;
            const orderId = payment.order_id;
            const errorMessage =
                payment.error_description || payment.error_reason || "Payment failed";

            await Registration.findOneAndUpdate(
                { razorpayOrderId: orderId },
                {
                    paymentStatus: "failed",
                    $push: {
                        paymentAttempts: {
                            attemptedAt: new Date(),
                            razorpayOrderId: orderId,
                            status: "failed",
                            errorMessage,
                        },
                    },
                }
            );

            console.log(`Payment failed for order: ${orderId}`);
        }

        // Handle refund
        if (event.event === "refund.created") {
            const refund = event.payload.refund.entity;
            const paymentId = refund.payment_id;

            await Registration.findOneAndUpdate(
                { razorpayPaymentId: paymentId },
                { paymentStatus: "refunded" }
            );

            console.log(`Refund processed for payment: ${paymentId}`);
        }

        return new Response("Webhook processed", { status: 200 });
    } catch (error) {
        console.error("Razorpay webhook error:", error);
        return new Response("Webhook error", { status: 500 });
    }
}
