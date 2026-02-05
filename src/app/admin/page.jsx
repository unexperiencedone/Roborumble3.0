"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { BarChart3, Users, Calendar, IndianRupee } from "lucide-react";

export default function AdminDashboardPage() {
  const { user } = useUser();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeams: 0,
    totalRevenue: 0,
    totalRegistrations: 0,
    recentRegs: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!user?.id) return;
      try {
        const res = await fetch(`/api/admin/registrations?clerkId=${user.id}`);
        const data = await res.json();

        if (data.registrations) {
          const regs = data.registrations;
          const revenue = regs.reduce((sum, r) =>
            (r.paymentStatus === 'paid' || r.paymentStatus === 'manual_verified')
              ? sum + (r.amountPaid || r.amountExpected || 0)
              : sum, 0);

          setStats({
            totalRegistrations: regs.length,
            totalRevenue: revenue,
            recentRegs: regs.slice(0, 5) // Last 5
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (user?.id) fetchStats();
  }, [user?.id]);

  if (loading) return <div className="text-white">Loading dashboard...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8 font-[family-name:var(--font-orbitron)]">
        Dashboard
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue}`}
          icon={<IndianRupee className="text-green-400" />}
          color="green"
        />
        <StatCard
          title="Registrations"
          value={stats.totalRegistrations}
          icon={<Users className="text-cyan-400" />}
          color="cyan"
        />
        {/* Placeholders for other stats we didn't implement API for yet */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 opacity-50">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-sm">Active Events</p>
              <h3 className="text-2xl font-bold text-white mt-1">-</h3>
            </div>
            <Calendar className="text-gray-500" />
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 opacity-50">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-sm">Total Teams</p>
              <h3 className="text-2xl font-bold text-white mt-1">-</h3>
            </div>
            <BarChart3 className="text-gray-500" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Recent Registrations</h2>
          <Link href="/admin/registrations" className="text-cyan-400 hover:text-cyan-300 text-sm">
            View All
          </Link>
        </div>
        <div className="space-y-4">
          {stats.recentRegs.map(reg => (
            <div key={reg._id} className="flex justify-between items-center border-b border-gray-700 pb-4 last:border-0 last:pb-0">
              <div>
                <p className="text-white font-medium">{reg.teamId?.name}</p>
                <p className="text-sm text-gray-400">{reg.eventId?.title}</p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${reg.paymentStatus === 'paid' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                  }`}>
                  {reg.paymentStatus}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(reg.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
          {stats.recentRegs.length === 0 && <p className="text-gray-500">No activity yet.</p>}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className={`bg-gray-800 p-6 rounded-xl border border-gray-700 border-l-4 border-l-${color}-500`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
        </div>
        {icon}
      </div>
    </div>
  );
}