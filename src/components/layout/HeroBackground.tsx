"use client";

import { useEffect, useState, useRef } from "react";

export function HeroBackground() {
    const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
    const requestRef = useRef<number>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [isInside, setIsInside] = useState(false);

    const handleMouseMove = (e: MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();

        // Track raw pixels relative ONLY to the container itself
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Hide if outside the container boundaries
        const inside = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;

        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        
        requestRef.current = requestAnimationFrame(() => {
            setMousePos({ x, y });
            setIsInside(inside);
        });
    };

    useEffect(() => {
        // Listen globally but calculate locally
        window.addEventListener("mousemove", handleMouseMove);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    return (
        <div ref={containerRef} className="absolute inset-0 z-1 pointer-events-none overflow-hidden mix-blend-screen">
            {/* Ambient Mouse Follower */}
            <div 
                className="absolute left-0 top-0 w-[400px] h-[400px] rounded-full blur-[60px] transition-[transform,opacity] duration-500 ease-out will-change-transform"
                style={{
                    background: 'radial-gradient(circle, var(--accent-color) 0%, transparent 60%)',
                    transform: `translate3d(calc(${mousePos.x}px - 200px), calc(${mousePos.y}px - 200px), 0)`,
                    opacity: isInside ? 0.35 : 0
                }}
            />
            
            {/* Pulsing Mesh Layers */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-(--accent-color)/15 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }}></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[130px] animate-pulse" style={{ animationDuration: '12s' }}></div>
        </div>
    );
}
