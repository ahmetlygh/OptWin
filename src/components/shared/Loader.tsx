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
        <div className={`flex flex-col items-center justify-center gap-8 ${className}`}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
            >
                {/* Dynamic Ambient Background Glows */}
                <motion.div 
                    animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.15, 0.25, 0.15],
                        rotate: [0, 90, 0]
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-[-40px] bg-[var(--accent-color)] blur-[50px] rounded-full" 
                />
                <motion.div 
                    animate={{ 
                        scale: [1.2, 1, 1.2],
                        opacity: [0.1, 0.2, 0.1],
                        rotate: [0, -90, 0]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-[-20px] bg-[#9333ea] blur-[40px] rounded-full" 
                />
                
                {/* Settings Spinner with Floating Motion */}
                <motion.div
                    animate={{ 
                        rotate: 360,
                        y: [-2, 2, -2]
                    }}
                    transition={{ 
                        rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                        y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="relative z-10 p-4 rounded-full bg-white/[0.03] border border-white/[0.05] backdrop-blur-md shadow-2xl"
                >
                    <Settings 
                        size={size} 
                        className="text-[var(--accent-color)] drop-shadow-[0_0_15px_rgba(107,91,230,0.5)]" 
                        strokeWidth={1.5} 
                    />
                </motion.div>
            </motion.div>

            {/* Indicator Text & Dots */}
            <div className="flex flex-col items-center gap-4 relative z-10">
                {text && (
                    <motion.span 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[10px] font-black text-white/40 tracking-[0.6em] uppercase text-center"
                    >
                        {text}
                    </motion.span>
                )}
                
                {showDots && (
                    <div className="flex gap-2.5">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                animate={{ 
                                    opacity: [0.3, 1, 0.3],
                                    scale: [0.8, 1.3, 0.8],
                                    backgroundColor: ["rgba(107,91,230,0.3)", "rgba(107,91,230,1)", "rgba(107,91,230,0.3)"]
                                }}
                                transition={{ 
                                    duration: 1.5, 
                                    repeat: Infinity, 
                                    delay: i * 0.2,
                                    ease: "easeInOut" 
                                }}
                                className="w-1.5 h-1.5 rounded-full"
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
