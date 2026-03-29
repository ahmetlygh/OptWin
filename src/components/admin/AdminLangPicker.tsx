"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { FlagIcon } from "@/components/shared/FlagIcon";

interface AdminLangPickerProps {
    value: string;
    onChange: (code: string) => void;
    availableLangs?: string[];
    variant?: "header" | "form" | "settings";
    className?: string;
}

export function AdminLangPicker({ value, onChange, availableLangs, variant = "header", className = "" }: AdminLangPickerProps) {

    const [isOpen, setIsOpen] = useState(false);
    const [langs, setLangs] = useState<any[]>([]);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchLangs = () => {
            fetch("/api/admin/languages")
                .then(r => r.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        // Filter for active languages only (except for the main table)
                        let fetched = data.filter((l: any) => l.isActive);
                        
                        if (availableLangs && availableLangs.length > 0) {
                            fetched = fetched.filter((l: any) => availableLangs.includes(l.code));
                        }
                        setLangs(fetched);
                    }
                })
                .catch(() => {});
        };

        fetchLangs();

        window.addEventListener("optwin:languages-updated", fetchLangs);
        return () => window.removeEventListener("optwin:languages-updated", fetchLangs);
    }, [availableLangs]);

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
    const isSettings = variant === "settings";

    return (
        <div ref={ref} className={`relative shrink-0 ${isSettings ? "w-full" : isForm ? "min-w-[130px]" : "min-w-[70px]"} ${className}`}>

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between rounded-lg font-bold transition-all appearance-none cursor-pointer w-full group ${
                    isSettings || isForm
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
                    <FlagIcon flagSvg={selected?.flagSvg} size="xs" />
                    <span className={`truncate ${isSettings || isForm ? "" : "uppercase tracking-widest text-[10px]"}`}>
                        {selected ? (isSettings || isForm ? selected.nativeName : selected.code) : value}
                    </span>
                </div>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2, ease: "circOut" }}
                    className="shrink-0 ml-1"
                >
                    <ChevronDown size={isSettings || isForm ? 14 : 11} className={isSettings || isForm ? "text-white/40 group-hover:text-white/60" : "text-white/20"} />
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className={`absolute z-[999] mt-1.5 rounded-xl border border-white/[0.08] bg-[#0f0f18]/98 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden ${
                            isSettings ? "left-0 w-full origin-top" : isForm ? "right-0 min-w-[200px] origin-top-right" : "right-0 top-full min-w-[200px] origin-top-right"
                        }`}
                    >
                        <div className="py-2 max-h-60 overflow-y-auto overflow-x-hidden custom-scrollbar divide-y divide-white/[0.03]">
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
                                            <FlagIcon flagSvg={lang.flagSvg} size="xs" />
                                            <span className="truncate">{lang.nativeName}</span>
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
