"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Menu, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, loading } = useAuth();


  const pathname = usePathname();

  /* Nav Items adapted for Robo Rumble */
  const navItems = [
    { label: 'HOME', href: '/home' },
    { label: 'ABOUT', href: '/about' },
    { label: 'EVENTS', href: '/events' },
    { label: 'SCHEDULE', href: '/schedule' },
    { label: 'GALLERY', href: '/gallery' },
    { label: 'TEAM', href: '/team' },
    { label: 'PATRONS', href: '/patrons' },
    { label: 'SPONSORS', href: '/sponsors' },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="fixed top-0 left-0 w-full z-50">
      <div className="bg-black/80 backdrop-blur-md border-b border-white/10">
        <nav className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          {/* Left Side: Logo */}
          <Link href="/home" className="flex items-center gap-3 group">
            <div className="relative w-16 h-16">
              <Image src="/skull-1.png" alt="Logo" fill className="object-contain" />
            </div>
            <span className="text-white font-black text-xl tracking-tighter group-hover:text-[#00E5FF] transition-colors">
              ROBO RUMBLE
            </span>
          </Link>

          {/* Desktop Navigation - Hidden on mobile/tablet */}
          <div className="hidden lg:flex items-center gap-5">
            {navItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="relative group/item"
              >
                <div className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#00E5FF] group-hover/item:w-full transition-all duration-300" />
                <span className="text-gray-400 font-bold text-[10px] md:text-xs group-hover/item:text-white transition-colors tracking-widest">{item.label}</span>
              </a>
            ))}
          </div>

          {/* Desktop Register Button - Hidden on mobile/tablet */}
          <div className="hidden lg:flex items-center gap-4">
            {loading ? (
              // Loading Placeholder to prevent layout shift or flicker
              <div className="w-[100px] h-[40px] animate-pulse bg-white/5 border border-white/10" />
            ) : user ? (
              <Link href="/account">
                <button className="bg-[#00E5FF]/10 border border-[#00E5FF] text-[#00E5FF] font-bold px-6 py-2 flex items-center gap-2 hover:bg-[#00E5FF]/20 transition-all font-mono tracking-widest text-sm shadow-[0_0_10px_rgba(0,229,255,0.2)]">
                  <User size={16} />
                  {user.name.toUpperCase()}
                </button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <button className="text-white hover:text-[#00E5FF] font-bold px-4 py-2 font-mono tracking-widest text-sm border border-white/20 hover:border-[#00E5FF] transition-all">
                    LOGIN
                  </button>
                </Link>
                <Link href="/register">
                  <button className="bg-[#00E5FF]/90 text-black font-bold px-6 py-2 flex items-center gap-2 hover:bg-[#33EFFF] transition-colors shadow-[0_0_15px_rgba(0,229,255,0.4)]" style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}>
                    REGISTER
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Menu - Visible on mobile/tablet */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-white hover:text-[#00E5FF] transition-colors p-2"
            aria-label="Toggle menu"
          >
            <Menu size={28} />
          </button>
        </nav>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-[#0B0D10] border-l border-[rgba(255,255,255,0.08)] z-50 transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-[rgba(255,255,255,0.08)]">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12">
              <Image src="/skull-1.png" alt="Logo" fill className="object-contain" />
            </div>
            <span className="text-white font-black text-lg tracking-tight">
              MENU
            </span>
          </div>
          <button
            onClick={closeSidebar}
            className="text-[#9CA3AF] hover:text-[#00E5FF] transition-colors p-2"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* Sidebar Navigation Links */}
        <div className="flex flex-col px-4 py-6 space-y-1">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={index}
                href={item.href}
                onClick={closeSidebar}
                className={`
                  relative py-4 px-6 border-l-[3px] transition-all duration-200 min-h-[52px] flex items-center
                  ${isActive
                    ? 'border-[#00E5FF] bg-[#00E5FF]/5 text-[#00E5FF] font-semibold shadow-[0_0_10px_rgba(0,229,255,0.1)]'
                    : 'border-transparent text-[#E5E7EB] font-medium hover:border-[#00E5FF] hover:bg-white/5 hover:text-[#00E5FF]'
                  }
                `}
              >
                <span className="tracking-wide text-sm">
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Decorative System Text */}
          <div className="pt-8 pb-24 space-y-2 px-6 opacity-30">
            <p className="text-[#00E5FF] font-mono text-[9px] tracking-widest">// ROBO_RUMBLE_v3.0</p>
            <p className="text-[#00E5FF] font-mono text-[9px] tracking-widest">// SYSTEM_ONLINE</p>
          </div>
        </div>

        {/* Sidebar CTA Buttons */}
        <div className="sticky bottom-0 left-0 right-0 p-6 border-t border-[rgba(255,255,255,0.08)] bg-[#0B0D10] space-y-4">
          {loading ? (
            <div className="w-full h-[56px] animate-pulse bg-white/5 border border-[rgba(255,255,255,0.08)] rounded" />
          ) : user ? (
            <Link href="/account" onClick={closeSidebar}>
               <button className="w-full bg-[#00E5FF]/10 border border-[#00E5FF] text-[#00E5FF] font-bold py-4 px-6 flex items-center justify-center gap-2 hover:bg-[#00E5FF]/20 transition-all font-mono tracking-widest text-sm shadow-[0_0_10px_rgba(0,229,255,0.2)]">
                  <User size={16} />
                  {(user.name || "User").toUpperCase()}
               </button>
            </Link>
          ) : (
            <div className="flex flex-col gap-3">
              <Link href="/login" onClick={closeSidebar}>
                <button className="w-full bg-transparent border border-[rgba(255,255,255,0.2)] text-[#E5E7EB] font-semibold py-3.5 px-6 hover:border-[#00E5FF] hover:text-[#00E5FF] transition-all tracking-wider text-sm rounded">
                  LOGIN
                </button>
              </Link>
              <Link href="/register" onClick={closeSidebar}>
                <button className="w-full bg-[#00E5FF]/90 text-black font-bold py-4 px-6 flex items-center justify-center gap-2 hover:bg-[#33EFFF] transition-colors shadow-[0_0_15px_rgba(0,229,255,0.4)]" style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}>
                  REGISTER
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;