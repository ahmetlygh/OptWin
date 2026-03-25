"use client";

import { motion } from "framer-motion";
import { Settings } from "lucide-react";

interface LoaderProps {
    size?: number;
    className?: string;
}

export function Loader({ size = 48, className = "" }: LoaderProps) {
    return (
        <div className={`flex flex-col items-center justify-center gap-6 ${className}`}>
            <div className="relative">
                {/* Outer Glow */}
                <div className="absolute inset-0 bg-[#6b5be6]/20 blur-2xl rounded-full scale-150 animate-pulse" />
                
                {/* Main Spinner */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="relative"
                >
                    <Settings 
                        size={size} 
                        className="text-[#6b5be6] opacity-80" 
                        strokeWidth={1.5} 
                    />
                </motion.div>

                {/* Inner Pulse */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#6b5be6] shadow-[0_0_15px_rgba(107,91,230,0.8)] animate-ping" />
                </div>
            </div>

            {/* Stable Loading Indicator */}
            <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-black text-white/20 tracking-[0.3em] uppercase italic">
                    OptWin Sistem Yükleniyor
                </span>
                <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{ 
                                opacity: [0.2, 0.8, 0.2],
                                scale: [1, 1.2, 1]
                            }}
                            transition={{ 
                                duration: 1.5, 
                                repeat: Infinity, 
                                delay: i * 0.2,
                                ease: "easeInOut" 
                            }}
                            className="w-1 h-1 rounded-full bg-[#6b5be6]/40"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
