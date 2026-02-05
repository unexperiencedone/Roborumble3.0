"use client";
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Calendar, CreditCard, Users, CheckCircle, XCircle, Clock } from "lucide-react";

export default function UserRegistrations() {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const fetchRegistrations = async () => {
        try {
            const res = await fetch("/api/registrations");
            const data = await res.json();
            if (res.ok) {
                setRegistrations(data.registrations || []);
            }
        } catch (error) {
            console.error("Failed to load registrations", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "paid": return "text-green-400 bg-green-400/10 border-green-400/20";
            case "manual_verified": return "text-green-400 bg-green-400/10 border-green-400/20";
            case "pending": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
            case "failed": return "text-red-400 bg-red-400/10 border-red-400/20";
            default: return "text-gray-400 bg-gray-400/10 border-gray-400/20";
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 text-cyan-400 animate-pulse">
                Loading Records...
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold font-[family-name:var(--font-orbitron)] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                    My Registrations
                </h1>
                <p className="text-gray-400 text-sm mt-2">
                    Track your team's event entries and payment status.
                </p>
            </div>

            {registrations.length === 0 ? (
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-12 text-center">
                    <div className="bg-gray-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CreditCard className="text-gray-500" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Registrations Found</h3>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                        You haven't registered for any events yet. Join a team or create one to start competing!
                    </p>
                    <a
                        href="/dashboard/events"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
                    >
                        Browse Events
                    </a>
                </div>
            ) : (
                <div className="grid gap-4">
                    {registrations.map((reg) => (
                        <div
                            key={reg._id}
                            className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-cyan-500/30 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                                            {reg.eventId?.title || "Unknown Event"}
                                        </h3>
                                        <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded border ${getStatusColor(reg.paymentStatus)}`}>
                                            {reg.paymentStatus.replace('_', ' ')}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-gray-400">
                                        <div className="flex items-center gap-1.5">
                                            <Users size={14} className="text-purple-400" />
                                            <span>{reg.teamId?.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={14} className="text-cyan-400" />
                                            <span>Registered on {format(new Date(reg.createdAt), "MMM d, yyyy")}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 uppercase font-bold">Amount</p>
                                        <p className="text-lg font-mono font-bold text-white">
                                            {reg.amountPaid > 0 ? `₹${reg.amountPaid}` : "Free"}
                                        </p>
                                    </div>

                                    {reg.paymentStatus === 'paid' || reg.paymentStatus === 'manual_verified' ? (
                                        <div className="bg-green-500/10 p-3 rounded-full border border-green-500/20">
                                            <CheckCircle className="text-green-500" size={20} />
                                        </div>
                                    ) : reg.paymentStatus === 'failed' ? (
                                        <div className="bg-red-500/10 p-3 rounded-full border border-red-500/20">
                                            <XCircle className="text-red-500" size={20} />
                                        </div>
                                    ) : (
                                        <div className="bg-yellow-500/10 p-3 rounded-full border border-yellow-500/20">
                                            <Clock className="text-yellow-500" size={20} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
