"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
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
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchLangs = () => {
            fetch("/api/admin/languages")
                .then(r => r.json())
                .then(data => {
                    if (Array.isArray(data)) {
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

    const isForm = variant === "form";
    const isSettings = variant === "settings";

    /* ── position calculation for portal ── */
    const measurePosition = useCallback(() => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const dropdownHeight = Math.min(langs.length * 40 + 8, 248);
        const openAbove = spaceBelow < dropdownHeight && rect.top > spaceBelow;
        const minW = isSettings ? rect.width : Math.max(200, rect.width);

        setDropdownStyle({
            position: "fixed",
            width: isSettings ? rect.width : minW,
            ...(isSettings
                ? { left: rect.left }
                : { right: window.innerWidth - rect.right }),
            ...(openAbove
                ? { bottom: window.innerHeight - rect.top + 6 }
                : { top: rect.bottom + 6 }),
        });
    }, [langs.length, isSettings]);

    /* ── click-outside + ESC ── */
    useEffect(() => {
        if (!isOpen) return;
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
    }, [isOpen]);

    /* ── reposition on scroll/resize ── */
    useEffect(() => {
        if (!isOpen) return;
        const reposition = () => measurePosition();
        window.addEventListener("scroll", reposition, true);
        window.addEventListener("resize", reposition);
        return () => {
            window.removeEventListener("scroll", reposition, true);
            window.removeEventListener("resize", reposition);
        };
    }, [isOpen, measurePosition]);

    const toggle = () => {
        if (!isOpen) {
            measurePosition();
            setTimeout(() => setIsOpen(true), 0);
        } else {
            setIsOpen(false);
        }
    };

    const dropdownPanel = (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    style={dropdownStyle}
                    className="z-[9990] rounded-xl border border-white/[0.08] bg-[#0d0d12]/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
                >
                    <div className="py-1 max-h-60 overflow-y-auto admin-scrollbar">
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
                                            : "text-white/50 hover:text-white/90 hover:bg-white/[0.04]"
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5 overflow-hidden">
                                        <FlagIcon flagSvg={lang.flagSvg} size="xs" />
                                        <span className="truncate">{lang.nativeName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-mono uppercase tracking-wider ${isSelected ? "text-[#6b5be6]/50" : "text-white/10"}`}>
                                            {lang.code}
                                        </span>
                                        {isSelected && (
                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}>
                                                <Check size={12} className="text-[#6b5be6] shrink-0" />
                                            </motion.div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <div ref={ref} className={`relative shrink-0 ${isSettings ? "w-full" : isForm ? "min-w-[130px]" : "min-w-[100px]"} ${className}`}>
            {/* ── trigger ── */}
            <button
                type="button"
                onClick={toggle}
                className={`flex items-center justify-between rounded-xl font-black transition-all appearance-none cursor-pointer w-full group ${
                    isSettings || isForm
                        ? `bg-white/[0.03] border px-3 py-1.5 text-[12px] text-white/80 ${
                            isOpen ? "border-[#6b5be6]/40 shadow-[0_0_15px_rgba(107,91,230,0.08)]" : "border-white/[0.06] hover:border-white/[0.12]"
                          }`
                        : `gap-2 h-[42px] px-4 text-[11px] uppercase tracking-[0.2em] border backdrop-blur-md ${
                            isOpen
                                ? "bg-white/[0.06] border-white/[0.2] text-white"
                                : "bg-white/[0.04] border-white/[0.1] text-white/50 hover:text-white/80 hover:border-white/[0.2]"
                        }`
                }`}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <FlagIcon flagSvg={selected?.flagSvg} size="sm" />
                    <span className={`truncate ${isSettings || isForm ? "" : "hidden sm:inline"}`}>
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

            {/* ── portal dropdown ── */}
            {typeof document !== "undefined" && createPortal(dropdownPanel, document.body)}
        </div>
    );
}
