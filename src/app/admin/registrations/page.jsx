"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";

export default function AdminRegistrationsPage() {
    const { user, isLoaded } = useUser();
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterEvent, setFilterEvent] = useState("all");
    const [events, setEvents] = useState([]);
    const [processingId, setProcessingId] = useState(null);

    // Fetch registrations
    const fetchRegistrations = useCallback(async () => {
        if (!user?.id) return;
        try {
            const res = await fetch(
                `/api/admin/registrations?clerkId=${user.id}&eventId=${filterEvent}`
            );
            if (res.status === 403) {
                alert("Access Denied: Admin only");
                return;
            }
            const data = await res.json();
            setRegistrations(data.registrations || []);
        } catch (error) {
            console.error("Error fetching registrations:", error);
        } finally {
            setLoading(false);
        }
    }, [user?.id, filterEvent]);

    // Fetch events for filter dropdown
    useEffect(() => {
        async function loadEvents() {
            try {
                const res = await fetch("/api/events");
                const data = await res.json();
                setEvents(data.events || []);
            } catch (e) {
                console.error(e);
            }
        }
        loadEvents();
    }, []);

    useEffect(() => {
        if (isLoaded && user) {
            fetchRegistrations();
        }
    }, [isLoaded, user, fetchRegistrations]);

    // Manual Verify / Reject
    const handleVerify = async (regId, action) => {
        if (!confirm(`Are you sure you want to ${action} this payment?`)) return;

        setProcessingId(regId);
        try {
            const res = await fetch("/api/admin/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    clerkId: user.id,
                    registrationId: regId,
                    action: action, // "verify" or "reject"
                    notes: `Admin ${action}ed via dashboard`,
                }),
            });

            if (res.ok) {
                fetchRegistrations();
            } else {
                const d = await res.json();
                alert(d.message || "Action failed");
            }
        } catch (e) {
            console.error(e);
            alert("Error processing request");
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return <div className="text-white">Loading data...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Registrations</h2>

                {/* Filter */}
                <select
                    value={filterEvent}
                    onChange={(e) => setFilterEvent(e.target.value)}
                    className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-cyan-500"
                >
                    <option value="all">All Events</option>
                    {events.map(ev => (
                        <option key={ev._id} value={ev._id}>{ev.title}</option>
                    ))}
                </select>
            </div>

            <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-gray-900 text-gray-200 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Event</th>
                                <th className="px-6 py-4">Team</th>
                                <th className="px-6 py-4">Leader info</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {registrations.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                        No registrations found.
                                    </td>
                                </tr>
                            ) : (
                                registrations.map((reg) => (
                                    <tr key={reg._id} className="hover:bg-gray-800/50">
                                        <td className="px-6 py-4 text-white font-medium">
                                            {reg.eventId?.title || "Unknown Event"}
                                        </td>
                                        <td className="px-6 py-4">
                                            {reg.teamId?.name || "Unknown Team"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-white">
                                                {reg.teamId?.leaderId?.username}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {reg.teamId?.leaderId?.email}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {reg.teamId?.leaderId?.phone}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2 py-1 rounded text-xs font-bold uppercase ${reg.paymentStatus === "paid" || reg.paymentStatus === "manual_verified"
                                                        ? "bg-green-500/10 text-green-400"
                                                        : reg.paymentStatus === "initiated"
                                                            ? "bg-yellow-500/10 text-yellow-400"
                                                            : "bg-red-500/10 text-red-400"
                                                    }`}
                                            >
                                                {reg.paymentStatus.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {reg.amountExpected > 0 ? `₹${reg.amountExpected}` : "Free"}
                                        </td>
                                        <td className="px-6 py-4">
                                            {new Date(reg.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            {/* Actions for pending/initiated/failed */}
                                            {(reg.paymentStatus === "initiated" || reg.paymentStatus === "pending" || reg.paymentStatus === "failed") && (
                                                <>
                                                    <button
                                                        onClick={() => handleVerify(reg._id, "verify")}
                                                        disabled={processingId === reg._id}
                                                        className="text-green-400 hover:text-green-300 font-medium disabled:opacity-50"
                                                    >
                                                        Verify
                                                    </button>
                                                    <button
                                                        onClick={() => handleVerify(reg._id, "reject")}
                                                        disabled={processingId === reg._id}
                                                        className="text-red-400 hover:text-red-300 font-medium disabled:opacity-50"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            {/* Show Checkmark if paid */}
                                            {(reg.paymentStatus === "paid" || reg.paymentStatus === "manual_verified") && (
                                                <span className="text-green-500">✓ Done</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
