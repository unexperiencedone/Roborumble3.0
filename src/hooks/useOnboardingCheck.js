"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function useOnboardingCheck() {
    const { user, isLoaded, isSignedIn } = useUser();
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        async function checkOnboarding() {
            // Skip check for specific routes
            const skipRoutes = ["/onboarding", "/sign-in", "/sign-up"];
            if (skipRoutes.some((route) => pathname.startsWith(route))) {
                setIsChecking(false);
                return;
            }

            if (!isLoaded) return;

            if (!isSignedIn) {
                setIsChecking(false);
                return;
            }

            try {
                const response = await fetch(`/api/onboarding?clerkId=${user.id}`);
                const data = await response.json();

                if (data.exists && !data.onboardingCompleted) {
                    // User exists but hasn't completed onboarding
                    router.push("/onboarding");
                    return;
                }

                setProfile(data.profile);
            } catch (error) {
                console.error("Error checking onboarding status:", error);
            } finally {
                setIsChecking(false);
            }
        }

        checkOnboarding();
    }, [isLoaded, isSignedIn, user, pathname, router]);

    return { isChecking, profile, isSignedIn, user };
}
