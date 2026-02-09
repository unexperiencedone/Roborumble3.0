import mongoose, { Schema, Document, Model } from "mongoose";

interface Reaction {
    type: string;  // 👍 👎 ❤️ 🎉 😮
    userId: mongoose.Types.ObjectId;
}

interface AuthorInfo {
    name: string;
    avatarUrl?: string;
}

export interface IPost extends Document {
    channelId: mongoose.Types.ObjectId;
    authorId: mongoose.Types.ObjectId;
    title: string;
    content: string;
    reactions: Reaction[];
    commentCount: number;
    isPinned: boolean;
    isLocked: boolean;
    _author: AuthorInfo;
    createdAt: Date;
    updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
    {
        channelId: {
            type: Schema.Types.ObjectId,
            ref: "Channel",
            required: true,
        },
        authorId: {
            type: Schema.Types.ObjectId,
            ref: "Profile",
            required: true,
        },
        title: {
            type: String,
            required: true,
            maxlength: 200,
        },
        content: {
            type: String,
            required: true,
            maxlength: 5000,
        },
        reactions: [
            {
                type: String,
                userId: { type: Schema.Types.ObjectId, ref: "Profile" },
            },
        ],
        commentCount: {
            type: Number,
            default: 0,
        },
        isPinned: {
            type: Boolean,
            default: false,
        },
        isLocked: {
            type: Boolean,
            default: false,
        },
        _author: {
            name: String,
            avatarUrl: String,
        },
    },
    { timestamps: true }
);

// Indexes
PostSchema.index({ channelId: 1, createdAt: -1 });  // Feed query
PostSchema.index({ channelId: 1, isPinned: -1, createdAt: -1 });  // Pinned first
PostSchema.index({ authorId: 1 });  // User's posts

const Post: Model<IPost> =
    mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);

export default Post;
