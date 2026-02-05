"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";

export default function TeamDashboard() {
    const { user, isLoaded } = useUser();
    const [team, setTeam] = useState(null);
    const [invitations, setInvitations] = useState([]);
    const [joinRequests, setJoinRequests] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [newTeamName, setNewTeamName] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [profileId, setProfileId] = useState(null);
    const [isLeader, setIsLeader] = useState(false);

    // Fetch team data
    const fetchTeamData = useCallback(async () => {
        if (!user?.id) return;

        try {
            const res = await fetch(`/api/teams?clerkId=${user.id}`);
            const data = await res.json();

            setTeam(data.team);
            setInvitations(data.invitations || []);
            setProfileId(data.profileId);

            if (data.team) {
                setIsLeader(data.team.leaderId?._id === data.profileId);

                // Fetch join requests if leader
                if (data.team.leaderId?._id === data.profileId) {
                    const reqRes = await fetch(`/api/teams/join?clerkId=${user.id}`);
                    const reqData = await reqRes.json();
                    setJoinRequests(reqData.joinRequests || []);
                }
            }
        } catch (error) {
            console.error("Error fetching team:", error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (isLoaded && user) {
            fetchTeamData();
        }
    }, [isLoaded, user, fetchTeamData]);

    // Search teams
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        try {
            const res = await fetch(`/api/teams?search=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();
            setSearchResults(data.teams || []);
        } catch (error) {
            console.error("Search error:", error);
        }
    };

    // Create team
    const handleCreateTeam = async (e) => {
        e.preventDefault();
        if (!newTeamName.trim()) return;

        setActionLoading(true);
        try {
            const res = await fetch("/api/teams", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clerkId: user.id, teamName: newTeamName }),
            });
            const data = await res.json();

            if (res.ok) {
                setMessage({ type: "success", text: data.message });
                setNewTeamName("");
                fetchTeamData();
            } else {
                setMessage({ type: "error", text: data.message });
            }
        } catch (error) {
            setMessage({ type: "error", text: "Failed to create team" });
        } finally {
            setActionLoading(false);
        }
    };

    // Invite member
    const handleInvite = async (e) => {
        e.preventDefault();
        if (!inviteEmail.trim()) return;

        setActionLoading(true);
        try {
            const res = await fetch("/api/teams/invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clerkId: user.id, inviteEmail }),
            });
            const data = await res.json();

            if (res.ok) {
                setMessage({ type: "success", text: data.message });
                setInviteEmail("");
            } else {
                setMessage({ type: "error", text: data.message });
            }
        } catch (error) {
            setMessage({ type: "error", text: "Failed to send invite" });
        } finally {
            setActionLoading(false);
        }
    };

    // Request to join team
    const handleJoinRequest = async (teamId) => {
        setActionLoading(true);
        try {
            const res = await fetch("/api/teams/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clerkId: user.id, teamId }),
            });
            const data = await res.json();

            if (res.ok) {
                setMessage({ type: "success", text: data.message });
                setSearchResults([]);
                setSearchQuery("");
            } else {
                setMessage({ type: "error", text: data.message });
            }
        } catch (error) {
            setMessage({ type: "error", text: "Failed to send join request" });
        } finally {
            setActionLoading(false);
        }
    };

    // Respond to invitation or join request
    const handleRespond = async (action, teamId = null, userId = null) => {
        setActionLoading(true);
        try {
            const res = await fetch("/api/teams/respond", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clerkId: user.id, action, teamId, userId }),
            });
            const data = await res.json();

            if (res.ok) {
                setMessage({ type: "success", text: data.message });
                fetchTeamData();
            } else {
                setMessage({ type: "error", text: data.message });
            }
        } catch (error) {
            setMessage({ type: "error", text: "Action failed" });
        } finally {
            setActionLoading(false);
        }
    };

    if (!isLoaded || loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-8 font-[family-name:var(--font-orbitron)]">
                Team Management
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

            {/* Current Team Section */}
            {team ? (
                <div className="bg-gray-800/50 rounded-xl p-6 mb-8 border border-gray-700">
                    <h2 className="text-xl font-bold text-white mb-4">Your Team</h2>
                    <div className="mb-4">
                        <span className="text-gray-400">Team Name:</span>
                        <span className="text-cyan-400 ml-2 text-lg font-bold">{team.name}</span>
                        {team.isLocked && (
                            <span className="ml-2 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                                LOCKED
                            </span>
                        )}
                    </div>

                    <div className="mb-4">
                        <span className="text-gray-400">Leader:</span>
                        <span className="text-white ml-2">
                            {team.leaderId?.username || team.leaderId?.email}
                        </span>
                    </div>

                    <div className="mb-4">
                        <span className="text-gray-400">Members ({team.members?.length || 0}):</span>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {team.members?.map((member) => (
                                <div
                                    key={member._id}
                                    className="px-3 py-2 bg-gray-700 rounded-lg flex items-center gap-2"
                                >
                                    {member.avatarUrl && (
                                        <img
                                            src={member.avatarUrl}
                                            alt={member.username}
                                            className="w-6 h-6 rounded-full"
                                        />
                                    )}
                                    <span className="text-white">{member.username || member.email}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Invite Section (Leader Only) */}
                    {isLeader && !team.isLocked && (
                        <form onSubmit={handleInvite} className="mt-6 pt-6 border-t border-gray-700">
                            <h3 className="text-white font-bold mb-3">Invite Member</h3>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="Enter email to invite"
                                    className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                />
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="px-6 py-2 bg-cyan-500 text-white font-bold rounded-lg hover:bg-cyan-600 disabled:opacity-50"
                                >
                                    Invite
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Join Requests (Leader Only) */}
                    {isLeader && joinRequests.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-gray-700">
                            <h3 className="text-white font-bold mb-3">Join Requests</h3>
                            <div className="space-y-2">
                                {joinRequests.map((req) => (
                                    <div
                                        key={req._id}
                                        className="flex items-center justify-between bg-gray-700 px-4 py-3 rounded-lg"
                                    >
                                        <div>
                                            <span className="text-white">{req.username || req.email}</span>
                                            {req.college && (
                                                <span className="text-gray-400 text-sm ml-2">({req.college})</span>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleRespond("accept_request", null, req._id)}
                                                disabled={actionLoading}
                                                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleRespond("reject_request", null, req._id)}
                                                disabled={actionLoading}
                                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    {/* Create Team Section */}
                    <div className="bg-gray-800/50 rounded-xl p-6 mb-8 border border-gray-700">
                        <h2 className="text-xl font-bold text-white mb-4">Create a Team</h2>
                        <form onSubmit={handleCreateTeam} className="flex gap-2">
                            <input
                                type="text"
                                value={newTeamName}
                                onChange={(e) => setNewTeamName(e.target.value)}
                                placeholder="Enter team name"
                                className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                            />
                            <button
                                type="submit"
                                disabled={actionLoading}
                                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50"
                            >
                                Create
                            </button>
                        </form>
                    </div>

                    {/* Search & Join Section */}
                    <div className="bg-gray-800/50 rounded-xl p-6 mb-8 border border-gray-700">
                        <h2 className="text-xl font-bold text-white mb-4">Join a Team</h2>
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by team name"
                                className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            />
                            <button
                                onClick={handleSearch}
                                className="px-6 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500"
                            >
                                Search
                            </button>
                        </div>

                        {searchResults.length > 0 && (
                            <div className="space-y-2">
                                {searchResults.map((t) => (
                                    <div
                                        key={t._id}
                                        className="flex items-center justify-between bg-gray-700 px-4 py-3 rounded-lg"
                                    >
                                        <div>
                                            <span className="text-white font-bold">{t.name}</span>
                                            <span className="text-gray-400 text-sm ml-2">
                                                by {t.leaderId?.username || t.leaderId?.email}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleJoinRequest(t._id)}
                                            disabled={actionLoading}
                                            className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50"
                                        >
                                            Request to Join
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Pending Invitations */}
            {invitations.length > 0 && (
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                    <h2 className="text-xl font-bold text-white mb-4">Pending Invitations</h2>
                    <div className="space-y-2">
                        {invitations.map((inv) => (
                            <div
                                key={inv._id}
                                className="flex items-center justify-between bg-gray-700 px-4 py-3 rounded-lg"
                            >
                                <div>
                                    <span className="text-white font-bold">{inv.name}</span>
                                    <span className="text-gray-400 text-sm ml-2">
                                        from {inv.leaderId?.username || inv.leaderId?.email}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleRespond("accept_invitation", inv._id)}
                                        disabled={actionLoading}
                                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                    >
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => handleRespond("reject_invitation", inv._id)}
                                        disabled={actionLoading}
                                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
