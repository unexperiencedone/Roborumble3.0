import { NextResponse } from "next/server";
import { currentUser, auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import Profile from "@/app/models/Profile";

export async function POST(req: Request) {
    try {
        const { userId: clerkId } = await auth();

        if (!clerkId) {
            return NextResponse.json(
                { message: "Not authenticated" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { username, phone, college, city, state, degree, branch, yearOfStudy, interests, bio, boarding } = body;

        // Validation - Removed branch and yearOfStudy from mandatory to support school students
        const mandatoryFields = {
            username: "Username",
            phone: "Mobile number",
            college: "College name",
            city: "City",
            state: "State",
            degree: "Degree"
        };

        for (const [field, label] of Object.entries(mandatoryFields)) {
            const value = body[field as keyof typeof body];
            if (!value || (typeof value === "string" && !value.trim())) {
                return NextResponse.json(
                    { message: `${label} is required` },
                    { status: 400 }
                );
            }
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
            clerkId: { $ne: clerkId },
        });

        if (existingUsername) {
            return NextResponse.json(
                { message: "Username is already taken" },
                { status: 400 }
            );
        }

        // Get current user from Clerk
        const user = await currentUser();

        // Update or Create the profile
        const updatedProfile = await Profile.findOneAndUpdate(
            { clerkId },
            {
                $set: {
                    username: username.trim(),
                    bio: bio?.trim() || "",
                    phone: phone?.trim() || "",
                    college: college?.trim() || "",
                    city: city?.trim() || "",
                    state: state?.trim() || "",
                    degree: degree?.trim() || "",
                    branch: branch?.trim() || "",
                    yearOfStudy: yearOfStudy ? parseInt(yearOfStudy.toString()) : undefined,
                    interests,
                    onboardingCompleted: true,
                    email: user?.emailAddresses?.[0]?.emailAddress || "",
                    firstName: user?.firstName || "",
                    lastName: user?.lastName || "",
                    avatarUrl: user?.imageUrl || "",
                    role: "user",
                    boarding: boarding === "yes" || boarding === true,
                },
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        if (!updatedProfile) {
            return NextResponse.json(
                { message: "Failed to update profile" },
                { status: 500 }
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

export async function GET(req: Request) {
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
