"use client";

import Navbar from "../components/Navbar";
import MatrixBackground from "../components/MatrixBackground";
import Footer from "../components/Footer";
import Image from "next/image";
import Link from "next/link";
import { Linkedin, Mail, ShieldCheck, Cpu, Terminal, Instagram } from "lucide-react";
import { useAudio } from "../hooks/useAudio";

// --- Types ---
interface TeamMember {
  name: string;
  role: string;
  dept: string;
  image: string;
  bio?: string;
}

interface Contributor {
  name: string;
  dept: string;
  image: string;
  instagram?: string;
  linkedin?: string;
  email?: string;
}

const contributors: Contributor[] = [
  {
    name: "Shreya Jain",
    dept: "IT, 3rd Year",
    image: "/Shreya.jpeg",
    instagram: "https://www.instagram.com/jain_shreya7905?igsh=Znplb2l4ZjZwZWxo",
    linkedin: "https://www.linkedin.com/in/shreya-jain-ba7034275/",
    email: "jainshreya6393@gmail.com"
  },
  {
    name: "Mukut Kumar",
    dept: "IT, 3rd Year",
    image: "/Mukut.jpeg",
    instagram: "https://www.instagram.com/abhi_nav.004?igsh=aTd6N3I0d2ZseTVk",
    linkedin: "https://www.linkedin.com/in/mukut-kumar?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
    email: "mukutkumar842@gmail.com"
  },
  {
    name: "Sumit Kumar",
    dept: "CSE, 2nd Year",
    image: "/sumit.jpeg",
    instagram: "https://www.instagram.com/ska_0770?igsh=cGFzd3NvdWZvaHU3",
    linkedin: "https://www.linkedin.com/in/sumit-kumar-122671322/",
    email: "sumitkumar202006@gmail.com"
  },
  {
    name: "Riya Sonker",
    dept: "CSE, 2nd Year",
    image: "/riya.jpeg",
    instagram: "https://www.instagram.com/rittzz._.35",
    linkedin: "https://www.linkedin.com/in/riya-sonker-53b329371",
    email: "riyasonker0307@gmail.com"
  },
  {
    name: "Ashutosh Saroj",
    dept: "CSE, 2nd Year",
    image: "/Skull.png",
    instagram: "https://www.instagram.com/ashutosh__satya67",
    linkedin: "https://www.linkedin.com/in/ashutosh-satya-37340b382?utm_source=share&utm_campaign=share_via&utm_content",
    email: "sarojashutosh89@gmail.com"
  }
];

const ContributorCard = ({ data, index }: { data: Contributor; index: number }) => {
  return (
    <div
      className="group relative p-6 bg-black/40 border-l-2 border-t border-[#00F0FF]/30 hover:bg-[#00F0FF]/5 transition-all duration-500 backdrop-blur-sm overflow-hidden h-full"
      style={{ clipPath: 'polygon(0 0, 95% 0, 100% 10%, 100% 100%, 5% 100%, 0 90%)' }}
    >
      <div className="text-[#00F0FF] font-mono text-[8px] mb-4 opacity-50 tracking-tighter uppercase">
                // ASSET_LOG: {data.name.split(' ')[0]}
      </div>

      <div className="relative w-48 h-48 mx-auto mb-6 transition-all duration-500 overflow-hidden border border-white/10 p-1">
        <Image src={data.image} alt={data.name} fill className="object-cover" />
        <div className="absolute inset-0 border border-[#00F0FF]/20 group-hover:border-[#00F0FF] transition-colors" />
      </div>

      <div className="text-center mb-6">
        <h3 className="text-xl font-black text-white font-mono uppercase tracking-tighter group-hover:text-[#00F0FF] transition-colors">
          {data.name}
        </h3>
        <p className="text-[#00F0FF] font-mono text-[10px] mt-1 font-bold tracking-widest uppercase">
          {data.dept}
        </p>
      </div>

      <div className="flex justify-center gap-4 border-t border-white/5 pt-4">
        {data.instagram && (
          <Link href={data.instagram} target="_blank" className="text-zinc-500 hover:text-[#E1306C] transition-colors hover:scale-110 transform duration-200">
            <Instagram size={18} />
          </Link>
        )}
        {data.linkedin && (
          <Link href={data.linkedin} target="_blank" className="text-zinc-500 hover:text-[#0077b5] transition-colors hover:scale-110 transform duration-200">
            <Linkedin size={18} />
          </Link>
        )}
        {data.email && (
          <Link href={`mailto:${data.email}`} className="text-zinc-500 hover:text-[#EA4335] transition-colors hover:scale-110 transform duration-200">
            <Mail size={18} />
          </Link>
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00F0FF]/5 to-transparent h-[20%] w-full -translate-y-full group-hover:translate-y-[200%] transition-transform duration-1000 pointer-events-none" />
    </div>
  );
};

// --- Internal Component: AssetCard ---
const AssetCard = ({ member, delay }: { member: TeamMember; delay: number }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Preload audio
  const playOpenSound = useAudio('audio.wav', 0.1);
  const playCloseSound = useAudio('audio.wav', 0.1);

  const handleClick = () => {
    if (showDetails || isLoading) return;
    setIsLoading(true);
    playOpenSound();
    setTimeout(() => {
      setIsLoading(false);
      setShowDetails(true);
    }, 600);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    playCloseSound();
    setShowDetails(false);
    setIsHovered(false);
  };

  return (
    <div
      className="relative group cursor-crosshair"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Asset Preview Card */}
      <div
        className="relative p-6 bg-black/40 border-l-2 border-t border-[#00F0FF]/30 hover:bg-[#00F0FF]/5 transition-all duration-500 backdrop-blur-sm h-full"
        style={{ clipPath: 'polygon(0 0, 95% 0, 100% 10%, 100% 100%, 5% 100%, 0 90%)' }}
      >
        <div className="text-[#00F0FF] font-mono text-[8px] mb-4 opacity-50 tracking-tighter uppercase">
          // ASSET_LOG: {member.name.split(' ')[0]}
        </div>

        <div className="relative w-32 h-32 mx-auto mb-6 transition-all duration-500 overflow-hidden border border-white/10 p-1">
          <Image src={member.image} alt={member.name} fill className="object-cover" />
          <div className="absolute inset-0 border border-[#00F0FF]/20 group-hover:border-[#00F0FF] transition-colors" />
        </div>

        <div className="text-center">
          <h3 className="text-xl font-black text-white font-mono uppercase tracking-tighter group-hover:text-[#00F0FF] transition-colors">
            {member.name}
          </h3>
          <p className="text-[#00F0FF] font-mono text-[10px] mt-1 font-bold tracking-widest uppercase">
            {member.role}
          </p>
        </div>

        {isHovered && <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00F0FF]/10 to-transparent h-[20%] w-full animate-scan pointer-events-none" />}
      </div>

      {/* Profile Decryption Dialog */}
      {(isLoading || showDetails) && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 md:p-4 lg:p-12 pointer-events-none">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" />

          <div className="relative w-full max-w-sm md:max-w-3xl lg:max-w-4xl bg-[#050505] border border-[#FF003C] p-1 shadow-[0_0_80px_rgba(255,0,60,0.4)] pointer-events-auto overflow-hidden animate-glitch-entry">
            {/* Top Alert Bar */}
            <div className="bg-[#FF003C] text-black px-3 md:px-6 py-2 flex justify-between items-center font-mono text-[9px] md:text-[11px] font-black uppercase tracking-widest">
              <div className="flex gap-2 md:gap-4">
                <span className="animate-pulse">● CORE_TEAM_ASSET</span>
                <span className="hidden md:inline">ID_VERIFIED_LEVEL_A</span>
              </div>
              {/* Desktop Close Button */}
              <button onClick={handleClose} className="hidden md:block hover:bg-black hover:text-[#FF003C] px-2 md:px-4 py-1 transition-all border border-black text-[8px] md:text-[11px]">
                [ CLOSE ]
              </button>
            </div>

            <div className="p-4 md:p-8 lg:p-16 max-h-[60vh] md:max-h-[70vh] overflow-y-auto">
              {isLoading ? (
                <div className="h-[300px] flex flex-col items-center justify-center space-y-6">
                  <div className="w-1 bg-[#FF003C] h-24 animate-pulse" />
                  <p className="text-[#FF003C] font-mono text-xl animate-pulse tracking-[0.7em] font-black uppercase">Deciphering Profile...</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="relative aspect-square w-full bg-zinc-950 border border-[#FF003C]/30 overflow-hidden group">
                    <Image src={member.image} alt={member.name} fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 border-[30px] border-transparent border-t-[#FF003C]/5 border-l-[#FF003C]/5" />
                    <div className="absolute bottom-4 right-4 flex gap-4">
                      <Linkedin className="text-white hover:text-[#FF003C] cursor-pointer" size={20} />
                      <Mail className="text-white hover:text-[#FF003C] cursor-pointer" size={20} />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <h4 className="text-5xl font-black text-white font-mono mb-4 uppercase tracking-tighter">
                      {member.name}
                    </h4>
                    <div className="h-1.5 w-24 bg-[#FF003C] mb-8" />
                    <div className="space-y-4 font-mono">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="text-[#FF003C]" size={18} />
                        <span className="text-[#FF003C] text-sm font-bold uppercase">{member.role}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Cpu className="text-zinc-600" size={18} />
                        <span className="text-zinc-400 text-xs">{member.dept}</span>
                      </div>
                      <p className="text-zinc-500 text-sm leading-relaxed pt-4 border-t border-zinc-900 uppercase italic">
                        Operational status: active. Coordinating robotics deployment for RR_v3.0.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Close Button at Bottom */}
              <div className="md:hidden border-t border-[#FF003C]/30 p-4">
                <button
                  onClick={handleClose}
                  className="w-full bg-[#FF003C] text-black py-3 font-black font-mono text-xs uppercase tracking-widest hover:bg-[#FF003C]/80 transition-all"
                >
                  [ CLOSE ]
                </button>
              </div>
            </div>
            <div className="absolute bottom-0 w-full p-2 text-[7px] text-zinc-800 font-mono flex justify-between bg-zinc-950/50">
              <span>EST_CONN: 0xTEAM_{member.name.split(' ')[0].toUpperCase()}</span>
              <span>RR_SECURITY_OVERRIDE_ENABLED</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main TeamPage ---
export default function TeamPage() {
  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      <MatrixBackground color="#003B00" text="" />
      <Navbar />

      <div className="relative z-10 pt-40 pb-20 container mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-20 text-center">
          <div className="flex items-center justify-center gap-2 md:gap-4 mb-4">
            <div className="h-[2px] w-12 md:w-20 bg-[#00F0FF]" />
            <span className="text-[#00F0FF] font-mono text-xs md:text-sm font-bold tracking-[0.2em] md:tracking-[0.4em] uppercase">INITIATING_CORE_CREW_RECALL</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-8xl font-black font-mono tracking-tighter uppercase leading-[0.85] mb-8 break-words">
            <div className="relative inline-block glitch-container">
              <span className="absolute top-0 left-0 text-[#FF003C] mix-blend-screen opacity-70 glitch-layer-red" style={{ transform: 'translate(-0.02em, 0.02em)' }}>
                THE CREW
              </span>
              <span className="absolute top-0 left-0 text-[#00F0FF] mix-blend-screen opacity-60 glitch-layer-cyan" style={{ transform: 'translate(0.03em, -0.02em)' }}>
                THE CREW
              </span>
              <span className="relative text-white">THE CREW</span>
            </div>
            <br />
            <div className="flex justify-center w-full">
              <SlotText text="CORE_UNITS_" className="text-4xl md:text-6xl lg:text-8xl" />
            </div>
          </h1>
        </div>

        {/* Sections */}
        <div className="space-y-24">
          <section>
            <h2 className="text-xs font-mono font-bold text-white tracking-[0.5em] uppercase mb-10 border-b border-white/20 pb-4 flex items-center gap-4">
              <Terminal size={14} /> // Student_Coordinators
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {studentCoordinators.map((s, i) => <AssetCard key={i} member={s} delay={i * 0.1} />)}
            </div>
          </section>

          <section>
            <h2 className="text-xs font-mono font-bold text-white tracking-[0.5em] uppercase mb-10 border-b border-white/20 pb-4 flex items-center gap-4">
              <Terminal size={14} /> // Event_Management
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {eventManagement.map((s, i) => <AssetCard key={i} member={s} delay={i * 0.1} />)}
            </div>
          </section>

          <section>
            <h2 className="text-xs font-mono font-bold text-white tracking-[0.5em] uppercase mb-10 border-b border-white/20 pb-4 flex items-center gap-4">
              <Terminal size={14} /> // Technical_Lead
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {technicalLeads.map((s, i) => <AssetCard key={i} member={s} delay={i * 0.1} />)}
            </div>
          </section>

          <section>
            <h2 className="text-xs font-mono font-bold text-white tracking-[0.5em] uppercase mb-10 border-b border-white/20 pb-4 flex items-center gap-4">
              <Terminal size={14} /> // Media_&_PR
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {mediaPR.map((s, i) => <AssetCard key={i} member={s} delay={i * 0.1} />)}
            </div>
          </section>

          <section>
            <h2 className="text-xs font-mono font-bold text-white tracking-[0.5em] uppercase mb-10 border-b border-white/20 pb-4 flex items-center gap-4">
              <Terminal size={14} /> // CONTRIBUTORS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {contributors.map((contributor, index) => (
                <ContributorCard key={index} data={contributor} index={index} />
              ))}
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}