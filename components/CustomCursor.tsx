"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

export default function CustomCursor() {
    const [isHovered, setIsHovered] = useState(false);
    const [isClicked, setIsClicked] = useState(false);

    // Mouse position state
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    // Spring configuration for trailing effect - Smoother lag
    const springConfig = { damping: 20, stiffness: 100, mass: 0.8 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
        };

        const handleMouseDown = () => setIsClicked(true);
        const handleMouseUp = () => setIsClicked(false);

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Check if hovering over clickable elements
            if (
                target.tagName.toLowerCase() === "a" ||
                target.tagName.toLowerCase() === "button" ||
                target.closest("a") ||
                target.closest("button") ||
                target.getAttribute("role") === "button" ||
                target.classList.contains("cursor-pointer")
            ) {
                setIsHovered(true);
            } else {
                setIsHovered(false);
            }
        };

        window.addEventListener("mousemove", moveCursor);
        window.addEventListener("mouseover", handleMouseOver);
        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", moveCursor);
            window.removeEventListener("mouseover", handleMouseOver);
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [cursorX, cursorY]);

    return (
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[99999] overflow-hidden hidden md:block mix-blend-difference">

            {/* 1. Core Target Dot (Immediate response) */}
            <motion.div
                className="fixed top-0 left-0 bg-[#00F0FF] rounded-full"
                style={{
                    x: cursorX,
                    y: cursorY,
                    translateX: "-50%",
                    translateY: "-50%",
                }}
                animate={{
                    width: isHovered ? 40 : 8,
                    height: isHovered ? 40 : 8,
                    opacity: isHovered ? 0.2 : 1,
                    scale: isClicked ? 0.8 : 1,
                }}
                transition={{ duration: 0.1, ease: "easeOut" }}
            />

            {/* 2. Rotating Tech Ring (Lagged trail) */}
            <motion.div
                className="fixed top-0 left-0 flex items-center justify-center border border-[#00F0FF]"
                style={{
                    x: cursorXSpring,
                    y: cursorYSpring,
                    translateX: "-50%",
                    translateY: "-50%",
                }}
                animate={{
                    width: isHovered ? 60 : 24,
                    height: isHovered ? 60 : 24,
                    borderRadius: isHovered ? "20%" : "50%", // Square-circle morph
                    rotate: isHovered ? 180 : 0,
                    borderColor: isHovered ? "#FF003C" : "#00F0FF",
                    borderWidth: isHovered ? "2px" : "1px",
                }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
                {/* Tech Crosshairs - Only visible on hover */}
                <AnimatePresence>
                    {isHovered && (
                        <>
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0 }}
                                className="absolute w-[120%] h-[1px] bg-[#FF003C]"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0 }}
                                className="absolute h-[120%] w-[1px] bg-[#FF003C]"
                            />
                            {/* Corner brackets */}
                            <motion.div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#FF003C]" />
                            <motion.div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#FF003C]" />
                            <motion.div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#FF003C]" />
                            <motion.div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#FF003C]" />
                        </>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* 3. Coordinate / Data Readout */}
            <motion.div
                className="fixed top-0 left-0 text-[10px] font-mono font-bold text-[#00F0FF] pointer-events-none whitespace-nowrap"
                style={{
                    x: cursorXSpring,
                    y: cursorYSpring,
                    translateX: "20px",
                    translateY: "20px",
                }}
                animate={{
                    opacity: isHovered ? 1 : 0,
                    color: isHovered ? "#FF003C" : "#00F0FF"
                }}
            >
                {isHovered ? "G_LOCK >>" : ""}
            </motion.div>
        </div>
    );
}
