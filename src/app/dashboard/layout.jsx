"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Trophy,
    CreditCard,
    Menu,
    X,
    Bot
} from "lucide-react";
import { useState } from "react";

export default function DashboardLayout({ children }) {
    const { user } = useUser();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const navItems = [
        { label: "Overview", href: "/dashboard", icon: <LayoutDashboard size={20} /> },
        { label: "My Team", href: "/dashboard/team", icon: <Users size={20} /> },
        { label: "Events", href: "/dashboard/events", icon: <Trophy size={20} /> },
        { label: "Registrations", href: "/dashboard/registrations", icon: <CreditCard size={20} /> },
    ];

    return (
        <div className="min-h-screen bg-[#020617] text-white flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-gray-900 border-r border-gray-800 z-50 transform transition-transform duration-200 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                    }`}
            >
                <div className="p-6 flex items-center gap-3 border-b border-gray-800">
                    <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                        <Bot className="text-white" size={20} />
                    </div>
                    <span className="text-xl font-bold font-[family-name:var(--font-orbitron)] text-white">
                        RoboRumble
                    </span>
                    <button
                        className="md:hidden ml-auto text-gray-400 hover:text-white"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav className="p-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                    }`}
                            >
                                {item.icon}
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 w-full p-6 border-t border-gray-800">
                    <div className="flex items-center gap-3">
                        <UserButton afterSignOutUrl="/"
                            appearance={{
                                elements: {
                                    avatarBox: "w-9 h-9 border border-gray-600"
                                }
                            }}
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {user?.fullName || user?.username}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {user?.primaryEmailAddress?.emailAddress}
                            </p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 flex flex-col">
                {/* Mobile Header */}
                <header className="md:hidden h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsSidebarOpen(true)} className="text-gray-400">
                            <Menu size={24} />
                        </button>
                        <span className="font-bold font-[family-name:var(--font-orbitron)]">RoboRumble</span>
                    </div>
                    <UserButton afterSignOutUrl="/" />
                </header>

                {/* Page Content */}
                <div className="flex-1 p-4 md:p-8 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
