"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

type LangOption = {
    code: string;
    flag: string;
    name: string;
};

const LANGUAGES: LangOption[] = [
    { code: "en", flag: "🇬🇧", name: "English" },
    { code: "tr", flag: "🇹🇷", name: "Türkçe" },
    { code: "zh", flag: "🇨🇳", name: "中文" },
    { code: "es", flag: "🇪🇸", name: "Español" },
    { code: "hi", flag: "🇮🇳", name: "हिन्दी" },
    { code: "de", flag: "🇩🇪", name: "Deutsch" },
    { code: "fr", flag: "🇫🇷", name: "Français" },
];

interface AdminLangPickerProps {
    value: string;
    onChange: (code: string) => void;
    availableLangs?: string[];
}

export function AdminLangPicker({ value, onChange, availableLangs }: AdminLangPickerProps) {
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

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-1.5 h-7 px-2 rounded-lg text-[11px] font-medium transition-all border ${
                    isOpen
                        ? "bg-white/[0.04] border-[#6b5be6]/25 text-white/70"
                        : "bg-white/[0.02] border-white/[0.04] text-white/40 hover:text-white/60 hover:border-white/[0.08]"
                }`}
            >
                <span className="text-sm leading-none">{selected?.flag}</span>
                <span className="uppercase tracking-wider">{selected?.code}</span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.15 }}
                >
                    <ChevronDown size={11} className="text-white/25" />
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.97 }}
                        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                        className="absolute z-[100] right-0 top-full mt-1 min-w-[140px] rounded-xl border border-white/[0.06] bg-[#0f0f18]/95 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden"
                    >
                        <div className="py-1">
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
                                        }`}
                                    >
                                        <span className="text-sm leading-none">{lang.flag}</span>
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
