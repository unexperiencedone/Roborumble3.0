import mongoose from "mongoose";

const RegistrationSchema = new mongoose.Schema(
    {
        teamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            required: true
        },
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true
        },

        // Payment Tracking
        paymentStatus: {
            type: String,
            enum: ["initiated", "pending", "paid", "failed", "refunded", "manual_verified"],
            default: "initiated",
        },

        // Razorpay Fields
        razorpayOrderId: { type: String, index: true }, // Index for fast webhook lookup
        razorpayPaymentId: String,
        razorpaySignature: String, // Store for audit

        // Financial
        amountExpected: Number, // From Event.fees at time of order
        amountPaid: Number, // From Razorpay callback
        currency: { type: String, default: "INR" },

        // Audit Trail
        paymentAttempts: [
            {
                attemptedAt: Date,
                razorpayOrderId: String,
                status: String,
                errorMessage: String,
            },
        ],

        // Admin Override for manual verification
        manualVerification: {
            verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Profile" },
            verifiedAt: Date,
            notes: String,
        },
    },
    { timestamps: true }
);

// Prevent duplicate registrations (one team can only register once per event)
RegistrationSchema.index({ teamId: 1, eventId: 1 }, { unique: true });

export default mongoose.models.Registration || mongoose.model("Registration", RegistrationSchema);
