"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import Script from "next/script";

export default function EventsPage() {
    const { user, isLoaded } = useUser();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState(null);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [userTeam, setUserTeam] = useState(null);
    const [isLeader, setIsLeader] = useState(false);

    // Fetch events
    const fetchEvents = useCallback(async () => {
        try {
            const res = await fetch("/api/events");
            const data = await res.json();
            setEvents(data.events || []);
        } catch (error) {
            console.error("Error fetching events:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch user's team
    const fetchTeam = useCallback(async () => {
        if (!user?.id) return;
        try {
            const res = await fetch(`/api/teams?clerkId=${user.id}`);
            const data = await res.json();
            setUserTeam(data.team);
            if (data.team && data.team.leaderId?._id === data.profileId) {
                setIsLeader(true);
            }
        } catch (error) {
            console.error("Error fetching team:", error);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchEvents();
        if (isLoaded && user) {
            fetchTeam();
        }
    }, [fetchEvents, fetchTeam, isLoaded, user]);

    // Handle registration/payment
    const handleRegister = async (eventId, eventTitle) => {
        if (!user) {
            setMessage({ type: "error", text: "Please sign in to register" });
            return;
        }

        if (!userTeam) {
            setMessage({ type: "error", text: "Create or join a team first" });
            return;
        }

        if (!isLeader) {
            setMessage({ type: "error", text: "Only team leaders can register for events" });
            return;
        }

        setPaymentLoading(eventId);
        setMessage({ type: "", text: "" });

        try {
            // Create order
            const orderRes = await fetch("/api/payments/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clerkId: user.id, eventId }),
            });

            const orderData = await orderRes.json();

            if (!orderRes.ok) {
                setMessage({ type: "error", text: orderData.message });
                setPaymentLoading(null);
                return;
            }

            // Handle free events
            if (orderData.isFree) {
                setMessage({ type: "success", text: "Registered successfully!" });
                fetchEvents();
                setPaymentLoading(null);
                return;
            }

            // Initialize Razorpay for paid events
            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Robo Rumble",
                description: `Registration for ${eventTitle}`,
                order_id: orderData.orderId,
                handler: async function (response) {
                    // Verify payment
                    const verifyRes = await fetch("/api/payments/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            registrationId: orderData.registrationId,
                        }),
                    });

                    const verifyData = await verifyRes.json();

                    if (verifyRes.ok) {
                        setMessage({ type: "success", text: "Payment successful! You are registered." });
                        fetchEvents();
                    } else {
                        setMessage({ type: "error", text: verifyData.message });
                    }
                    setPaymentLoading(null);
                },
                prefill: {
                    email: user.emailAddresses?.[0]?.emailAddress,
                },
                theme: {
                    color: "#06b6d4",
                },
                modal: {
                    ondismiss: function () {
                        setPaymentLoading(null);
                    },
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            console.error("Registration error:", error);
            setMessage({ type: "error", text: "Something went wrong" });
            setPaymentLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-white">Loading events...</div>
            </div>
        );
    }

    return (
        <>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />

            <div>
                <h1 className="text-3xl font-bold text-white mb-8 font-[family-name:var(--font-orbitron)]">
                    Events
                </h1>

                {/* Message */}
                {message.text && (
                    <div
                        className={`mb-6 px-4 py-3 rounded-lg ${message.type === "success"
                            ? "bg-green-500/10 border border-green-500 text-green-400"
                            : "bg-red-500/10 border border-red-500 text-red-400"
                            }`}
                    >
                        {message.text}
                    </div>
                )}

                {/* Team Status Banner */}
                {isLoaded && user && !userTeam && (
                    <div className="mb-6 px-4 py-3 bg-yellow-500/10 border border-yellow-500 text-yellow-400 rounded-lg">
                        You need to create or join a team before registering for events.{" "}
                        <a href="/dashboard/team" className="underline font-bold">
                            Go to Team Dashboard
                        </a>
                    </div>
                )}

                {/* Events Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {events.map((event) => (
                        <div
                            key={event._id}
                            className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-cyan-500/50 transition-colors"
                        >
                            <h2 className="text-xl font-bold text-white mb-2">{event.title}</h2>

                            {event.description && (
                                <p className="text-gray-400 text-sm mb-4">{event.description}</p>
                            )}

                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Fee:</span>
                                    <span className="text-cyan-400 font-bold">
                                        {event.fees === 0 ? "FREE" : `₹${event.fees}`}
                                    </span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Team Size:</span>
                                    <span className="text-white">
                                        {event.minTeamSize} - {event.maxTeamSize} members
                                    </span>
                                </div>

                                {event.maxRegistrations && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Spots Left:</span>
                                        <span
                                            className={`font-bold ${event.spotsLeft <= 5 ? "text-red-400" : "text-green-400"
                                                }`}
                                        >
                                            {event.spotsLeft} / {event.maxRegistrations}
                                        </span>
                                    </div>
                                )}

                                {event.registrationDeadline && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Deadline:</span>
                                        <span className="text-white">
                                            {new Date(event.registrationDeadline).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => handleRegister(event._id, event.title)}
                                disabled={paymentLoading === event._id || (event.spotsLeft !== null && event.spotsLeft <= 0)}
                                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {paymentLoading === event._id
                                    ? "Processing..."
                                    : event.spotsLeft !== null && event.spotsLeft <= 0
                                        ? "Fully Booked"
                                        : event.fees === 0
                                            ? "Register (Free)"
                                            : `Register (₹${event.fees})`}
                            </button>
                        </div>
                    ))}
                </div>

                {events.length === 0 && (
                    <div className="text-center text-gray-400 py-12">
                        No events available at the moment.
                    </div>
                )}
            </div>
        </>
    );
}
