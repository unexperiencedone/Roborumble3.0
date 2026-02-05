"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link"; // Link add kiya taaki Register page par ja sakein

const HeroSection = () => {
  const [bgStars, setBgStars] = useState([]);
  const [glowingStars, setGlowingStars] = useState([]);

  useEffect(() => {
    // 1. DUST STARS
    const dust = Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      top: Math.random() * 100 + "%",
      left: Math.random() * 100 + "%",
      size: Math.random() * 2 + "px",
      opacity: Math.random() * 0.5 + 0.2,
      duration: Math.random() * 20 + 10,
    }));
    setBgStars(dust);

    // 2. GLOWING STARS
    const glow = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      top: Math.random() * 100 + "%",
      left: Math.random() * 100 + "%",
      size: Math.random() * 3 + 1 + "px",
      duration: Math.random() * 3 + 2,
    }));
    setGlowingStars(glow);
  }, []);

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-[#01020a] flex flex-col font-sans">

      {/* LAYER 0: CYBER GRID */}
      <div
        className="absolute inset-0 z-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zM22.344 0L13.858 8.485 15.272 9.9l7.9-7.9h-.828zm5.656 0L19.515 8.485 18.1 9.9l8.9-8.9h1zm5.657 0L33.657 0h-2.828zM39.314 0L27.9 11.415l1.414 1.414L42.142 0h-2.828zM44.97 0L30.728 14.243l1.414 1.414L47.8 0h-2.828zM50.627 0L33.557 17.07l1.414 1.414L53.458 0h-2.83zM56.284 0L36.385 19.9l1.415 1.414L59.11 0h-2.828zM60 0v2.828L57.172 0H60zM0 0v2.828L2.828 0H0zM30 30h1.414L30 28.586V30zm0 2.828L28.586 30H30v2.828zm0-5.657L31.414 30H30v-2.828zm0 8.485L27.172 30H30v5.657zM30 16.97L16.97 30H30v-13.03zm0 26.06L43.03 30H30v13.03zm0-39.09L-9.09 30H30V3.94zm0 52.12L69.09 30H30v26.06zM30 0v60h-1V0h1z' fill='%23164e63' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }}
      />

      {/* LAYER 1: STARS */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {bgStars.map((star) => (
          <motion.div
            key={`dust-${star.id}`}
            className="absolute bg-slate-500 rounded-full"
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
            }}
            animate={{ y: [0, -20] }}
            transition={{ duration: star.duration, repeat: Infinity, ease: "linear" }}
          />
        ))}
        {glowingStars.map((star) => (
          <motion.div
            key={`glow-${star.id}`}
            className="absolute bg-white rounded-full"
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              boxShadow: "0 0 6px 2px rgba(255, 255, 255, 0.5)",
            }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* LAYER 2: HERO SECTION CONTENT */}
      <div className="relative z-10 w-full flex-grow flex flex-col items-center justify-center pt-24 md:pt-32">

        {/* ROBOT IMAGE */}
        <motion.div
          className="relative w-full flex justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1, y: [-10, 10, -10] }}
          transition={{
            opacity: { duration: 1 },
            scale: { duration: 1 },
            y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <img
            src="/uiettechfest.jpeg"
            alt="Robo Theme"
            className="h-[40vh] md:h-[55vh] w-auto object-contain drop-shadow-[0_10px_30px_rgba(0,200,255,0.2)]"
            style={{
              maskImage: "linear-gradient(to bottom, black 50%, transparent 95%)",
              WebkitMaskImage: "linear-gradient(to bottom, black 50%, transparent 95%)",
            }}
          />
        </motion.div>

        {/* TITLE & PRIZE POOL */}
        <div className="flex flex-col items-center gap-6 pb-20 -mt-10 md:-mt-14 relative z-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-green-400 font-black tracking-widest text-center uppercase"
            style={{
              fontSize: "clamp(32px, 5vw, 64px)",
              filter: "drop-shadow(0 0 20px rgba(34, 255, 200, 0.5))",
            }}
          >
            ROBO RUMBLE'26
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            className="relative group cursor-pointer"
          >
            <div className="absolute -inset-2 bg-gradient-to-r from-green-500 to-cyan-500 rounded-lg blur-2xl opacity-20 group-hover:opacity-50 transition duration-500"></div>
            <div className="relative px-12 py-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-lg flex flex-col items-center shadow-lg">
              <span className="text-cyan-400 text-sm tracking-[0.4em] font-bold uppercase mb-1">
                Total Prize Pool
              </span>
              <span className="text-white text-4xl md:text-5xl font-bold tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                ₹ 1,56,000
              </span>
            </div>
          </motion.div>

          {/* REGISTER BUTTON */}
          <Link href="/dashboard">
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              whileHover={{ scale: 1.1, boxShadow: "0 0 20px rgba(0, 255, 255, 0.6)" }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-transparent border-2 border-cyan-400 text-cyan-400 font-bold uppercase tracking-widest rounded-full hover:bg-cyan-400 hover:text-black transition-all duration-300 shadow-[0_0_10px_rgba(34,211,238,0.3)] relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center gap-2">
                Launch Dashboard
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </motion.button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;