import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        slug: { type: String, unique: true }, // URL-friendly identifier
        description: String,

        // Pricing
        fees: { type: Number, required: true, default: 0 }, // 0 for free events

        // Team constraints
        minTeamSize: { type: Number, default: 1 },
        maxTeamSize: { type: Number, default: 4 },

        // Registration limits
        maxRegistrations: Number, // Optional cap on registrations
        registrationDeadline: Date,

        // Status
        isLive: { type: Boolean, default: true },

        // Admin who created the event
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Profile" },
    },
    { timestamps: true }
);

// Auto-generate slug from title if not provided
EventSchema.pre("save", function (next) {
    if (!this.slug && this.title) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    }
    next();
});

export default mongoose.models.Event || mongoose.model("Event", EventSchema);
