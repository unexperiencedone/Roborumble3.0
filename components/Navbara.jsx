"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FaInstagram, FaFacebookF, FaLinkedinIn, FaYoutube, FaWhatsapp } from "react-icons/fa"

/* ---------------- Navbar Component ---------------- */
export default function Navbar() {
  const [menuKhula, setMenuKhula] = useState(false)
  const [scrollHua, setScrollHua] = useState(false)
  const konsiPage = usePathname()

  // Mobile Menu khulne par background scroll lock
  useEffect(() => {
    if (menuKhula) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
  }, [menuKhula])

  useEffect(() => {
    const scrollCheck = () => {
      setScrollHua(window.scrollY > 20)
    }
    window.addEventListener("scroll", scrollCheck)
    return () => window.removeEventListener("scroll", scrollCheck)
  }, [])

  const sabLinks = [
    { href: "/", label: "HOME" },
    { href: "/dashboard/events", label: "EVENTS" },
    { href: "/schedule", label: "SCHEDULE" },
    { href: "/patrons", label: "PATRONS" },
    { href: "/contacts", label: "OUR TEAM" },
    { href: "/gallery", label: "GALLERY" },
    { href: "/sponsors", label: "SPONSORS" },
  ]

  const socialLinks = [
    { icon: <FaInstagram size={24} />, href: "#" },
    { icon: <FaFacebookF size={24} />, href: "#" },
    { icon: <FaLinkedinIn size={24} />, href: "#" },
    { icon: <FaYoutube size={24} />, href: "#" },
    { icon: <FaWhatsapp size={24} />, href: "#" },
  ]

  // Helper for animated text (Upar jaane wala effect)
  const AnimatedText = ({ text, isActive }) => (
    <div className="relative overflow-hidden h-5 flex flex-col items-center justify-start group-hover:justify-end">
      {/* Original Text - Moves Up on Hover */}
      <span className={`block transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:-translate-y-full ${isActive ? '-translate-y-full' : 'translate-y-0'}`}>
        {text}
      </span>

      {/* Hover Text - Comes from Bottom */}
      <span className={`absolute top-0 block transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:translate-y-0 text-[#FFD700] drop-shadow-[0_0_5px_rgba(255,215,0,0.5)] ${isActive ? 'translate-y-0' : 'translate-y-[120%]'}`}>
        {text}
      </span>
    </div>
  )

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[9999] w-full transition-all duration-500 ${scrollHua ? "bg-[#0a0a0a]/80 backdrop-blur-md shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]" : "bg-transparent"
      }`}>

      <div className="w-full h-20 px-4 md:px-8 lg:px-12 flex items-center justify-between">

        {/* LOGO SECTION */}
        <div className="flex items-center flex-shrink-0 z-[10001]">
          <Link href="/" className="flex items-center group">
            <h1 className="font-black text-sm sm:text-lg md:text-xl uppercase tracking-widest text-white transition-all duration-300 group-hover:tracking-[0.3em]">
              ROBO RUMBLE
              <span className="ml-1 text-[#FFD700] drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]">
                '26
              </span>
            </h1>
          </Link>
        </div>

        {/* --- DESKTOP MENU --- */}
        <div className="hidden lg:flex items-center gap-2">
          {sabLinks.map((link) => {
            const isActive = konsiPage === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group relative px-6 py-2 rounded-full border transition-all duration-300 ease-out overflow-hidden
                  ${isActive
                    ? "bg-[#FFD700]/10 border-[#FFD700]/50 shadow-[0_0_20px_rgba(255,215,0,0.3)]"
                    : "border-transparent hover:border-[#FFD700]/30 hover:bg-[#FFD700]/5 hover:shadow-[0_0_15px_rgba(255,215,0,0.2)]"
                  }
                `}
              >
                <div className="text-xs font-bold tracking-[0.15em] uppercase text-white/80">
                  <AnimatedText text={link.label} isActive={isActive} />
                </div>
              </Link>
            )
          })}

          <Link
            href="/dashboard"
            className="ml-6 group relative px-6 py-2 text-xs font-bold tracking-[0.2em] uppercase text-white transition-all duration-300"
          >
            <span className="absolute -top-[2px] -left-[6px] text-white/50 transition-all duration-300 group-hover:text-[#FFD700] group-hover:-translate-x-1 group-hover:-translate-y-1">[</span>
            <AnimatedText text="DASHBOARD" isActive={false} />
            <span className="absolute -bottom-[2px] -right-[6px] text-white/50 transition-all duration-300 group-hover:text-[#FFD700] group-hover:translate-x-1 group-hover:translate-y-1">]</span>
          </Link>
        </div>

        {/* --- HAMBURGER BUTTON --- */}
        <button
          onClick={() => setMenuKhula(!menuKhula)}
          className="lg:hidden z-[10001] relative w-12 h-12 flex flex-col justify-center items-center gap-1.5 group flex-shrink-0 rounded-full hover:bg-white/5 transition-colors"
          aria-label="Toggle Menu"
        >
          <span className={`block h-[2px] w-6 bg-[#FFD700] rounded transition-all duration-300 origin-center ${menuKhula ? "rotate-45 translate-y-[5px]" : ""}`} />
          <span className={`block h-[2px] w-4 bg-[#FFD700] rounded transition-all duration-300 ${menuKhula ? "opacity-0 scale-0" : "group-hover:w-6"}`} />
          <span className={`block h-[2px] w-6 bg-[#FFD700] rounded transition-all duration-300 origin-center ${menuKhula ? "-rotate-45 -translate-y-[5px]" : ""}`} />
        </button>

        {/* --- MOBILE SIDE DRAWER --- */}
        <div
          className={`fixed top-0 right-0 h-screen w-full sm:w-[400px] bg-[#050505]/95 backdrop-blur-3xl z-[10000] transform transition-transform duration-500 ease-[cubic-bezier(0.77,0,0.175,1)] ${menuKhula ? "translate-x-0" : "translate-x-full"
            }`}
        >
          {/* Glow Effects in Drawer */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#FFD700]/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-[#00FF9E]/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="flex flex-col h-full pt-32 px-10 pb-8 overflow-y-auto no-scrollbar">
            <div className="flex flex-col gap-6 items-end text-right">
              {sabLinks.map((link, i) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuKhula(false)}
                  className={`group flex items-center justify-end gap-4 text-xl font-medium tracking-[0.2em] uppercase transition-all duration-300 ${konsiPage === link.href ? "text-[#FFD700]" : "text-white/60 hover:text-white"
                    }`}
                  style={{ transitionDelay: `${i * 50}ms` }}
                >
                  <span className="relative overflow-hidden">
                    <span className="block transition-transform duration-300 group-hover:-translate-y-full">{link.label}</span>
                    <span className="absolute top-0 right-0 block text-[#FFD700] transition-transform duration-300 translate-y-full group-hover:translate-y-0">{link.label}</span>
                  </span>
                  <span className={`h-[1px] bg-[#FFD700] transition-all duration-300 ${konsiPage === link.href ? "w-8" : "w-0 group-hover:w-4"}`} />
                </Link>
              ))}

              <Link
                href="/dashboard"
                onClick={() => setMenuKhula(false)}
                className="mt-4 px-8 py-3 bg-[#FFD700] text-[#0a0a0a] text-sm font-bold tracking-[0.2em] uppercase hover:bg-white transition-colors duration-300 clip-path-polygon"
                style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}
              >
                DASHBOARD
              </Link>
            </div>

            {/* --- SOCIAL FOOTER --- */}
            <div className="mt-auto flex flex-col items-center gap-4">
              <h3 className="text-[#FFD700] text-sm tracking-[0.3em] font-light">FOLLOW US</h3>
              <div className="flex items-center gap-6">
                {socialLinks.map((social, i) => (
                  <Link
                    key={i}
                    href={social.href}
                    className="text-white/60 hover:text-[#FFD700] transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_8px_#FFD700]"
                  >
                    {social.icon}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Black Overlay */}
        {menuKhula && (
          <div
            className="fixed inset-0 bg-black/60 z-[9999] lg:hidden backdrop-blur-[2px] transition-opacity duration-500"
            onClick={() => setMenuKhula(false)}
          />
        )}
      </div>

      {/* Bottom Border Line with Glow */}
      <div className={`w-full h-[1px] transition-all duration-500 ${scrollHua
        ? "bg-gradient-to-r from-transparent via-[#FFD700]/50 to-transparent shadow-[0_0_10px_#FFD700]"
        : "bg-gradient-to-r from-transparent via-white/10 to-transparent"
        }`} />
    </nav>
  )
}