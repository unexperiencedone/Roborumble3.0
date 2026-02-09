import mongoose, { Schema, Document, Model } from "mongoose";

interface Reaction {
    type: string;  // 👍 👎 ❤️ 🎉 😮
    userId: mongoose.Types.ObjectId;
}

interface AuthorInfo {
    name: string;
    avatarUrl?: string;
}

export interface IComment extends Document {
    postId: mongoose.Types.ObjectId;
    authorId: mongoose.Types.ObjectId;
    content: string;
    reactions: Reaction[];
    _author: AuthorInfo;
    createdAt: Date;
    updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
    {
        postId: {
            type: Schema.Types.ObjectId,
            ref: "Post",
            required: true,
        },
        authorId: {
            type: Schema.Types.ObjectId,
            ref: "Profile",
            required: true,
        },
        content: {
            type: String,
            required: true,
            maxlength: 2000,
        },
        reactions: [
            {
                type: String,
                userId: { type: Schema.Types.ObjectId, ref: "Profile" },
            },
        ],
        _author: {
            name: String,
            avatarUrl: String,
        },
    },
    { timestamps: true }
);

// Indexes
CommentSchema.index({ postId: 1, createdAt: 1 });  // Comments on post (chronological)
CommentSchema.index({ authorId: 1 });  // User's comments

const Comment: Model<IComment> =
    mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);

export default Comment;
