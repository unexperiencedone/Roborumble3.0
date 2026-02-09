import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChannel extends Document {
    eventId: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    isActive: boolean;
    postCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const ChannelSchema = new Schema<IChannel>(
    {
        eventId: {
            type: Schema.Types.ObjectId,
            ref: "Event",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        description: String,
        isActive: {
            type: Boolean,
            default: true,
        },
        postCount: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Indexes
ChannelSchema.index({ eventId: 1 }, { unique: true });  // One channel per event
ChannelSchema.index({ isActive: 1 });

const Channel: Model<IChannel> =
    mongoose.models.Channel || mongoose.model<IChannel>("Channel", ChannelSchema);

export default Channel;
