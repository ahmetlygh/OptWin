"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Moon, Sun } from "lucide-react";

interface AdminThemePickerProps {
    value: string;
    onChange: (value: string) => void;
}

export function AdminThemePicker({ value, onChange }: AdminThemePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const isDark = value === "dark";

    return (
        <div ref={ref} className="relative w-full">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full h-9 px-3 flex items-center justify-between gap-2 rounded-xl text-sm transition-all duration-200 border outline-none focus:ring-2 focus:ring-[#6b5be6]/30 focus:border-[#6b5be6]/50 ${
                    isOpen
                        ? "bg-[#6b5be6]/5 border-[#6b5be6]/30 text-white"
                        : "bg-white/[0.02] border-white/[0.04] text-white/60 hover:border-white/[0.08] hover:text-white/80"
                }`}
            >
                <div className="flex items-center gap-2">
                    {isDark ? (
                        <Moon size={14} className="text-indigo-400" />
                    ) : (
                        <Sun size={14} className="text-amber-400" />
                    )}
                    <span className="font-medium truncate">{isDark ? "Koyu Tema" : "Açık Tema"}</span>
                </div>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={14} className={isOpen ? "text-[#6b5be6]" : "text-white/30"} />
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute z-[100] left-0 right-0 top-full mt-1.5 rounded-xl border border-white/[0.06] bg-[#0f0f18]/95 backdrop-blur-xl shadow-2xl p-1"
                    >
                        <button
                            type="button"
                            onClick={() => { onChange("dark"); setIsOpen(false); }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group ${
                                isDark
                                    ? "bg-[#6b5be6]/10 text-white font-semibold"
                                    : "text-white/50 hover:bg-white/[0.03] hover:text-white/80"
                            }`}
                        >
                            <div className={`p-1.5 rounded-md ${isDark ? "bg-[#6b5be6]/20" : "bg-white/[0.03] group-hover:bg-white/[0.06]"}`}>
                                <Moon size={14} className={isDark ? "text-indigo-400" : "text-white/40"} />
                            </div>
                            <span className="flex-1 text-left">Koyu Tema</span>
                            {isDark && <motion.div layoutId="theme-active" className="w-1.5 h-1.5 rounded-full bg-[#6b5be6]" />}
                        </button>
                        
                        <button
                            type="button"
                            onClick={() => { onChange("light"); setIsOpen(false); }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 mt-1 group ${
                                !isDark
                                    ? "bg-amber-500/10 text-white font-semibold"
                                    : "text-white/50 hover:bg-white/[0.03] hover:text-white/80"
                            }`}
                        >
                            <div className={`p-1.5 rounded-md ${!isDark ? "bg-amber-500/20" : "bg-white/[0.03] group-hover:bg-white/[0.06]"}`}>
                                <Sun size={14} className={!isDark ? "text-amber-400" : "text-white/40"} />
                            </div>
                            <span className="flex-1 text-left">Açık Tema</span>
                            {!isDark && <motion.div layoutId="theme-active" className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
