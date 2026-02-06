"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserButton, SignOutButton } from "@clerk/nextjs";
import { Home, Users, Trophy, FileText, Settings, LogOut, ArrowLeft } from "lucide-react";

const navItems = [
    { href: "/", label: "Back to Home", icon: ArrowLeft },
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/dashboard/team", label: "My Team", icon: Users },
    { href: "/dashboard/events", label: "Events", icon: Trophy },
    { href: "/dashboard/registrations", label: "Registrations", icon: FileText },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-[#020617] flex">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 border-r border-gray-800 p-4 flex flex-col">
                <div className="mb-8">
                    <div className="mb-8">
                        <Link href="/home" className="flex items-center gap-3 group">
                            <div className="relative w-10 h-10">
                                <Image src="/Skull.png" alt="Logo" fill className="object-contain" />
                            </div>
                            <span className="text-white font-black text-xl tracking-tighter group-hover:text-[#00E5FF] transition-colors">
                                ROBO RUMBLE
                            </span>
                        </Link>
                        <p className="text-gray-500 text-xs mt-2 font-mono tracking-widest pl-13"> DASHBOARD</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                    }`}
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="pt-4 border-t border-gray-800 space-y-2">
                    <div className="flex items-center gap-3 px-4 py-2">
                        <UserButton afterSignOutUrl="/" />
                        <Link
                            href="/onboarding"
                            className="text-gray-400 hover:text-white text-sm flex items-center gap-2"
                        >
                            <Settings size={16} />
                            Edit Profile
                        </Link>
                    </div>
                    <SignOutButton>
                        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
                            <LogOut size={20} />
                            <span>Logout</span>
                        </button>
                    </SignOutButton>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-auto">{children}</main>
        </div>
    );
}

