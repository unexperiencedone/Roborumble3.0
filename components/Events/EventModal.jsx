"use client";
import React from "react";
import { X, Trophy, Users, FileText, Globe, Mic, MapPin } from "lucide-react";
import Link from "next/link"; // <--- 1. Yahan Import karein

const EventModal = ({ event, onClose }) => {
  if (!event) return null;

  const isCompetition = event.type === "competition" || !event.type;

  return (
    <div className="fixed inset-0 z-[10005] flex items-center justify-center px-4 animate-in fade-in duration-200">
      
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose} 
      ></div>

      {/* Main Modal */}
      <div className="relative w-full max-w-5xl lg:max-w-6xl h-[90vh] md:h-auto md:max-h-[90vh] bg-[#0f1014] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.9)] border border-slate-800 flex flex-col md:flex-row mx-2 sm:mx-4">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-50 text-cyan-400 hover:text-white bg-black/80 rounded-full p-2.5 transition-all hover:scale-110 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.8)]"
        >
          <X size={20} />
        </button>

        {/* --- LEFT SIDE: IMAGE --- */}
        <div className="w-full md:w-[35%] lg:w-[40%] h-32 sm:h-56 md:h-auto relative bg-black">
          <div className="absolute inset-0 opacity-60">
             <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f1014] via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-[#0f1014]"></div>
        </div>

        {/* --- RIGHT SIDE: CONTENT --- */}
        <div className="w-full md:w-[65%] lg:w-[60%] px-4 py-6 sm:p-8 md:p-10 flex flex-col overflow-y-auto scrollbar-hide md:custom-scrollbar bg-[#0f1014]">
          
          {/* Header */}
          <div className="mb-4 sm:mb-6 pt-2 md:pt-0">
            <h2 
              className="font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] font-[Oswald] uppercase tracking-wide mb-2 leading-[1.1]"
              style={{ fontSize: "clamp(22px, 4.5vw, 48px)" }}
            >
              {event.title}
            </h2>
            <p className="text-slate-400 text-[10px] sm:text-sm md:text-base tracking-wide leading-relaxed">
              {event.desc}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:flex lg:flex-wrap gap-2 sm:gap-4 mb-6 sm:mb-8">
            {isCompetition && event.prize && (
              <div className="bg-[#1a1c23] border border-yellow-500/30 px-2 sm:px-4 py-2 rounded-lg flex items-center gap-2 sm:gap-3">
                <Trophy className="text-yellow-500 shrink-0" size={14} />
                <div className="min-w-0">
                  <span className="block text-[8px] sm:text-[10px] text-slate-500 uppercase font-bold truncate">Prize Pool</span>
                  <span className="text-yellow-400 font-bold text-[10px] sm:text-sm truncate">{event.prize}</span>
                </div>
              </div>
            )}

            <div className="bg-[#1a1c23] border border-slate-700 px-2 sm:px-4 py-2 rounded-lg flex items-center gap-2 sm:gap-3">
              <Users className="text-cyan-400 shrink-0" size={14} />
              <div className="min-w-0">
                <span className="block text-[8px] sm:text-[10px] text-slate-500 uppercase font-bold truncate">Eligibility</span>
                <span className="text-slate-200 font-bold text-[10px] sm:text-sm truncate">{event.eligibility || "Open for All"}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
             {isCompetition ? (
                <div>
                    <h4 className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-2 sm:mb-3">Rounds</h4>
                    <div className="flex items-start gap-3">
                        <Globe size={14} className="text-cyan-500 mt-1 shrink-0" />
                        <div>
                            <h5 className="text-white text-xs sm:text-sm font-bold">Finals (Offline)</h5>
                            <p className="text-slate-500 text-[10px] mt-1">Hosted at Campus Arena.</p>
                        </div>
                    </div>
                </div>
             ) : (
                <div>
                    <h4 className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-2 sm:mb-3">Details</h4>
                    <div className="flex items-start gap-3">
                        <MapPin size={14} className="text-purple-500 mt-1 shrink-0" />
                        <div>
                            <h5 className="text-white text-xs sm:text-sm font-bold">Venue</h5>
                            <p className="text-slate-500 text-[10px] mt-1">{event.venue || "Main Auditorium"}</p>
                        </div>
                    </div>
                </div>
             )}

             <div>
                <h4 className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-2 sm:mb-3">Point of Contact</h4>
                <p className="text-white text-xs sm:text-sm font-medium">Devanshu: +91 98765 43210</p>
             </div>
          </div>

          {/* --- FOOTER BUTTONS --- */}
          <div className="mt-auto flex gap-4 pt-6 border-t border-slate-800">
            
            {/* 2. Yahan Button ko Link se replace kiya hai */}
            <Link 
              href="/register" 
              className={`flex-1 flex items-center justify-center font-extrabold text-xs sm:text-sm uppercase tracking-wider py-3 sm:py-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-1 
                ${isCompetition 
                  ? "bg-[#fbbf24] hover:bg-[#f59e0b] text-black shadow-[0_0_20px_rgba(251,191,36,0.4)]" 
                  : "bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]"
                }`}
            >
               {isCompetition ? "Register Now" : "Book Seat"}
            </Link>
           
          </div>

        </div>
      </div>
    </div>
  );
};

export default EventModal;