"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Search, Check, X, ExternalLink, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

interface AdminUser {
    id: number;
    name: string;
    email: string;
    college: string;
    paymentStatus: string | null;
    events: string[] | null;
    transactionId?: string | null;
    screenshotUrl?: string | null; // We'll need to serve this files
    declaredAmount?: string | null;
    createdAt: string | Date;
    role: string | null;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");
    const router = useRouter();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/users");
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const togglePayment = async (userId: number, currentStatus: string) => {
        const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
        if (!confirm(`Mark user #${userId} as ${newStatus.toUpperCase()}?`)) return;

        try {
            const res = await fetch("/api/admin/payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, status: newStatus }),
            });
            if (res.ok) {
                setUsers(users.map(u => u.id === userId ? { ...u, paymentStatus: newStatus } : u));
            }
        } catch (err) {
            alert("Update Failed");
        }
    };

    const filteredUsers = users.filter(u => 
        (u.name || "").toLowerCase().includes(filter.toLowerCase()) || 
        (u.email || "").toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="p-8 font-mono text-white min-h-screen bg-black">
             <div className="flex justify-between items-center mb-8 border-b border-[#FF003C]/30 pb-4">
                <h1 className="text-2xl font-black text-[#FF003C] uppercase">Operative Database</h1>
                <button onClick={fetchUsers} className="p-2 border border-zinc-800 hover:text-[#FF003C] hover:border-[#FF003C] transition-colors"><RefreshCw size={20}/></button>
            </div>

            <div className="mb-6">
                <input 
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder="Refine Search..."
                    className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-3 text-sm focus:border-[#FF003C] outline-none"
                />
            </div>

            <div className="overflow-x-auto border border-zinc-800">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-zinc-900 text-zinc-500 uppercase text-xs">
                        <tr>
                            <th className="p-4">User</th>
                            <th className="p-4">Payment Proof</th>
                            <th className="p-4">Declared</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-zinc-900/30">
                                <td className="p-4">
                                    <div className="font-bold">{user.name}</div>
                                    <div className="text-zinc-500 text-xs">{user.email}</div>
                                    <div className="text-zinc-500 text-xs">{user.college}</div>
                                </td>
                                <td className="p-4">
                                    {user.transactionId ? (
                                        <div className="space-y-1">
                                            <div className="text-[#00F0FF] text-xs font-bold">Ref: {user.transactionId}</div>
                                            {user.screenshotUrl ? (
                                                <a 
                                                    href={user.screenshotUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-[10px] uppercase text-zinc-400 hover:text-white underline"
                                                >
                                                    <ExternalLink size={10} /> View Proof
                                                </a>
                                            ) : <span className="text-zinc-600 text-[10px]">No Image</span>}
                                        </div>
                                    ) : (
                                        <span className="text-zinc-600 text-xs">Not Submitted</span>
                                    )}
                                </td>
                                <td className="p-4 font-mono">
                                    {user.declaredAmount ? `₹${user.declaredAmount}` : "-"}
                                </td>
                                <td className="p-4">
                                     {user.paymentStatus === 'paid' ? (
                                        <span className="text-green-500 font-bold text-xs flex items-center gap-1">
                                            <Check size={12} /> VERIFIED
                                        </span>
                                    ) : user.transactionId ? (
                                        <span className="text-yellow-500 font-bold text-xs animate-pulse">
                                            REVIEW NEEDED
                                        </span>
                                    ) : (
                                        <span className="text-zinc-600 text-xs">PENDING</span>
                                    )}
                                </td>
                                <td className="p-4 text-right">
                                     <button
                                        onClick={() => togglePayment(user.id, user.paymentStatus || 'pending')} 
                                        className={`text-xs px-3 py-1 font-bold border ${
                                            user.paymentStatus === 'paid' 
                                                ? 'border-red-500/30 text-red-500 hover:bg-red-900/20' 
                                                : 'border-green-500/30 text-green-500 hover:bg-green-900/20'
                                        }`}
                                    >
                                        {user.paymentStatus === 'paid' ? "REVOKE" : "APPROVE"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
