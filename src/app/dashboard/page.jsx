"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Trophy, Users, AlertCircle, CheckCircle2 } from "lucide-react";

export default function DashboardPage() {
    const { user, isLoaded } = useUser();
    const [team, setTeam] = useState(null);
    const [registrations, setRegistrations] = useState([]); // This would ideally come from an API
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (!user?.id) return;
            try {
                const teamRes = await fetch(`/api/teams?clerkId=${user.id}`);
                const teamData = await teamRes.json();
                setTeam(teamData.team);

                // We don't have a direct "my registrations" API yet, but we can infer or add one.
                // For now let's just show team info.
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        if (isLoaded && user) fetchData();
    }, [user, isLoaded]);

    if (!isLoaded || loading) return <div className="text-white">Loading dashboard...</div>;

    return (
        <div>
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                    Welcome back, {user?.firstName}! 👋
                </h1>
                <p className="text-gray-400">Here's what's happening with your Robo Rumble journey.</p>
            </div>

            {/* Actionable Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

                {/* Team Status Card */}
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users size={100} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                        <Users size={20} className="text-cyan-400" /> My Team
                    </h3>
                    {team ? (
                        <div>
                            <p className="text-2xl font-bold text-white mb-1">{team.name}</p>
                            <p className="text-gray-400 text-sm mb-4">
                                {team.members?.length} Members • {team.isLocked ? "Locked" : "Open"}
                            </p>
                            <Link
                                href="/dashboard/team"
                                className="inline-flex items-center text-cyan-400 hover:text-cyan-300 font-medium text-sm"
                            >
                                Manage Team <ArrowRight size={16} className="ml-1" />
                            </Link>
                        </div>
                    ) : (
                        <div>
                            <p className="text-gray-400 text-sm mb-4">You haven't joined a team yet.</p>
                            <Link
                                href="/dashboard/team"
                                className="inline-flex items-center text-cyan-400 hover:text-cyan-300 font-medium text-sm"
                            >
                                Create or Join Team <ArrowRight size={16} className="ml-1" />
                            </Link>
                        </div>
                    )}
                </div>

                {/* Events Card */}
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Trophy size={100} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                        <Trophy size={20} className="text-yellow-400" /> Compete
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                        Register for events and showcase your robotics skills.
                    </p>
                    <Link
                        href="/dashboard/events"
                        className="inline-flex items-center text-yellow-400 hover:text-yellow-300 font-medium text-sm"
                    >
                        Browse Events <ArrowRight size={16} className="ml-1" />
                    </Link>
                </div>

                {/* Profile Completion Card (Mockup) */}
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CheckCircle2 size={100} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                        <CheckCircle2 size={20} className="text-green-400" /> Onboarding
                    </h3>
                    <p className="text-green-400 font-bold mb-1">Completed</p>
                    <p className="text-gray-400 text-sm mb-4">You are all set to participate!</p>
                    <Link
                        href="/onboarding"
                        className="inline-flex items-center text-gray-400 hover:text-white font-medium text-sm"
                    >
                        Edit Profile <ArrowRight size={16} className="ml-1" />
                    </Link>
                </div>
            </div>

            {/* Announcements / Instructions */}
            <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded-xl border border-cyan-500/20 p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <AlertCircle size={24} className="text-cyan-400" />
                    Important Instructions
                </h2>
                <ul className="space-y-2 text-gray-300 list-disc list-inside">
                    <li>Create a team before registering for any event.</li>
                    <li>Once you register and pay for an event, your team will be <strong>locked</strong> (no new members).</li>
                    <li>Ensure all team members have completed their profiles.</li>
                    <li>For support, contact the admin via the help desk (coming soon).</li>
                </ul>
            </div>
        </div>
    );
}
