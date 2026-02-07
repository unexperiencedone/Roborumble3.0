"use client";

import React, { useEffect, useRef } from 'react';

interface Props {
    color: string;
    text?: string;
}

const MatrixBackground: React.FC<Props> = ({ color, text }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        handleResize();
        window.addEventListener('resize', handleResize);

        const columns = Math.floor(canvas.width / 20);
        const drops: number[] = new Array(columns).fill(1);

        // Matrix characters (katakana + numbers + special chars)
        const characters = "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヂギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const charArray = characters.split("");

        const draw = () => {
            // Create trailing effect with semi-transparent black
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = color; // Use prop color
            ctx.font = '15px monospace';

            for (let i = 0; i < drops.length; i++) {
                const textChar = charArray[Math.floor(Math.random() * charArray.length)];
                ctx.fillText(textChar, i * 20, drops[i] * 20);

                // Reset drop to top randomly after it has crossed the screen
                if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }

                drops[i]++;
            }
        };

        const interval = setInterval(draw, 33);

        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', handleResize);
        };
    }, [color]);

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-black pointer-events-none">
            <canvas ref={canvasRef} className="block w-full h-full opacity-50" />
            {text && (
                <div
                    className="absolute bottom-4 right-4 font-mono text-xs font-bold tracking-widest opacity-80 uppercase"
                    style={{ color }}
                >
                    {text}
                </div>
            )}
        </div>
    );
};

export default MatrixBackground;
