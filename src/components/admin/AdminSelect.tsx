"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

type Option = {
    value: string;
    label: string;
};

interface AdminSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    id?: string;
}

/* ───────── global close registry — only one dropdown open at a time ───────── */
let globalCloseAll: (() => void)[] = [];

export function AdminSelect({
    options,
    value,
    onChange,
    placeholder = "Seçiniz...",
    className = "",
    id,
}: AdminSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
    const ref = useRef<HTMLDivElement>(null);
    const selectedOption = options.find(o => o.value === value);

    /* ── position calculation for portal ── */
    const measurePosition = useCallback(() => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const dropdownHeight = Math.min(options.length * 36 + 8, 248);
        const openAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

        setDropdownStyle({
            position: "fixed",
            left: rect.left,
            width: rect.width,
            ...(openAbove
                ? { bottom: window.innerHeight - rect.top + 6 }
                : { top: rect.bottom + 6 }),
        });
    }, [options.length]);

    /* ── global close registry ── */
    useEffect(() => {
        const closeFn = () => setIsOpen(false);
        globalCloseAll.push(closeFn);
        return () => {
            globalCloseAll = globalCloseAll.filter(fn => fn !== closeFn);
        };
    }, []);

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
            globalCloseAll.forEach(fn => fn());
            measurePosition();
            setTimeout(() => setIsOpen(true), 0);
        } else {
            setIsOpen(false);
        }
    };

    const handleSelect = (val: string) => {
        onChange(val);
        setIsOpen(false);
    };

    const dropdownPanel = (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                    style={dropdownStyle}
                    className="z-[9990] rounded-xl border border-white/[0.08] bg-[#0d0d12]/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
                >
                    <div className="max-h-[240px] overflow-y-auto py-1 admin-scrollbar">
                        {options.map((opt) => {
                            const isSelected = opt.value === value;
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => handleSelect(opt.value)}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-[12px] font-medium transition-all duration-150 ${
                                        isSelected
                                            ? "text-[#6b5be6] bg-[#6b5be6]/[0.08]"
                                            : "text-white/50 hover:text-white/90 hover:bg-white/[0.04]"
                                    }`}
                                >
                                    <span className="flex-1 text-left truncate">{opt.label}</span>
                                    {isSelected && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        >
                                            <Check size={13} className="text-[#6b5be6] shrink-0" />
                                        </motion.div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <div ref={ref} className={`relative ${className}`} id={id}>
            {/* ── trigger ── */}
            <button
                type="button"
                onClick={toggle}
                className={`w-full h-9 px-3 flex items-center justify-between gap-2 rounded-xl text-sm transition-all duration-200 border ${
                    isOpen
                        ? "bg-white/[0.04] border-[#6b5be6]/30 text-white/80 shadow-[0_0_15px_rgba(107,91,230,0.08)]"
                        : "bg-white/[0.02] border-white/[0.06] text-white/60 hover:border-white/[0.1] hover:text-white/80"
                }`}
            >
                <span className={`truncate ${!selectedOption ? "text-white/25" : ""}`}>
                    {selectedOption?.label || placeholder}
                </span>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={14} className="text-white/30 shrink-0" />
                </motion.div>
            </button>

            {/* ── portal dropdown ── */}
            {typeof document !== "undefined" && createPortal(dropdownPanel, document.body)}
        </div>
    );
}
