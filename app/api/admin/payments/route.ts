import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import { sendPaymentVerifiedEmail, sendPaymentRejectedEmail } from "@/lib/email";
import PaymentSubmission from "@/app/models/PaymentSubmission";
import Registration from "@/app/models/Registration";
import Profile from "@/app/models/Profile";
import Event from "@/app/models/Event";
import Team from "@/app/models/Team";

// Admin clerk IDs - add your admin clerk IDs here
const ADMIN_IDS = ["user_2xFw5kJ3hBjNDVPyaB9tXwLYQr"]; // Replace with actual admin IDs

// GET - List all payment submissions
export async function GET(req: Request) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if admin (you may want to implement proper admin check)
        // For now, allow any authenticated user to view (adjust as needed)

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status"); // pending, verified, rejected, or all

        await connectDB();

        const filter: any = {};
        if (status && status !== "all") {
            filter.status = status;
        }

        const submissions = await PaymentSubmission.find(filter)
            .populate({
                path: "events.eventId",
                model: Event,
                select: "title eventId fees category",
            })
            .populate({
                path: "teamId",
                model: Team,
                select: "name",
            })
            .sort({ createdAt: -1 })
            .limit(100);

        const stats = {
            pending: await PaymentSubmission.countDocuments({ status: "pending" }),
            verified: await PaymentSubmission.countDocuments({ status: "verified" }),
            rejected: await PaymentSubmission.countDocuments({ status: "rejected" }),
        };

        return NextResponse.json({
            submissions,
            stats,
        });
    } catch (error) {
        console.error("Admin Payments GET Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch submissions" },
            { status: 500 }
        );
    }
}

// POST - Verify or reject a payment
export async function POST(req: Request) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { submissionId, action, rejectionReason } = await req.json();

        if (!submissionId || !action) {
            return NextResponse.json(
                { error: "Submission ID and action are required" },
                { status: 400 }
            );
        }

        if (!["verify", "reject"].includes(action)) {
            return NextResponse.json(
                { error: "Action must be 'verify' or 'reject'" },
                { status: 400 }
            );
        }

        await connectDB();

        const submission = await PaymentSubmission.findById(submissionId);
        if (!submission) {
            return NextResponse.json(
                { error: "Submission not found" },
                { status: 404 }
            );
        }

        if (submission.status !== "pending") {
            return NextResponse.json(
                { error: "Submission already processed" },
                { status: 400 }
            );
        }

        if (action === "verify") {
            // Update submission status
            submission.status = "verified";
            submission.verifiedBy = clerkId;
            submission.verifiedAt = new Date();
            await submission.save();

            // Update all related registrations to manual_verified
            for (const eventItem of submission.events) {
                console.log(`Verifying event ${eventItem.eventId} for submission ${submission._id}`);
                
                // Primary update attempt using paymentSubmissionId
                let reg = await Registration.findOneAndUpdate(
                    {
                        eventId: eventItem.eventId,
                        paymentSubmissionId: submission._id,
                    },
                    {
                        paymentStatus: "manual_verified",
                        amountPaid: submission.totalAmount / submission.events.length,
                    },
                    { new: true }
                );

                // Fallback: Try finding by Team ID or User logic if primary failed
                if (!reg) {
                    console.warn(`Primary update failed for ${eventItem.eventId}. Trying fallback...`);
                    const fallbackQuery: any = {
                        eventId: eventItem.eventId,
                        paymentStatus: { $in: ["verification_pending", "pending", "initiated"] }
                    };

                    if (submission.teamId) {
                        fallbackQuery.teamId = submission.teamId;
                    } else {
                        // For individual, find by leader profile? 
                        // Simplified: update if found by Clerk ID via Profile look up if needed, 
                        // but for now relying on teamId or just logging the failure.
                        // Actually, we can look up the profile from clerkId
                        const profile = await Profile.findOne({ clerkId: submission.clerkId });
                        if (profile) {
                            fallbackQuery.selectedMembers = profile._id;
                        }
                    }
                    
                    if (fallbackQuery.teamId || fallbackQuery.selectedMembers) {
                        reg = await Registration.findOneAndUpdate(
                            fallbackQuery,
                            {
                                paymentStatus: "manual_verified",
                                paymentSubmissionId: submission._id, // Link it now
                                amountPaid: submission.totalAmount / submission.events.length,
                            },
                             { new: true }
                        );
                    }
                }
                
                if (reg) {
                    console.log(`Registration updated: ${reg._id}`);
                } else {
                    console.error(`Failed to find registration for event ${eventItem.eventId}`);
                }

                // Increment event registration count
                await Event.findByIdAndUpdate(eventItem.eventId, {
                    $inc: { currentRegistrations: 1 },
                });
            }

            // Update user profile with paid events
            const eventIds = submission.events.map((e) => e.eventId.toString());
            await Profile.findOneAndUpdate(
                { clerkId: submission.clerkId },
                {
                    $addToSet: {
                        registeredEvents: { $each: eventIds },
                        paidEvents: { $each: eventIds },
                    },
                }
            );

            // Get event titles for email
            const populatedSubmission = await PaymentSubmission.findById(submissionId).populate({
                path: "events.eventId",
                model: Event,
                select: "title",
            });
            const eventTitles = populatedSubmission?.events.map((e: any) => e.eventId?.title || "Event") || [];

            // Send verification email
            await sendPaymentVerifiedEmail(
                submission.leaderEmail,
                submission.leaderName,
                eventTitles,
                submission.totalAmount
            );

            return NextResponse.json({
                message: "Payment verified successfully",
                email: submission.leaderEmail,
            });
        } else {
            // Reject payment
            submission.status = "rejected";
            submission.verifiedBy = clerkId;
            submission.verifiedAt = new Date();
            submission.rejectionReason = rejectionReason || "Payment could not be verified";
            await submission.save();

            // Update registrations to rejected
            for (const eventItem of submission.events) {
                await Registration.findOneAndUpdate(
                    {
                        eventId: eventItem.eventId,
                        paymentSubmissionId: submission._id,
                    },
                    {
                        paymentStatus: "rejected",
                    }
                );
            }

            // Send rejection email
            await sendPaymentRejectedEmail(
                submission.leaderEmail,
                submission.leaderName,
                submission.rejectionReason || "Payment could not be verified",
                submission.totalAmount
            );

            return NextResponse.json({
                message: "Payment rejected",
                email: submission.leaderEmail,
            });
        }
    } catch (error) {
        console.error("Admin Payments POST Error:", error);
        return NextResponse.json(
            { error: "Failed to process payment" },
            { status: 500 }
        );
    }
}
