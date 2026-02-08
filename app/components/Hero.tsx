"use client";

import { useEffect, useState } from "react";
import styles from "./Hero.module.scss";
import { SlotText } from "./SlotText";

export default function Hero({ onComplete }: { onComplete?: () => void }) {
  const [glitchActive, setGlitchActive] = useState(false);
  const [subtitleText, setSubtitleText] = useState("");
  const [subtitleText2, setSubtitleText2] = useState(""); // Second line
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showSubtitle2, setShowSubtitle2] = useState(false); // Second line visibility

  useEffect(() => {
    const timeoutIds: NodeJS.Timeout[] = [];
    const intervalIds: NodeJS.Timeout[] = [];
    
    // 1.0s: Type "SYSTEM OVERRIDE"
    timeoutIds.push(setTimeout(() => {
        const text1 = "SYSTEM OVERRIDE";
        let i = 0;
        setShowSubtitle(true);
        setSubtitleText("_");
        
        const int1: NodeJS.Timeout = setInterval(() => {
            setSubtitleText(text1.substring(0, i + 1) + "_");
            i++;
            if (i >= text1.length) clearInterval(int1);
        }, 30); // Slightly slower typing for better pacing
        intervalIds.push(int1);
    }, 1000) as unknown as NodeJS.Timeout);

    // 2.2s: Type "TAKING YOU TO TERMINAL"
    timeoutIds.push(setTimeout(() => {
        const text2 = "TAKING YOU TO TERMINAL";
        let i = 0;
        setShowSubtitle2(true);
        setSubtitleText2("_");
        setSubtitleText(prev => prev.replace("_", "")); 

        const int2: NodeJS.Timeout = setInterval(() => {
            setSubtitleText2(text2.substring(0, i + 1) + "_");
            i++;
            if (i >= text2.length) clearInterval(int2);
        }, 30); 
        intervalIds.push(int2);
    }, 2200) as unknown as NodeJS.Timeout); 

    // 4.5s: Complete
    timeoutIds.push(setTimeout(() => {
        if (onComplete) onComplete();
    }, 2800) as unknown as NodeJS.Timeout);


    // Random Glitch Effect Logic
    const triggerGlitch = () => {
      setGlitchActive(true);
      setTimeout(() => {
        setGlitchActive(false);
      }, Math.random() * 400 + 100);
      scheduleNext();
    };

    const scheduleNext = () => {
      const delay = Math.random() * 3000 + 2000;
      setTimeout(triggerGlitch, delay);
    };
    scheduleNext();

    return () => {
        timeoutIds.forEach(id => clearTimeout(id));
        intervalIds.forEach(id => clearInterval(id));
    };
  }, [onComplete]);

  const text = "ROBO RUMBLE 3.0";

  return (
    <section className="flex min-h-screen flex-col items-center justify-center relative overflow-hidden">
      <div className={styles.heroContainer}>
        <div className={`${styles.glitchText} ${glitchActive ? styles.violent : ''} flex flex-col items-center`}>
           {/* Mobile: Smaller text, Desktop: Larger text */}
           <SlotText text="ROBO RUMBLE" className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl text-center px-4" />
           <SlotText text="3.0" className="text-xl sm:text-2xl md:text-4xl lg:text-5xl text-center px-4 mt-2 font-light tracking-widest" />
        </div>
        
        {/* Subtitle Line 1 */}
        <div className="flex flex-col items-center mt-4 space-y-2 px-4">
            <p className={`text-sm sm:text-lg md:text-xl lg:text-2xl font-mono tracking-widest ${styles.subtitle} ${showSubtitle ? '' : 'opacity-0'} text-center`}>
            {subtitleText}
            </p>
            
            {/* Subtitle Line 2 */}
            <p className={`text-sm sm:text-lg md:text-xl lg:text-2xl font-mono tracking-widest ${styles.subtitle} ${showSubtitle2 ? '' : 'opacity-0'} text-center`}>
            {subtitleText2}
            </p>
        </div>
      </div>
    </section>
  );
}
