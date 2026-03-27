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
        <div ref={ref} className={`relative shrink-0 ${isForm ? "min-w-[130px]" : "min-w-[70px]"} ${className}`}>

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between rounded-lg font-bold transition-all appearance-none cursor-pointer w-full group ${
                    isForm
                        ? `bg-white/[0.03] border px-3 py-1.5 text-[12px] text-white/80 ${
                            isOpen ? "border-[#6b5be6]/40 shadow-[0_0_15px_rgba(107,91,230,0.1)]" : "border-white/[0.08] hover:border-white/[0.15]"
                          }`
                        : `gap-2 h-7 px-2 text-[11px] border ${
                            isOpen
                                ? "bg-white/[0.04] border-[#6b5be6]/25 text-white/70"
                                : "bg-white/[0.02] border-white/[0.04] text-white/40 hover:text-white/60 hover:border-white/[0.08]"
                        }`
                }`}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <span className="flex items-center leading-none shrink-0">{selected?.flag}</span>
                    <span className={`truncate ${isForm ? "" : "uppercase tracking-widest text-[10px]"}`}>
                        {isForm ? selected?.name : selected?.code}
                    </span>
                </div>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2, ease: "circOut" }}
                    className="shrink-0 ml-1"
                >
                    <ChevronDown size={isForm ? 14 : 11} className={isForm ? "text-white/40 group-hover:text-white/60" : "text-white/20"} />
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className={`absolute z-[100] mt-1.5 rounded-xl border border-white/[0.08] bg-[#0f0f18]/98 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden min-w-[160px] ${
                            isForm ? "right-0 lg:left-0 origin-top" : "right-0 top-full origin-top-right"
                        }`}
                    >
                        <div className="py-1.5 max-h-[280px] overflow-y-auto admin-scrollbar">
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
                                        className={`w-full flex items-center justify-between gap-3 px-3.5 py-2 text-[12px] font-medium transition-all duration-150 ${
                                            isSelected
                                                ? "text-[#6b5be6] bg-[#6b5be6]/[0.08]"
                                                : "text-white/40 hover:text-white/80 hover:bg-white/[0.04]"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 overflow-hidden">
                                            <span className="flex items-center leading-none shrink-0">{lang.flag}</span>
                                            <span className="truncate">{lang.name}</span>
                                        </div>
                                        <span className={`text-[10px] font-mono uppercase tracking-wider ${isSelected ? "text-[#6b5be6]/50" : "text-white/10"}`}>
                                            {lang.code}
                                        </span>
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
