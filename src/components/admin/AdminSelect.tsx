"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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

// Global registry to close other selects
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
    const [openAbove, setOpenAbove] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const selectedOption = options.find(o => o.value === value);

    const measurePosition = useCallback(() => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const dropdownHeight = Math.min(options.length * 36 + 8, 248);
        setOpenAbove(spaceBelow < dropdownHeight && spaceAbove > spaceBelow);
    }, [options.length]);

    useEffect(() => {
        const closeFn = () => setIsOpen(false);
        globalCloseAll.push(closeFn);
        return () => {
            globalCloseAll = globalCloseAll.filter(fn => fn !== closeFn);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
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

    const positionCls = openAbove
        ? "bottom-full mb-1"
        : "top-full mt-1";

    const animY = openAbove ? 4 : -4;

    return (
        <div ref={ref} className={`relative ${className}`} id={id}>
            <button
                type="button"
                onClick={toggle}
                className={`w-full h-9 px-3 flex items-center justify-between gap-2 rounded-xl text-sm transition-all duration-200 border ${
                    isOpen
                        ? "bg-white/[0.04] border-[#6b5be6]/30 text-white/80"
                        : "bg-white/[0.02] border-white/[0.04] text-white/60 hover:border-white/[0.08]"
                }`}
            >
                <span className={`truncate ${!selectedOption ? "text-white/25" : ""}`}>
                    {selectedOption?.label || placeholder}
                </span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown size={14} className="text-white/30 shrink-0" />
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: animY, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: animY, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                        className={`absolute z-[100] left-0 right-0 ${positionCls} rounded-xl border border-white/[0.06] bg-[#0f0f18]/95 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden`}
                    >
                        <div className="max-h-[240px] overflow-y-auto py-1 custom-scrollbar">
                            {options.map((opt) => {
                                const isSelected = opt.value === value;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => handleSelect(opt.value)}
                                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-all duration-150 ${
                                            isSelected
                                                ? "text-[#6b5be6] bg-[#6b5be6]/[0.06]"
                                                : "text-white/60 hover:text-white/90 hover:bg-white/[0.04]"
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
        </div>
    );
}
