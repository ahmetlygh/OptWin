"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Moon, Sun, Check } from "lucide-react";

interface AdminThemePickerProps {
    value: string;
    onChange: (value: string) => void;
}

const themes = [
    { value: "dark", label: "Koyu Tema", icon: Moon, color: "text-indigo-400", activeBg: "bg-[#6b5be6]/10" },
    { value: "light", label: "Açık Tema", icon: Sun, color: "text-amber-400", activeBg: "bg-amber-500/10" },
];

export function AdminThemePicker({ value, onChange }: AdminThemePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    /* ── click-outside + ESC ── */
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
        };
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEsc);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEsc);
        };
    }, []);

    const current = themes.find(t => t.value === value) || themes[0];
    const CurrentIcon = current.icon;

    return (
        <div ref={ref} className="relative w-full">
            {/* ── trigger ── */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full h-9 px-3 flex items-center justify-between gap-2 rounded-xl text-sm transition-all duration-200 border ${
                    isOpen
                        ? "bg-white/4 border-[#6b5be6]/30 text-white/80 shadow-[0_0_15px_rgba(107,91,230,0.08)]"
                        : "bg-white/2 border-white/6 text-white/60 hover:border-white/10 hover:text-white/80"
                }`}
            >
                <div className="flex items-center gap-2">
                    <CurrentIcon size={14} className={current.color} />
                    <span className="font-medium truncate">{current.label}</span>
                </div>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={14} className="text-white/30 shrink-0" />
                </motion.div>
            </button>

            {/* ── dropdown panel ── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.96 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute z-9990 left-0 right-0 top-full mt-1.5 rounded-xl border border-white/8 bg-[#0d0d12]/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden py-1"
                    >
                        {themes.map((theme) => {
                            const isSelected = theme.value === value;
                            const Icon = theme.icon;
                            return (
                                <button
                                    key={theme.value}
                                    type="button"
                                    onClick={() => { onChange(theme.value); setIsOpen(false); }}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-[12px] font-medium transition-all duration-150 ${
                                        isSelected
                                            ? `${theme.activeBg} text-white`
                                            : "text-white/50 hover:bg-white/4 hover:text-white/80"
                                    }`}
                                >
                                    <div className={`p-1.5 rounded-md ${isSelected ? theme.activeBg : "bg-white/3"}`}>
                                        <Icon size={14} className={isSelected ? theme.color : "text-white/40"} />
                                    </div>
                                    <span className="flex-1 text-left">{theme.label}</span>
                                    {isSelected && (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}>
                                            <Check size={12} className="text-[#6b5be6] shrink-0" />
                                        </motion.div>
                                    )}
                                </button>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
