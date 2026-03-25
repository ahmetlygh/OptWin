"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { TRFlag, USFlag, CNFlag, ESFlag, INFlag, DEFlag, FRFlag } from "@/components/shared/Flags";

type LangOption = {
    code: string;
    flag: React.ReactNode;
    name: string;
};

const LANGUAGES: LangOption[] = [
    { code: "tr", flag: <TRFlag className="w-4 h-3 rounded-sm" />, name: "Türkçe" },
    { code: "en", flag: <USFlag className="w-4 h-3 rounded-sm" />, name: "English" },
    { code: "zh", flag: <CNFlag className="w-4 h-3 rounded-sm" />, name: "中文" },
    { code: "es", flag: <ESFlag className="w-4 h-3 rounded-sm" />, name: "Español" },
    { code: "hi", flag: <INFlag className="w-4 h-3 rounded-sm" />, name: "हिन्दी" },
    { code: "de", flag: <DEFlag className="w-4 h-3 rounded-sm" />, name: "Deutsch" },
    { code: "fr", flag: <FRFlag className="w-4 h-3 rounded-sm" />, name: "Français" },
];

interface AdminLangPickerProps {
    value: string;
    onChange: (code: string) => void;
    availableLangs?: string[];
    variant?: "header" | "form";
    className?: string;
}

export function AdminLangPicker({ value, onChange, availableLangs, variant = "header", className = "" }: AdminLangPickerProps) {

    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const langs = availableLangs
        ? LANGUAGES.filter(l => availableLangs.includes(l.code))
        : LANGUAGES;

    const selected = langs.find(l => l.code === value) || langs[0];

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

    const isForm = variant === "form";

    return (
        <div ref={ref} className={`relative ${isForm ? "w-full" : ""} ${className}`}>

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between rounded-lg font-medium transition-all appearance-none cursor-pointer ${
                    isForm
                        ? "w-full bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.10] px-3 py-2 text-[13px] text-white/80"
                        : `gap-1.5 h-7 px-2 text-[11px] border ${
                            isOpen
                                ? "bg-white/[0.04] border-[#6b5be6]/25 text-white/70"
                                : "bg-white/[0.02] border-white/[0.04] text-white/40 hover:text-white/60 hover:border-white/[0.08]"
                        }`
                }`}
                style={isForm && isOpen ? { borderColor: "rgba(107,91,230,0.3)" } : {}}
            >
                <div className="flex items-center gap-2">
                    <span className="flex items-center leading-none">{selected?.flag}</span>
                    <span className={isForm ? "" : "uppercase tracking-wider"}>{isForm ? selected?.name : selected?.code}</span>
                </div>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.15 }}
                >
                    <ChevronDown size={isForm ? 14 : 11} className={isForm ? "text-white/50" : "text-white/25"} />
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.97 }}
                        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                        className={`absolute z-[100] mt-1 rounded-xl border border-white/[0.06] bg-[#0f0f18]/95 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden ${
                            isForm ? "w-full left-0 origin-top" : "right-0 top-full min-w-[140px]"
                        }`}
                    >
                        <div className="py-1 max-h-[220px] overflow-y-auto admin-scrollbar">
                            {langs.map((lang) => {
                                const isSelected = lang.code === value;
                                return (
                                    <button
                                        key={lang.code}
                                        type="button"
                                        onClick={() => {
                                            onChange(lang.code);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-[12px] transition-all duration-150 ${
                                            isSelected
                                                ? "text-[#6b5be6] bg-[#6b5be6]/[0.06]"
                                                : "text-white/50 hover:text-white/80 hover:bg-white/[0.04]"
                                        } ${isForm ? "py-2" : ""}`}
                                    >
                                        <span className="flex items-center leading-none">{lang.flag}</span>
                                        <span className="flex-1 text-left">{lang.name}</span>
                                        <span className="text-[10px] uppercase tracking-wider text-white/20">{lang.code}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
