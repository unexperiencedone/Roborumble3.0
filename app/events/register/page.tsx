"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import MatrixBackground from "../../components/MatrixBackground";
import { events } from "../../data/events";
import { useAuth } from "../../context/AuthContext";
import { Shield, Zap, AlertTriangle, X } from "lucide-react";

// Separate component to wrap in Suspense because useSearchParams causes de-opt
function RegistrationContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");
  const router = useRouter();
  const { user, loading } = useAuth();
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  
  // Team Form State
  const [teamMembers, setTeamMembers] = useState<{name: string, collegeId: string}[]>([]);
  const [leaderDetails, setLeaderDetails] = useState({ name: "", collegeId: "" });

  // Re-finding event correctly
  const targetEvent = events.find((e) => e.id === eventId);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (user && !leaderDetails.name) {
        // Pre-fill leader with user data if available
        setLeaderDetails({ name: user.name, collegeId: user.college || "" }); 
        // Note: user.college might be just college name, but field asks for ID. 
        // User requested "leader name and college id".
    }
  }, [user, loading, router]);

  // Parse Team Size
  const getMinMax = (sizeStr: string) => {
      let min = 1, max = 1;
      const lower = sizeStr.toLowerCase();
      if (lower.includes("individual")) {
          max = 1;
          if (lower.includes("team of")) {
             const matches = lower.match(/(\d+)/g);
             if (matches) max = Math.max(...matches.map(Number));
          }
      } else {
          const matches = lower.match(/(\d+)/g);
          if (matches && matches.length > 0) {
              min = matches[0] ? parseInt(matches[0]) : 1;
              max = matches[matches.length - 1] ? parseInt(matches[matches.length - 1]) : min;
          }
      }
      return { min, max };
  };

  const { min, max } = targetEvent ? getMinMax(targetEvent.teamSize) : { min: 1, max: 1 };
  
  // Initialize minimum members
  useEffect(() => {
      // Logic: Total Team Size = Leader (1) + Members.
      // If rule is "3-5 Members", Min=3. We have 1 leader. Need 2 more.
      const membersNeeded = Math.max(0, min - 1);
      
      // Only auto-fill if we have fewer than needed
      if (teamMembers.length < membersNeeded) {
          const newMembers = [...teamMembers];
          while(newMembers.length < membersNeeded) {
              newMembers.push({ name: "", collegeId: "" });
          }
          setTeamMembers(newMembers);
      }
  }, [min, teamMembers.length]); // process once or when min changes. safely.


  if (!targetEvent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h1 className="text-[#FF003C] font-mono text-xl">ERROR: EVENT_NOT_FOUND</h1>
        <button onClick={() => router.back()} className="mt-4 text-zinc-400 hover:text-white underline">
          Return to Arena
        </button>
      </div>
    );
  }

  const addMember = () => {
    // Check if adding one more exceeds MAX TOTAL size
    // Current Total = 1 (Leader) + teamMembers.length
    if (1 + teamMembers.length < max) {
       setTeamMembers([...teamMembers, { name: "", collegeId: "" }]);
    }
  };

  const removeMember = (index: number) => {
      // Check if removing drops below MIN TOTAL size
      // Current Total = 1 (Leader) + teamMembers.length
      if(1 + teamMembers.length > min) {
          const newMembers = [...teamMembers];
          newMembers.splice(index, 1);
          setTeamMembers(newMembers);
      }
  };

  const updateMember = (index: number, field: 'name' | 'collegeId', value: string) => {
      const newMembers = [...teamMembers];
      newMembers[index][field] = value;
      setTeamMembers(newMembers);
  };

  const handleConfirm = async () => {
    setIsRegistering(true);
    setError("");

    // Validation
    const allMembers = [{ ...leaderDetails, role: "LEADER" }, ...teamMembers.map(m => ({ ...m, role: "MEMBER" }))];
    
    // Check for empty fields
    if (allMembers.some(m => !m.name.trim() || !m.collegeId.trim())) {
        setError("DATA_INCOMPLETE: All member fields required.");
        setIsRegistering(false);
        return;
    }

    // Validate Team Size Strict
    if (allMembers.length < min || allMembers.length > max) {
         setError(`TEAM_SIZE_ERROR: Squad must be between ${min} and ${max} members.`);
         setIsRegistering(false);
         return;
    }

    try {
      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            eventId: targetEvent.id,
            teamDetails: allMembers
        }),
      });

      if (res.ok) {
        // Success - go to account
        router.push("/account");
      } else {
        const data = await res.json();
        setError(data.error || "UPLINK_FAILED");
      }
    } catch (err) {
      setError("CONNECTION_ERROR");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="w-full max-w-2xl relative">
       <div className="absolute -top-10 left-0 text-[#00F0FF] font-mono text-[10px] opacity-50 uppercase tracking-widest">
            // SECURE_UPLINK_PROTOCOL: v3.0.4 // EVENT_ID: {targetEvent.id.toUpperCase()}
       </div>

       <div className="relative p-1 bg-[#050505] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
             style={{ clipPath: 'polygon(0 0, 95% 0, 100% 5%, 100% 100%, 5% 100%, 0 95%)' }}>
            
            {/* Header */}
            <div className="bg-[#E661FF] text-black px-6 py-2 flex justify-between items-center font-mono text-[10px] font-black uppercase tracking-widest">
               <span>DEPLOYMENT_CONFIG</span>
               <span>STATUS: CONFIGURING</span>
            </div>

            <div className="p-8 md:p-12 space-y-8 bg-zinc-950/50">
                <div className="flex items-start gap-6 border-b border-white/10 pb-6">
                    <div className="w-16 h-16 border border-white/10 bg-black/50 flex items-center justify-center shrink-0">
                        <Zap className="text-[#E661FF]" size={30} />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-white font-mono uppercase tracking-tighter mb-1">{targetEvent.title}</h1>
                        <div className="flex gap-4">
                             <span className="text-zinc-500 font-mono text-xs uppercase">REQ: {targetEvent.teamSize}</span>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-950/30 border border-[#FF003C]/50 text-[#FF003C] font-mono text-xs flex items-center gap-2">
                        <AlertTriangle size={14} /> ERROR: {error}
                    </div>
                )}

                {/* Leader Details */}
                <div className="space-y-4">
                    <h3 className="text-[#00F0FF] font-mono text-xs uppercase tracking-widest border-b border-[#00F0FF]/20 pb-2">Team Leader (You)</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                             <label className="text-[9px] text-zinc-500 uppercase font-mono">Leader Name</label>
                             <input 
                                value={leaderDetails.name}
                                onChange={(e) => setLeaderDetails({...leaderDetails, name: e.target.value})}
                                className="w-full bg-black/50 border border-zinc-800 p-2 text-xs font-mono text-white focus:border-[#E661FF] outline-none"
                                placeholder="YOUR_NAME"
                             />
                        </div>
                        <div className="space-y-1">
                             <label className="text-[9px] text-zinc-500 uppercase font-mono">College ID / Roll No</label>
                             <input 
                                value={leaderDetails.collegeId}
                                onChange={(e) => setLeaderDetails({...leaderDetails, collegeId: e.target.value})}
                                className="w-full bg-black/50 border border-zinc-800 p-2 text-xs font-mono text-white focus:border-[#E661FF] outline-none"
                                placeholder="ID_NUMBER"
                             />
                        </div>
                    </div>
                </div>

                {/* Team Members */}
                 <div className="space-y-4">
                    <div className="flex justify-between items-end border-b border-[#E661FF]/20 pb-2">
                         <h3 className="text-[#E661FF] font-mono text-xs uppercase tracking-widest">Squad Members</h3>
                         <span className="text-[9px] text-zinc-500 font-mono uppercase">
                             Count: {1 + teamMembers.length} / {max}
                         </span>
                    </div>
                    
                    {teamMembers.map((member, idx) => (
                        <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-4 items-end animate-glitch-entry relative">
                            <div className="space-y-1">
                                <label className="text-[9px] text-zinc-500 uppercase font-mono">Team Member {idx + 1} Name</label>
                                <input 
                                    value={member.name}
                                    onChange={(e) => updateMember(idx, 'name', e.target.value)}
                                    className="w-full bg-black/50 border border-zinc-800 p-2 text-xs font-mono text-white focus:border-[#E661FF] outline-none"
                                    placeholder="OPERATIVE_NAME"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] text-zinc-500 uppercase font-mono">College ID</label>
                                <input 
                                    value={member.collegeId}
                                    onChange={(e) => updateMember(idx, 'collegeId', e.target.value)}
                                    className="w-full bg-black/50 border border-zinc-800 p-2 text-xs font-mono text-white focus:border-[#E661FF] outline-none"
                                    placeholder="ID_NUMBER"
                                />
                            </div>
                            {/* Remove Button - Only if above min allowed */}
                            {1 + teamMembers.length > min && (
                                <button 
                                    onClick={() => removeMember(idx)}
                                    className="h-8 w-8 flex items-center justify-center border border-zinc-800 text-zinc-500 hover:text-[#FF003C] hover:border-[#FF003C] transition-colors mb-[1px]"
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                    ))}

                    {/* Add Button */}
                    {1 + teamMembers.length < max && (
                        <button 
                            onClick={addMember}
                            className="w-full py-2 border border-dashed border-zinc-700 text-zinc-500 font-mono text-xs uppercase hover:text-[#E661FF] hover:border-[#E661FF] transition-all flex items-center justify-center gap-2"
                        >
                            + ADD_OPERATIVE
                        </button>
                    )}
                </div>


                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
                    <button 
                        onClick={handleCancel}
                        className="py-4 border border-zinc-700 text-zinc-400 hover:text-white hover:border-white transition-all font-mono font-bold uppercase tracking-widest text-sm"
                    >
                        ABORT
                    </button>
                    <button 
                        onClick={handleConfirm}
                        disabled={isRegistering}
                        className="py-4 bg-[#E661FF] text-black font-black font-mono tracking-widest hover:bg-white transition-all uppercase text-sm"
                    >
                        {isRegistering ? "UPLOADING..." : "CONFIRM_SQUAD"}
                    </button>
                </div>
            </div>

            {/* Footer Accent */}
             <div className="bg-zinc-900/50 p-2 text-[8px] font-mono text-zinc-600 flex justify-between">
              <span>LATENCY: 12ms</span>
              <span>NODE: SECURE</span>
            </div>
       </div>
    </div>
  );
}

export default function EventRegistrationPage() {
  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center p-4">
      <MatrixBackground color="#3b003b" text="" />
      
      <div className="relative z-10 w-full flex justify-center pt-20">
        <Suspense fallback={<div className="text-[#E661FF] font-mono">LOADING_DATA_STREAM...</div>}>
            <RegistrationContent />
        </Suspense>
      </div>
    </main>
  );
}
