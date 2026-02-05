"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function CreateEventPage() {
    const { user } = useUser();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        fees: 0,
        minTeamSize: 1,
        maxTeamSize: 4,
        maxRegistrations: "",
        registrationDeadline: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!user) {
            setError("Not authenticated");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    clerkId: user.id,
                    ...formData,
                    fees: Number(formData.fees),
                    minTeamSize: Number(formData.minTeamSize),
                    maxTeamSize: Number(formData.maxTeamSize),
                    maxRegistrations: formData.maxRegistrations ? Number(formData.maxRegistrations) : null,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                alert("Event created successfully!");
                router.push("/admin/registrations"); // Redirect to list
            } else {
                setError(data.message || "Failed to create event");
            }
        } catch (err) {
            setError("An error occurred");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8 font-[family-name:var(--font-orbitron)]">
                Create New Event
            </h1>

            {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800/50 p-6 rounded-xl border border-gray-700">

                {/* Title */}
                <div>
                    <label className="block text-gray-400 mb-2 text-sm uppercase font-bold">Event Title</label>
                    <input
                        type="text"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="e.g. Robo Wars 2024"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-gray-400 mb-2 text-sm uppercase font-bold">Description</label>
                    <textarea
                        name="description"
                        rows="4"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                        placeholder="Event details..."
                    />
                </div>

                {/* Fees & Team Limits */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm uppercase font-bold">Entry Fee (₹)</label>
                        <input
                            type="number"
                            name="fees"
                            min="0"
                            value={formData.fees}
                            onChange={handleChange}
                            className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm uppercase font-bold">Min Team Size</label>
                        <input
                            type="number"
                            name="minTeamSize"
                            min="1"
                            value={formData.minTeamSize}
                            onChange={handleChange}
                            className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm uppercase font-bold">Max Team Size</label>
                        <input
                            type="number"
                            name="maxTeamSize"
                            min="1"
                            value={formData.maxTeamSize}
                            onChange={handleChange}
                            className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>
                </div>

                {/* Registration Limits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm uppercase font-bold">Max Registrations (Optional)</label>
                        <input
                            type="number"
                            name="maxRegistrations"
                            min="1"
                            value={formData.maxRegistrations}
                            onChange={handleChange}
                            className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            placeholder="No limit"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm uppercase font-bold">Registration Deadline</label>
                        <input
                            type="date"
                            name="registrationDeadline"
                            value={formData.registrationDeadline}
                            onChange={handleChange}
                            className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-4 rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                    >
                        {loading ? "Creating..." : "Create Event"}
                    </button>
                </div>

            </form>
        </div>
    );
}
