"use client";

import { useState } from "react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, ArrowLeft } from "lucide-react";

const AVAILABLE_INTERESTS = [
    "Robotics",
    "AI/ML",
    "Web Development",
    "App Development",
    "IoT",
    "Embedded Systems",
    "3D Printing",
    "Drone Technology",
    "Gaming",
    "Cybersecurity",
    "Blockchain",
    "Cloud Computing",
];

export default function OnboardingPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();

    const [formData, setFormData] = useState({
        username: "",
        bio: "",
        phone: "",
        college: "",
        course: "",
    });
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const toggleInterest = (interest: string) => {
        setSelectedInterests((prev) =>
            prev.includes(interest)
                ? prev.filter((i) => i !== interest)
                : [...prev, interest]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!formData.username.trim()) {
            setError("Username is required");
            setLoading(false);
            return;
        }

        if (selectedInterests.length === 0) {
            setError("Please select at least one interest");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/onboarding", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    clerkId: user?.id,
                    username: formData.username.trim(),
                    bio: formData.bio.trim(),
                    phone: formData.phone.trim(),
                    college: formData.college.trim(),
                    course: formData.course.trim(),
                    interests: selectedInterests,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to save profile");
            }

            router.push("/dashboard");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#020617]">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header with Logout */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Complete Your Profile
                        </h1>
                        <p className="text-gray-400">
                            Tell us about yourself to get started
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
                        >
                            <ArrowLeft size={18} />
                            Back
                        </Link>
                        <SignOutButton>
                            <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors">
                                <LogOut size={18} />
                                Logout
                            </button>
                        </SignOutButton>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Username */}
                    <div>
                        <label className="block text-white mb-2">
                            Username <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            placeholder="Enter a unique username"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="block text-white mb-2">Bio</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            placeholder="Tell us about yourself..."
                            rows={3}
                            maxLength={500}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                        />
                        <p className="text-gray-500 text-sm mt-1">
                            {formData.bio.length}/500 characters
                        </p>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-white mb-2">Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Your phone number"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                    </div>

                    {/* College */}
                    <div>
                        <label className="block text-white mb-2">College/University</label>
                        <input
                            type="text"
                            name="college"
                            value={formData.college}
                            onChange={handleInputChange}
                            placeholder="Your college or university"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                    </div>

                    {/* Course */}
                    <div>
                        <label className="block text-white mb-2">Course/Branch</label>
                        <input
                            type="text"
                            name="course"
                            value={formData.course}
                            onChange={handleInputChange}
                            placeholder="e.g., B.Tech CSE, MCA, etc."
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                    </div>

                    {/* Interests */}
                    <div>
                        <label className="block text-white mb-2">
                            Interests <span className="text-red-500">*</span>
                        </label>
                        <p className="text-gray-500 text-sm mb-3">
                            Select topics you&apos;re interested in (for matching)
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {AVAILABLE_INTERESTS.map((interest) => (
                                <button
                                    key={interest}
                                    type="button"
                                    onClick={() => toggleInterest(interest)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedInterests.includes(interest)
                                        ? "bg-cyan-500 text-white"
                                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                                        }`}
                                >
                                    {interest}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Saving..." : "Complete Profile"}
                    </button>
                </form>
            </div>
        </div>
    );
}
