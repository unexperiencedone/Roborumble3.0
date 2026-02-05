import { Webhook } from "svix";
import { headers } from "next/headers";
import connectDB from "@/lib/db";
import Profile from "@/Models/Profile";

export async function POST(req) {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        console.error("Missing CLERK_WEBHOOK_SECRET");
        return new Response("Missing webhook secret", { status: 500 });
    }

    // Get headers
    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
        console.error("Missing svix headers");
        return new Response("Missing svix headers", { status: 400 });
    }

    // Get body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Verify webhook signature
    const wh = new Webhook(WEBHOOK_SECRET);
    let evt;

    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        });
    } catch (err) {
        console.error("Webhook verification failed:", err.message);
        return new Response("Invalid signature", { status: 400 });
    }

    // Handle events
    const eventType = evt.type;
    console.log(`Clerk webhook received: ${eventType}`);

    try {
        await connectDB();

        if (eventType === "user.created") {
            const { id, email_addresses, first_name, last_name, image_url } = evt.data;

            // Check if profile already exists (idempotency)
            const existing = await Profile.findOne({ clerkId: id });
            if (existing) {
                console.log(`Profile already exists: ${id}`);
                return new Response("Profile already exists", { status: 200 });
            }

            const newProfile = await Profile.create({
                clerkId: id,
                email: email_addresses?.[0]?.email_address || "",
                firstName: first_name || "",
                lastName: last_name || "",
                avatarUrl: image_url || "",
                role: "user",
                interests: [],
                onboardingCompleted: false,
            });

            console.log(`Profile created in MongoDB: ${newProfile._id}`);
        }

        if (eventType === "user.updated") {
            const { id, email_addresses, first_name, last_name, image_url } = evt.data;

            await Profile.findOneAndUpdate(
                { clerkId: id },
                {
                    email: email_addresses?.[0]?.email_address,
                    firstName: first_name,
                    lastName: last_name,
                    avatarUrl: image_url,
                }
            );

            console.log(`Profile updated in MongoDB: ${id}`);
        }

        if (eventType === "user.deleted") {
            const { id } = evt.data;
            await Profile.findOneAndDelete({ clerkId: id });
            console.log(`Profile deleted from MongoDB: ${id}`);
        }

        return new Response("Webhook processed successfully", { status: 200 });
    } catch (error) {
        console.error("Error processing webhook:", error);
        return new Response("Error processing webhook", { status: 500 });
    }
}
