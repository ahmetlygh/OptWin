"use client";

import { motion } from "framer-motion";
import { Settings } from "lucide-react";

interface LoaderProps {
    size?: number;
    className?: string;
    text?: string;
    showDots?: boolean;
}

export function Loader({ 
    size = 48, 
    className = "", 
    text = "", 
    showDots = true 
}: LoaderProps) {
    return (
        <div className={`flex flex-col items-center justify-center gap-6 ${className}`}>
            <div className="relative">
                {/* Outer Glow */}
                <div className="absolute inset-0 bg-[#6b5be6]/15 blur-3xl rounded-full scale-[2.5]" />
                
                {/* Settings Spinner */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="relative z-10"
                >
                    <Settings 
                        size={size} 
                        className="text-[#6b5be6] opacity-80" 
                        strokeWidth={1.5} 
                    />
                </motion.div>

                {/* Pulse Disk */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="w-2 h-2 rounded-full bg-[#6b5be6] shadow-[0_0_20px_rgba(107,91,230,0.9)] animate-ping" />
                </div>
            </div>

            {/* Indicator */}
            <div className="flex flex-col items-center gap-3 relative z-10">
                {text && (
                    <span className="text-[11px] font-black text-white/30 tracking-[0.4em] uppercase italic">
                        {text}
                    </span>
                )}
                
                {showDots && (
                    <div className="flex gap-2">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                animate={{ 
                                    opacity: [0.3, 1, 0.3],
                                    scale: [0.8, 1.2, 0.8],
                                    y: [0, -2, 0]
                                }}
                                transition={{ 
                                    duration: 1.2, 
                                    repeat: Infinity, 
                                    delay: i * 0.15,
                                    ease: "easeInOut" 
                                }}
                                className="w-1 h-1 rounded-full bg-[#6b5be6]/60"
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
