import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Profile from "@/Models/Profile";

export async function POST(req) {
    try {
        const body = await req.json();
        const { clerkId, username, bio, phone, college, course, interests } = body;

        // Validation
        if (!clerkId) {
            return NextResponse.json(
                { message: "Not authenticated" },
                { status: 401 }
            );
        }

        if (!username || !username.trim()) {
            return NextResponse.json(
                { message: "Username is required" },
                { status: 400 }
            );
        }

        if (!interests || interests.length === 0) {
            return NextResponse.json(
                { message: "Please select at least one interest" },
                { status: 400 }
            );
        }

        await connectDB();

        // Check if username is already taken
        const existingUsername = await Profile.findOne({
            username: username.trim(),
            clerkId: { $ne: clerkId }, // Exclude current user
        });

        if (existingUsername) {
            return NextResponse.json(
                { message: "Username is already taken" },
                { status: 400 }
            );
        }

        // Update or Create the profile
        const { currentUser } = await import("@clerk/nextjs/server");
        const user = await currentUser();

        const updatedProfile = await Profile.findOneAndUpdate(
            { clerkId },
            {
                $set: {
                    username: username.trim(),
                    bio: bio?.trim() || "",
                    phone: phone?.trim() || "",
                    college: college?.trim() || "",
                    course: course?.trim() || "",
                    interests,
                    onboardingCompleted: true,
                    // If creating new:
                    email: user?.emailAddresses?.[0]?.emailAddress || "",
                    firstName: user?.firstName || "",
                    lastName: user?.lastName || "",
                    avatarUrl: user?.imageUrl || "",
                    role: "user"
                }
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        if (!updatedProfile) {
            return NextResponse.json(
                { message: "Profile not found. Please sign up again." },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                message: "Profile updated successfully",
                profile: updatedProfile,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Onboarding error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

// GET endpoint to check onboarding status
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const clerkId = searchParams.get("clerkId");

        if (!clerkId) {
            return NextResponse.json(
                { message: "clerkId is required" },
                { status: 400 }
            );
        }

        await connectDB();

        const profile = await Profile.findOne({ clerkId });

        if (!profile) {
            return NextResponse.json(
                { onboardingCompleted: false, exists: false },
                { status: 200 }
            );
        }

        return NextResponse.json(
            {
                onboardingCompleted: profile.onboardingCompleted,
                exists: true,
                profile: {
                    username: profile.username,
                    interests: profile.interests,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Onboarding check error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
