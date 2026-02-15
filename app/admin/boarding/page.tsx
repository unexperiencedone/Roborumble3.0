"use client";

import { useState, useEffect } from "react";
import {
  Search,
  RefreshCw,
  Mail,
  School,
  Phone,
  MapPin,
  Hotel,
} from "lucide-react";

interface BoardingUser {
  id: string;
  _id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  name: string;
  phone?: string;
  college?: string;
  city?: string;
  state?: string;
  boarding: boolean;
  createdAt: string | Date;
}

export default function AdminBoardingPage() {
  const [users, setUsers] = useState<BoardingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/boarding");
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

  const filteredUsers = users.filter(
    (u) =>
      (u.name || "").toLowerCase().includes(filter.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(filter.toLowerCase()) ||
      (u.college || "").toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 font-mono text-white min-h-screen bg-black">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-[#FF003C]/30 pb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Hotel className="text-[#FF003C]" size={28} />
            <h1 className="text-xl md:text-2xl font-black text-[#FF003C] uppercase">
              Boarding_Requests
            </h1>
          </div>
          <p className="text-zinc-500 text-[10px] uppercase tracking-widest">
            Total_Requests: {users.length}
          </p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="p-2 border border-zinc-800 hover:text-[#FF003C] hover:border-[#FF003C] transition-colors disabled:opacity-50"
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            size={16}
          />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="SEARCH_BY_NAME_EMAIL_COLLEGE..."
            className="w-full bg-zinc-900 border border-zinc-800 pl-10 pr-4 py-3 text-sm focus:border-[#FF003C] outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-[#050505] border border-zinc-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-900 text-zinc-500 uppercase text-[10px] font-black tracking-tighter">
              <tr>
                <th className="p-4 border-b border-zinc-800">User_Entity</th>
                <th className="p-4 border-b border-zinc-800">Contact_Log</th>
                <th className="p-4 border-b border-zinc-800 hidden lg:table-cell">
                  Location_Data
                </th>
                <th className="p-4 border-b border-zinc-800 hidden md:table-cell">
                  Affiliation
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-12 text-center text-zinc-600 animate-pulse"
                  >
                    LOADING_REQUESTS...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-zinc-600">
                    NO_BOARDING_REQUESTS_FOUND
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-zinc-900/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex flex-col">
                        <div className="font-bold text-white flex items-center gap-2">
                          {user.name}
                        </div>
                        <div className="text-zinc-500 text-[10px] mt-0.5">
                          @{user.username || "unknown"}
                        </div>
                        <div className="lg:hidden text-zinc-500 text-[10px] mt-1 flex items-center gap-1">
                            <MapPin size={10} /> {user.city || "N/A"}, {user.state || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="text-zinc-400 text-xs flex items-center gap-2">
                          <Mail size={12} className="text-zinc-600" />
                          {user.email}
                        </div>
                        <div className="text-[#00F0FF] text-xs flex items-center gap-2">
                          <Phone size={12} className="text-zinc-600" />
                          {user.phone || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <div className="flex flex-col gap-1">
                        <div className="text-zinc-400 text-xs flex items-center gap-2">
                            <MapPin size={12} className="text-zinc-600" />
                            {user.city || "N/A"}, {user.state || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell max-w-[200px] overflow-hidden text-ellipsis">
                      <div className="text-zinc-400 text-xs flex items-center gap-2">
                        <School size={12} className="shrink-0 text-zinc-600" />
                        {user.college || "Unassigned"}
                      </div>
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
